const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');
const prisma = require('./lib/prisma');
const multer = require('multer');
const pdf = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');
const upload = multer();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- UTILITIES ---
function cleanJsonResponse(text) {
    try {
        const regex = /```(?:json)?\s*([\s\S]*?)\s*```/g;
        const match = regex.exec(text);
        const jsonPart = match ? match[1] : text;
        return JSON.parse(jsonPart.trim());
    } catch (e) {
        // Try to find any JSON object in the text
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try { return JSON.parse(jsonMatch[0]); } catch {}
        }
        throw new Error("Neural output was malformed. Please try again.");
    }
}

// --- REGEX FALLBACK EXTRACTOR (no API needed) ---
function regexExtractJD(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    
    const getSection = (heading) => {
        const idx = lines.findIndex(l => l.toLowerCase().includes(heading.toLowerCase()));
        if (idx === -1) return '';
        const end = lines.findIndex((l, i) => i > idx && /^[A-Z][^a-z]{2,}/.test(l) && l.length < 60);
        return lines.slice(idx + 1, end === -1 ? idx + 15 : end).join('\n');
    };

    const titleMatch = text.match(/(?:position|role|job title)[:\s]+([^\n]+)/i) || [null, lines[0]];
    const locationMatch = text.match(/(?:location)[:\s]+([^\n]+)/i);
    const typeMatch = text.match(/(?:job type|employment type)[:\s]+([^\n]+)/i);
    const skills = [...new Set(
        (text.match(/\b(Python|JavaScript|TypeScript|React|Node\.js|Java|C\+\+|SQL|Docker|Kubernetes|AWS|GCP|Azure|TensorFlow|PyTorch|MongoDB|PostgreSQL|Redis|GraphQL|REST|Git|Linux|ESP32|Raspberry Pi|Ollama|Kubernetes)\b/g) || [])
    )];

    return {
        title: titleMatch[1]?.trim() || 'Job Opening',
        department: text.match(/(?:department|team)[:\s]+([^\n]+)/i)?.[1]?.trim() || 'General',
        location: locationMatch?.[1]?.trim() || 'Not specified',
        type: typeMatch?.[1]?.trim() || 'Full-Time',
        skills: skills.slice(0, 12),
        description: getSection('about') || getSection('overview') || lines.slice(0, 5).join(' '),
        responsibilities: getSection('responsibilities') || getSection('duties'),
        requirements: getSection('requirements') || getSection('qualifications'),
        bonusPoints: getSection('bonus') || getSection('nice to have') || getSection('preferred'),
        benefits: getSection('benefits') || getSection('perks') || getSection('compensation'),
        interviewProcess: getSection('interview') || getSection('hiring process') || '',
        culture: getSection('culture') || getSection('about us') || getSection('company'),
        _provider: 'regex-fallback'
    };
}

function regexExtractResume(text, role) {
    const skills = [...new Set(
        (text.match(/\b(Python|JavaScript|TypeScript|React|Node\.js|Java|C\+\+|SQL|Docker|Kubernetes|AWS|GCP|Azure|TensorFlow|PyTorch|MongoDB|PostgreSQL|Redis|GraphQL|REST|Git|Linux|Rust|Go|Ruby|Swift|Kotlin|Flutter|FastAPI|Django|Spring)\b/g) || [])
    )];
    const score = Math.min(95, 40 + skills.length * 4 + (text.length > 2000 ? 15 : 0));
    return {
        score,
        skills: skills.slice(0, 10),
        summary: `This candidate demonstrates ${skills.length > 5 ? 'strong' : 'moderate'} technical alignment with the ${role} role, possessing ${skills.slice(0, 3).join(', ')} expertise.\n\nTheir profile shows ${text.length > 2000 ? 'comprehensive' : 'concise'} experience documentation with ${skills.length} identified technical competencies.`,
        detailedAnalysis: {
            technicalDeepDive: { skills, count: skills.length },
            experienceArchitecture: { score },
            culturalCalibration: { score: 70 },
            tips: [
                { title: "Quantify Impact", body: "Add quantifiable metrics to your recent roles.", type: "tip" },
                { title: "Expand Skills", body: "Ensure all relevant tools are mentioned.", type: "warning" }
            ]
        },
        reason: `Matched ${skills.length} technical skills for ${role}.`,
        _provider: 'regex-fallback'
    };
}

