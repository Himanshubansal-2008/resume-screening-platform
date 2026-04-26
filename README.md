# HireAI - AI-Powered Resume Screening & Interview Platform

HireAI is a cutting-edge recruitment platform that leverages advanced AI to automate resume screening, job description analysis, and technical interview simulations. Built with a robust multi-model AI engine, it ensures high-accuracy candidate matching and evaluation.

![HireAI Banner](https://img.shields.io/badge/HireAI-Recruitment_Revolution-blueviolet?style=for-the-badge&logo=probot)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)

## 🚀 Features

### ✨ Visual Excellence
- **Cyber Horizon Design System**: A bespoke HSL-based design system optimized for both performance and aesthetics.
- **Cinematic Experience**: Immersive login and loading sequences with plasma backgrounds and neural scanning animations.
- **Glassmorphism UI**: Premium frosted-glass cards and modals using advanced CSS backdrop filters.
- **Adaptive Theming**: Seamless transition between "Cyber Dark" and "Horizon Light" modes.

### For Recruiters (Admin)
- **AI Resume Database**: Intelligent search and filtering of candidates based on AI-calculated match scores.
- **JD Analyzer**: Automatically extract structured data (skills, responsibilities, requirements) from raw job description text.
- **Recruiter AI Assistant**: A dedicated chatbot to help analyze candidate trends and job market alignment.
- **Candidate Management**: Track application statuses from "Top Pick" to "Hired".

### For Candidates
- **Smart Job Board**: View job openings with real-time matching indicators based on your profile.
- **AI Resume Analysis**: Instant feedback on resumes, including skill extraction, summary generation, and actionable improvement tips.
- **Technical Interview Simulation**: Practice with "HireAI", a strict AI interviewer that conducts realistic technical evaluations and provides detailed performance grading.
- **Interview Hub**: Dedicated space for interview preparation and historical performance tracking.

## 🧠 Neural Engine (Multi-Model Architecture)

HireAI uses a sophisticated "Cascade" AI strategy to ensure 100% uptime and high-quality results:
1.  **Gemini 1.5 Flash**: Primary engine for deep resume analysis and JD extraction.
2.  **Groq (Llama 3.3-70B)**: High-speed engine for real-time interview simulations and grading.
3.  **Regex Fallback**: Lightweight local processing to ensure basic functionality even during API outages.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Framer Motion (Animations), Lucide React (Icons), Clerk (Authentication).
- **Backend**: Node.js, Express, Multer (File Handling), PDF-Parse.
- **Database**: Supabase (PostgreSQL) via Prisma ORM.
- **AI Integration**: Google Generative AI SDK, Groq SDK.

## 📋 Prerequisites

- Node.js (v18 or higher)
- Supabase Account (PostgreSQL)
- Clerk Account (Authentication)
- API Keys for Google Gemini and Groq

## ⚙️ Setup & Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/Himanshubansal-2008/resume-screening-platform.git
    cd resume-screening-platform
    ```

2.  **Install Dependencies**
    ```bash
    # Install frontend dependencies
    npm install

    # Install server dependencies
    cd server
    npm install
    cd ..
    ```

3.  **Environment Variables**
    Create a `.env` file in the root directory (and `server/` directory if needed) with the following:
    ```env
    # Auth
    VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
    
    # AI Keys
    GEMINI_API_KEYS=key1,key2
    GROQ_API_KEY=your_groq_key
    
    # Database
    DATABASE_URL=your_postgresql_url
    
    # Supabase
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_key
    
    # API
    VITE_API_URL=http://localhost:5001
    ```

4.  **Database Migration**
    ```bash
    cd server
    npx prisma generate
    npx prisma db push
    cd ..
    ```

5.  **Run the Application**
    ```bash
    # Run both frontend and backend concurrently
    npm run dev
    ```

## 📂 Project Structure

```text
├── server/               # Express backend
│   ├── index.js          # Main API entry & AI Engine
│   ├── prisma/           # Database schema
│   ├── uploads/          # Temporary resume storage
│   └── lib/              # Shared utilities
├── src/                  # React frontend
│   ├── components/       # UI Components (Admin/Candidate)
│   ├── services/         # API & Auth services
│   ├── App.jsx           # Routing & Layout
│   └── index.css         # Global styles & Design system
└── public/               # Static assets
```

---
Built with ❤️ by Zenith
