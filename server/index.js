const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

const prisma = require('./lib/prisma');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Main Data Endpoints
app.get('/api/candidates', async (req, res) => {
    try {
        const candidates = await prisma.candidate.findMany({
            include: { applications: true },
            orderBy: { match: 'desc' }
        });
        res.json(candidates);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/jobs', async (req, res) => {
    try {
        const jobs = await prisma.job.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/jobs', async (req, res) => {
    try {
        const { title, department, location, type, salary, status, description, skills } = req.body;
        const newJob = await prisma.job.create({
            data: {
                title,
                department,
                location,
                type,
                salary: salary || 'TBD',
                status: status || 'Active',
                description,
                skills,
                posted: 'Just now'
            }
        });
        res.json(newJob);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/jobs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.job.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: "Job deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Retro-compatible endpoint for Google Sheets sync simulation
app.get('/api/gsheets/candidates', async (req, res) => {
    try {
        const candidates = await prisma.candidate.findMany();
        res.json(candidates);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ingestion endpoint
app.post('/api/candidates/ingest', async (req, res) => {
    try {
        const { name, fileName, role = 'Applicant' } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: "Candidate name is required" });
        }

        // Generate simulated AI results
        const matchScore = Math.floor(Math.random() * (98 - 75 + 1)) + 75; // 75-98%
        const skills = ['React', 'JavaScript', 'Problem Solving', 'System Design'];
        const summary = `${name} is a strong ${role} candidate with deep technical expertise. AI analysis suggests high alignment with core competencies.`;

        const newCandidate = await prisma.candidate.create({
            data: {
                name,
                role,
                match: matchScore,
                status: 'Initial Screen',
                applied: 'Just now',
                skills: skills.slice(0, 3 + Math.floor(Math.random() * 2)), // 3-4 random skills
                summary,
                file: fileName || null
            }
        });

        res.json(newCandidate);
    } catch (error) {
        console.error("Ingestion error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Seed endpoint - for development
app.post('/api/seed', async (req, res) => {
    try {
        // Candidates
        await prisma.candidate.createMany({
            data: [
                { name: 'Alex Rivera', role: 'Senior React Developer', match: 92, status: 'Top Pick', skills: ['React', 'TypeScript', 'Node.js'], applied: '2 days ago', summary: 'Senior Frontend Architect with 8+ years of experience in React and TypeScript.' },
                { name: 'Sarah Chen', role: 'Backend Engineer', match: 86, status: 'Strong Match', skills: ['Python', 'PostgreSQL', 'Docker'], applied: '1 week ago', summary: 'Heavy-lifting backend specialist focused on scalable Node.js services and PostgreSQL optimization.' },
                { name: 'Marcus Thorne', role: 'Solutions Architect', match: 78, status: 'Initial Screen', skills: ['AWS', 'Terraform', 'Go'], applied: '3 days ago', summary: 'Strategic thinker with a background in cloud-native solutions.' },
                { name: 'Elena Rodriguez', role: 'Frontend Lead', match: 95, status: 'Shortlisted', skills: ['Vue', 'Redux', 'D3.js'], applied: '4 hours ago', summary: 'Design-centric engineer with 6 years experience in building accessible web applications.' },
                { name: 'David Miller', role: 'Product Manager', match: 94, status: 'Shortlisted', skills: ['Product Strategy', 'Agile', 'SQL'], applied: '5 days ago', summary: 'Product veteran with a technical edge.' }
            ]
        });

        // Jobs
        await prisma.job.createMany({
            data: [
                { title: 'Senior React Developer', department: 'Engineering', location: 'Remote', type: 'Full-Time', salary: '$120k - $160k', posted: '2 days ago', applicants: 48, status: 'Active', description: 'Lead our frontend architecture.', skills: ['React', 'TypeScript', 'Node.js'] },
                { title: 'Backend Engineer', department: 'Engineering', location: 'Bangalore, IN', type: 'Full-Time', salary: '₹18L - ₹28L', posted: '5 days ago', applicants: 112, status: 'Active', description: 'Design robust APIs.', skills: ['Python', 'PostgreSQL', 'Docker'] }
            ]
        });

        res.json({ message: "Database seeded successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