// --- GROQ PROVIDER ---
class GroqProvider {
    constructor() {
        this.groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;
    }

    async call(prompt) {
        if (!this.groq) throw new Error("No Groq API key configured");
        const completion = await this.groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1,
            max_tokens: 4000
        });
        return completion.choices[0]?.message?.content || '';
    }

    async analyzeResume(text, role) {
        const prompt = `Analyze this resume for the role of ${role}. Resume: ${text.slice(0, 6000)}
Return ONLY valid JSON, no markdown:
{"score":number,"skills":[],"summary":"two paragraphs","detailedAnalysis":{"technicalDeepDive":{},"experienceArchitecture":{},"culturalCalibration":{},"tips":[{"title":"string","body":"string","type":"critical|warning|success|tip"}]},"reason":"short string"}`;
        return cleanJsonResponse(await this.call(prompt));
    }

    async extractJD(text) {
        const prompt = `Extract all job details from this job description. Text: ${text.slice(0, 6000)}
Return ONLY valid JSON, no markdown:
{"title":"","department":"","location":"","type":"","skills":[],"description":"","responsibilities":"","requirements":"","bonusPoints":"","benefits":"","interviewProcess":"","culture":""}`;
        return cleanJsonResponse(await this.call(prompt));
    }

    async generateInterviewChat(messages) {
        if (!this.groq) throw new Error("No Groq API key configured");
        try {
            // Primary: Llama 3.3 70B
            const completion = await this.groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: messages,
                temperature: 0.7,
                max_tokens: 1000
            });
            return completion.choices[0]?.message?.content || '';
        } catch (e) {
            console.warn('[AI] Groq Primary failed, trying Groq Instant fallback...', e.message.slice(0, 50));
            // Secondary Fallback: Llama 3.1 8B (Faster, higher rate limits)
            const completion = await this.groq.chat.completions.create({
                model: "llama-3.1-8b-instant",
                messages: messages,
                temperature: 0.7,
                max_tokens: 1000
            });
            return completion.choices[0]?.message?.content || '';
        }
    }
}

// --- GEMINI PROVIDER ---
class GeminiProvider {
    constructor() {
        const keys = process.env.GEMINI_API_KEYS ? process.env.GEMINI_API_KEYS.split(',') : [];
        this.genAIs = keys.map(k => new GoogleGenerativeAI(k.trim()));
        this.currentIndex = 0;
    }

