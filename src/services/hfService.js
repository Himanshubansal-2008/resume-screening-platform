/**
 * Service to interact with Hugging Face Inference API
 */

const HF_TOKEN = import.meta.env.VITE_HF_TOKEN;
const MODEL_ID = "zai-org/GLM-5.1-FP8:zai-org";
const API_URL = "https://router.huggingface.co/v1/chat/completions";

export const queryAI = async (messages) => {
    console.log("Querying AI with token:", HF_TOKEN ? "Present (Starts with " + HF_TOKEN.slice(0, 4) + ")" : "Missing");
    if (!HF_TOKEN) {
        throw new Error("Hugging Face token is missing in environment variables. Please restart your dev server after adding it to .env.");
    }

    try {
        const response = await fetch(API_URL, {
            headers: {
                Authorization: `Bearer ${HF_TOKEN}`,
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
                model: MODEL_ID,
                messages: messages,
                max_tokens: 500,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `API responded with status ${response.status}`);
        }

        const result = await response.json();
        console.log("AI Response full result:", result);
        
        if (!result.choices || result.choices.length === 0) {
            throw new Error("AI returned empty choices. Please try a different prompt or check model availability.");
        }
        
        const message = result.choices[0].message;
        if (!message || (!message.content && !message.reasoning_content)) {
            throw new Error("AI returned a response with no content or reasoning.");
        }
        
        return message;
    } catch (error) {
        console.error("AI Query Error:", error);
        throw error;
    }
};


export const getSystemPrompt = (candidate) => {
    if (!candidate) {
        return "You are HireAI Copilot, a helpful recruitment assistant. Help the user screen resumes, compare candidates, and generate interview questions.";
    }

    return `You are HireAI Copilot. You are currently analyzing ${candidate.name}, a ${candidate.role}. 
Candidate Background: ${candidate.summary}
Key Skills: ${candidate.skills.join(", ")}
AI Match Score: ${candidate.match}%

Your goal is to provide deep insights about this specific candidate. When asked about them, use this specific data to answer. If the user asks general questions, prioritize this candidate's context.`;
};