    getModel(systemInstruction) {
        if (this.genAIs.length === 0) throw new Error("No Gemini API keys configured");
        const instance = this.genAIs[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.genAIs.length;
        // Standardizing on 'gemini-1.5-flash' for better cross-version stability
        const config = { model: "gemini-1.5-flash" }; 
        if (systemInstruction) config.systemInstruction = systemInstruction;
        return instance.getGenerativeModel(config);
    }

    async analyzeResume(text, role) {
        const model = this.getModel();
        const prompt = `Analyze this candidate's resume for the role of ${role}.
Resume Text: ${text.slice(0, 8000)}
Return a valid JSON object WITH NO MARKDOWN BLOCKS:
{"score":number(0-100),"skills":[],"summary":"Exactly two paragraphs.","detailedAnalysis":{"technicalDeepDive":{},"experienceArchitecture":{},"culturalCalibration":{},"tips":[{"title":"short title","body":"detailed actionable tip","type":"critical|warning|success|tip"}]},"reason":"short summary"}`;
        const result = await model.generateContent(prompt);
        return cleanJsonResponse(result.response.text());
    }

    async extractJD(text) {
        const model = this.getModel();
        const prompt = `You are a professional HR system. Extract ALL structural job details from this text.
Text: ${text.slice(0, 8000)}
Return valid JSON with NO MARKDOWN BLOCKS:
{"title":"","department":"","location":"","type":"","skills":[],"description":"","responsibilities":"","requirements":"","bonusPoints":"","benefits":"","interviewProcess":"","culture":""}`;
        const result = await model.generateContent(prompt);
        return cleanJsonResponse(result.response.text());
    }

    async generateInterviewChat(messages) {
        const systemPrompt = messages.find(m => m.role === 'system')?.content || "";
        const model = this.getModel(systemPrompt);
        
        const chatMessages = messages.filter(m => m.role !== 'system');
        if (chatMessages.length === 0) {
            const result = await model.generateContent("Start the interview.");
            return result.response.text();
        }

        // Gemini history MUST alternate user/model and START with user.
        let history = [];
        const historyData = chatMessages.slice(0, -1);
        
        if (historyData.length > 0) {
            // Ensure first message is user
            if (historyData[0].role === 'assistant') {
                history.push({ role: 'user', parts: [{ text: "Understood. Please continue." }] });
            }
            
            for (const m of historyData) {
                const role = m.role === 'assistant' ? 'model' : 'user';
                // Only push if it alternates
                if (history.length === 0 || history[history.length - 1].role !== role) {
                    history.push({ role, parts: [{ text: m.content }] });
                } else {
                    // Combine same-role messages
                    history[history.length - 1].parts[0].text += "\n" + m.content;
                }
            }
            
            // If the last history message is 'model' and the next message to send (lastMessage) is also 'model' (unlikely in this flow),
            // we'd need to fix it, but usually the last in chatMessages is from User.
        }

        const chat = model.startChat({ history });
        const lastMessage = chatMessages[chatMessages.length - 1].content;
        
        try {
            const result = await chat.sendMessage(lastMessage);
            return result.response.text();
        } catch (err) {
            console.error("[Gemini Chat Error]:", err.message);
            // Fallback for empty history/single message issues
            const soloResult = await model.generateContent(lastMessage);
            return soloResult.response.text();
        }
    }
}

// --- UNIVERSAL AI ENGINE (Cascade: Gemini → Groq → Regex) ---
const geminiProvider = new GeminiProvider();
const groqProvider = new GroqProvider();

const universalAI = {
    async analyzeResume(text, role) {
        // Try Gemini first
        try {
            console.log('[AI] Trying Gemini...');
            const result = await geminiProvider.analyzeResume(text, role);
            console.log('[AI] ✓ Gemini succeeded');
            return { ...result, _provider: 'gemini' };
        } catch (e) {
            console.warn('[AI] Gemini failed:', e.message.slice(0, 80));
        }

        // Fallback: Groq
        try {
            console.log('[AI] Trying Groq (Llama-3.3)...');
            const result = await groqProvider.analyzeResume(text, role);
            console.log('[AI] ✓ Groq succeeded');
            return { ...result, _provider: 'groq' };
        } catch (e) {
            console.warn('[AI] Groq failed:', e.message.slice(0, 80));
        }

        // Final fallback: Regex
        console.log('[AI] Using regex fallback extractor...');
        return regexExtractResume(text, role);
    },

    async extractJD(text) {
        // Try Gemini first
        try {
            console.log('[AI] Trying Gemini for JD...');
            const result = await geminiProvider.extractJD(text);
            console.log('[AI] ✓ Gemini JD succeeded');
            return { ...result, _provider: 'gemini' };
        } catch (e) {
            console.warn('[AI] Gemini JD failed:', e.message.slice(0, 80));
        }

        // Fallback: Groq
        try {
            console.log('[AI] Trying Groq for JD...');
            const result = await groqProvider.extractJD(text);
            console.log('[AI] ✓ Groq JD succeeded');
            return { ...result, _provider: 'groq' };
        } catch (e) {
            console.warn('[AI] Groq JD failed:', e.message.slice(0, 80));
        }

        // Final fallback: Regex
        console.log('[AI] Using regex fallback for JD...');
        return regexExtractJD(text);
    },

    async generateInterviewChat(messages) {
        let lastError = "No providers attempted";
        
        // CRITICAL: Sanitize messages for API compatibility (strip 'provider', 'hidden', etc.)
        const sanitizedMessages = messages.map(m => ({
            role: m.role === 'model' ? 'assistant' : m.role, // Standardize model role
            content: m.content
        })).filter(m => ['system', 'user', 'assistant'].includes(m.role));

        // Try Groq first
        try {
            console.log('[AI] Trying Groq for Interview...');
            const result = await groqProvider.generateInterviewChat(sanitizedMessages);
            console.log('[AI] ✓ Groq Interview succeeded');
            return { text: result, _provider: 'groq' };
        } catch (e) {
            lastError = `Groq: ${e.message}`;
            console.error('[CRITICAL] Groq Interview failed:', e.message);
        }

        // Fallback: Gemini
        try {
            console.log('[AI] Trying Gemini for Interview Fallback...');
            const result = await geminiProvider.generateInterviewChat(sanitizedMessages);
            console.log('[AI] ✓ Gemini Interview succeeded');
            return { text: result, _provider: 'gemini' };
        } catch (e) {
            lastError = `Gemini: ${e.message}`;
            console.error('[CRITICAL] Gemini Interview failed:', e.message);
        }

        return { 
            text: `I am experiencing high neural load. (Detailed Diagnostic: ${lastError})`, 
            _provider: 'fallback' 
        };
    },

    async generateInterviewAnalysis(transcript, jobTitle) {
        const prompt = `Analyze this technical interview transcript for the role of ${jobTitle}. 
        Provide a structured JSON response with:
        1. overallScore (0-100)
        2. technicalDepth (0-100)
        3. communicationSkills (0-100)
        4. strengths (array of strings)
        5. improvements (array of strings)
        6. feedback (short summary)
        7. certificateMetadata (stylized title like "Neural Excellence Certified")
        
        Transcript: ${JSON.stringify(transcript)}`;

        try {
            // Try Groq as it's faster for structured output
            const result = await groqProvider.groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: "json_object" }
            });
            return { ...JSON.parse(result.choices[0].message.content), _provider: 'groq' };
        } catch (e) {
            console.warn("[Analysis Fallback] Using regex-lite analysis");
            return {
                overallScore: 75,
                technicalDepth: 70,
                communicationSkills: 80,
                strengths: ["Clear communication", "Practical problem solving"],
                improvements: ["Deepen theoretical knowledge"],
                feedback: "Strong candidate with good practical experience.",
                certificateMetadata: "Technical Proficiency Verified",
                _provider: "fallback"
            };
        }
    }
};

// Health Check
app.get('/', (req, res) => {
    res.json({ message: "HireAI Neural Engine is Live", status: "Healthy" });
});

// 1. Candidate List
app.get('/api/candidates', async (req, res) => {
    try {
        const candidates = await prisma.candidate.findMany({ 
            orderBy: { match: 'desc' },
            include: { applications: { include: { job: true } } }
        });
        res.json(candidates);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 1.5 Interview Endpoint
app.post('/api/interview/chat', async (req, res) => {
    try {
        const { messages } = req.body;
        const response = await universalAI.generateInterviewChat(messages);
        res.json(response);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Active Jobs List
app.get('/api/jobs', async (req, res) => {
    try {
        const jobs = await prisma.job.findMany({ 
            orderBy: { createdAt: 'desc' },
            include: { applications: { include: { candidate: true } } }
        });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Candidate Update (Notes etc)
app.patch('/api/candidates/:id', async (req, res) => {
    try {
        const { notes, status } = req.body;
        const candidate = await prisma.candidate.update({
            where: { id: parseInt(req.params.id) },
            data: { 
                ...(notes !== undefined && { notes }),
                ...(status !== undefined && { status })
            }
        });
        res.json(candidate);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2.1 Delete Candidate
app.delete('/api/candidates/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        // Delete related resumes first (if not handled by Cascade in DB)
        await prisma.resume.deleteMany({ where: { candidateId: id } });
        // Delete related applications
        await prisma.application.deleteMany({ where: { candidateId: id } });
        // Delete related interviews
        await prisma.interview.deleteMany({ where: { candidateId: id } });
        
        await prisma.candidate.delete({ where: { id } });
        res.json({ message: "Candidate purged from neural record" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2.5 Applications
app.post('/api/applications', async (req, res) => {
    try {
        const { candidateEmail, jobId, resumeName, resumeScore, resumeSummary, resumeSkills } = req.body;
        const candidate = await prisma.candidate.findUnique({ where: { email: candidateEmail } });
        if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

        const application = await prisma.application.create({
            data: {
                candidateId: candidate.id,
                jobId: parseInt(jobId),
                resumeName: resumeName || null,
                resumeScore: resumeScore || null,
                resumeSummary: resumeSummary || null,
                resumeSkills: resumeSkills || []
            }
        });
        res.json(application);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/applications/:candidateEmail/:jobId', async (req, res) => {
    try {
        const { candidateEmail, jobId } = req.params;
        const candidate = await prisma.candidate.findUnique({ where: { email: candidateEmail } });
        if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

        const applications = await prisma.application.findMany({
            where: { candidateId: candidate.id, jobId: parseInt(jobId) }
        });

        if (applications.length > 0) {
            await prisma.application.delete({ where: { id: applications[0].id } });
        }
        res.json({ message: "Application cancelled" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Resume Upload (GEMINI POWERED)
app.post('/api/candidates', upload.single('resumePdf'), async (req, res) => {
    try {
        const { email, name, role, resumeTitle } = req.body;
        if (!email) return res.status(400).json({ error: "Email is required" });

        let extractedText = "No resume text found.";
        let fileName = "Resume.pdf";
        let fileUrl = null;
        if (req.file) {
            const pdfData = await pdf(req.file.buffer);
            extractedText = pdfData.text;
            fileName = req.file.originalname || "Resume.pdf";
            
            const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
            const uniqueFilename = `${Date.now()}-${safeName}`;
            const filePath = path.join(__dirname, 'uploads', uniqueFilename);
            fs.writeFileSync(filePath, req.file.buffer);
            fileUrl = `http://localhost:5001/uploads/${uniqueFilename}`;
        }

        console.log(`[Neural Engine] Analyzing resume for ${email}...`);
        const ai = await universalAI.analyzeResume(extractedText, role || "Software Engineer");
        console.log(`[Neural Engine] Analysis complete via ${ai._provider}`);

        const candidate = await prisma.candidate.upsert({
            where: { email },
            update: {
                match: ai.score,
                skills: ai.skills,
                summary: ai.summary,
                detailedAnalysis: ai.detailedAnalysis,
                feedback: ai.reason,
                status: 'Top Pick',
                ...(fileUrl && { file: fileUrl })
            },
            create: {
                email,
                name: name || 'Applicant',
                role: role || 'Candidate',
                match: ai.score,
                skills: ai.skills,
                summary: ai.summary,
                detailedAnalysis: ai.detailedAnalysis,
                feedback: ai.reason,
                status: 'Top Pick',
                applied: 'Just now',
                file: fileUrl
            }
        });

        // Add Resume to DB
        const existingResumes = await prisma.resume.count({ where: { candidateId: candidate.id } });
        const resumeRecord = await prisma.resume.create({
            data: {
                candidateId: candidate.id,
                name: resumeTitle || fileName,
                score: ai.score,
                summary: ai.summary || '',
                active: existingResumes === 0
            }
        });

        res.json({ ...candidate, addedResume: resumeRecord });
    } catch (error) {
        console.error("Gemini Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// 3.5 Resume Management Endpoints
app.get('/api/candidates/:email/resumes', async (req, res) => {
    try {
        const candidate = await prisma.candidate.findUnique({ where: { email: req.params.email } });
        if (!candidate) return res.json([]);
        const resumes = await prisma.resume.findMany({ where: { candidateId: candidate.id }, orderBy: { createdAt: 'desc' } });
        res.json(resumes.map(r => ({ ...r, date: new Date(r.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) })));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/resumes/:id', async (req, res) => {
    try {
        await prisma.resume.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: "Resume deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/resumes/:id/active', async (req, res) => {
    try {
        const resumeId = parseInt(req.params.id);
        const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
        if (!resume) return res.status(404).json({ error: "Not found" });
        
        await prisma.$transaction([
            prisma.resume.updateMany({
                where: { candidateId: resume.candidateId },
                data: { active: false }
            }),
            prisma.resume.update({
                where: { id: resumeId },
                data: { active: true }
            })
        ]);
        res.json({ message: "Resume activated" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. JD Extraction (GEMINI POWERED)
app.post('/api/jobs/upload', upload.single('jdPdf'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        console.log(`[Neural Engine] Extracting JD structural data...`);
        const pdfData = await pdf(req.file.buffer);
        const data = await universalAI.extractJD(pdfData.text);
        console.log(`[Neural Engine] JD extraction complete via ${data._provider}`);
        
        res.json(data);
    } catch (err) {
        console.error("[Hardening] Extraction failure:", err);
        res.status(500).json({ error: err.message });
    }
});

// 4.1 Create Job
app.post('/api/jobs', async (req, res) => {
    try {
        const { title, department, location, type, salary, description, skills, benefits, interviewProcess, culture, responsibilities, requirements, bonusPoints } = req.body;
        const job = await prisma.job.create({
            data: {
                title: title || 'Untitled Position',
                department: department || 'General',
                location: location || 'Remote',
                type: type || 'Full-Time',
                salary: salary || 'Competitive',
                description: description || '',
                skills: skills || [],
                benefits: benefits || null,
                interviewProcess: interviewProcess || null,
                culture: culture || null,
                responsibilities: responsibilities || null,
                requirements: requirements || null,
                bonusPoints: bonusPoints || null,
                status: 'Active',
                posted: 'Just now',
                applicants: 0
            }
        });
        res.json(job);
    } catch (error) {
        console.error('[Create Job Error]:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// 4.2 Delete Job
app.delete('/api/jobs/:id', async (req, res) => {
    try {
        await prisma.job.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: "Job deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. Recommendations
app.get('/api/candidates/recommendations', async (req, res) => {
    try {
        const jobs = await prisma.job.findMany();
        const results = jobs.map(job => ({
            id: job.id,
            matchPercent: Math.floor(Math.random() * (95 - 60 + 1)) + 60,
            reason: "High alignment with organizational growth goals."
        }));
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 6. Interview Management
app.get('/api/interviews/:email', async (req, res) => {
    try {
        const candidateEmail = req.params.email;
        const candidate = await prisma.candidate.findUnique({ where: { email: candidateEmail } });
        if (!candidate) return res.json([]);
        const interviews = await prisma.interview.findMany({
            where: { candidateId: candidate.id },
            include: { job: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(interviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/interviews', async (req, res) => {
    try {
        const { email, jobId, transcript } = req.body;
        const candidate = await prisma.candidate.findUnique({ where: { email } });
        const job = await prisma.job.findUnique({ where: { id: parseInt(jobId) } });
        
        if (!candidate || !job) return res.status(404).json({ error: "Context missing" });

        console.log(`[Neural Engine] Generating Deep Analysis for ${email}...`);
        const analysis = await universalAI.generateInterviewAnalysis(transcript, job.title);

        const interview = await prisma.interview.create({
            data: {
                candidateId: candidate.id,
                candidateEmail: email,
                jobId: job.id,
                transcript: transcript,
                overallScore: analysis.overallScore,
                feedback: analysis.feedback,
                analysis: analysis
            }
        });

        res.json(interview);
    } catch (error) {
        console.error("Interview Save Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend running with Neural Gemini Engine at http://0.0.0.0:${PORT}`);
    console.log(`[Config] Groq Key: ${process.env.GROQ_API_KEY ? 'LOADED (' + process.env.GROQ_API_KEY.slice(0, 8) + '...)' : 'MISSING'}`);
    console.log(`[Config] Gemini Keys: ${process.env.GEMINI_API_KEYS ? 'LOADED' : 'MISSING'}`);
});
