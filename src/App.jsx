import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  LayoutDashboard, 
  Database,
  Search, 
  Settings, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  MessageSquare,
  Plus,
  ShieldCheck,
  HelpCircle,
  Cpu,
  Send,
  ExternalLink,
  ChevronRight,
  ClipboardList,
  Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SignedIn, 
  SignedOut, 
  SignInButton, 
  UserButton,
  useUser,
  useAuth
} from '@clerk/clerk-react';

import AdminDashboard from './components/admin/AdminDashboard';
import AdminResumeDatabase from './components/admin/AdminResumeDatabase';
import AdminJobDescriptions from './components/admin/AdminJobDescriptions';
import AIChatbotSidebar from './components/admin/AIChatbotSidebar';
import CandidateSubmit from './components/candidate/CandidateSubmit';
import CandidatePrepHub from './components/candidate/CandidatePrepHub';
import CandidateSimulation from './components/candidate/CandidateSimulation';

const ADMIN_EMAILS = ["himanshubansal1803@gmail.com", "nikhiltelkar19@gmail.com", "hartejsinghsandhu2806@gmail.com"];

const API_BASE_URL = "http://localhost:5001/api";

const DashboardShell = ({ role, activeTab, setActiveTab, user, onOpenChat, candidates, jobs, onRefresh }) => {
  const isAdmin = role === 'admin';

  return (
    <div className="app-container" style={{ background: 'var(--canvas-bg)' }}>
      <aside className="sidebar" style={{ background: '#0a0f1d' }}>
        <div className="brand" style={{ marginBottom: '3.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', background: '#3b82f6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(59, 130, 246, 0.4)' }}>
            <Cpu size={24} color="white" />
          </div>
          <h2 className="brand-font" style={{ color: 'white', fontSize: '1.6rem', letterSpacing: '-0.04em' }}>HireAI</h2>
        </div>
        
        <nav style={{ flex: 1 }}>
          <div style={{ color: '#4b5563', fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.12em', marginBottom: '1.25rem', textTransform: 'uppercase' }}>
            Platform Sections
          </div>
          {isAdmin ? (
            <>
              <button className={`nav-item-pro ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                <LayoutDashboard size={20} /> <span>Admin Overview</span>
              </button>
              <button className={`nav-item-pro ${activeTab === 'database' ? 'active' : ''}`} onClick={() => setActiveTab('database')}>
                <Database size={20} /> <span>Resume Database</span>
              </button>
              <button className={`nav-item-pro ${activeTab === 'jobs' ? 'active' : ''}`} onClick={() => setActiveTab('jobs')}>
                <ClipboardList size={20} /> <span>Job Descriptions</span>
              </button>
              <button className={`nav-item-pro ${activeTab === 'ingestion' ? 'active' : ''}`} onClick={() => setActiveTab('ingestion')}>
                <FileText size={20} /> <span>Data Ingestion</span>
              </button>
              <button className={`nav-item-pro`} onClick={onOpenChat} style={{ marginTop: '1rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                <Bot size={20} /> <span>AI Copilot</span>
              </button>
            </>
          ) : (
            <>
              <button className={`nav-item-pro ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                <LayoutDashboard size={20} /> <span>Evaluation Status</span>
              </button>
              <button className={`nav-item-pro ${activeTab === 'prephub' ? 'active' : ''}`} onClick={() => setActiveTab('prephub')}>
                <HelpCircle size={20} /> <span>Interview Prep Hub</span>
              </button>
              <button className={`nav-item-pro ${activeTab === 'mockbot' ? 'active' : ''}`} onClick={() => setActiveTab('mockbot')}>
                <MessageSquare size={20} /> <span>Simulation Arena</span>
              </button>
              <button className={`nav-item-pro ${activeTab === 'submit' ? 'active' : ''}`} onClick={() => setActiveTab('submit')}>
                <FileText size={20} /> <span>Submission Portal</span>
              </button>
            </>
          )}
        </nav>

        <div className="ethical-guardrail-pro" style={{ background: 'rgba(255, 241, 242, 0.05)', border: '1px solid rgba(254, 202, 202, 0.1)', color: '#fca5a5' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <ShieldCheck size={28} style={{ flexShrink: 0, color: '#f87171' }} />
            <div>
              <strong style={{ color: '#f87171', display: 'block', marginBottom: '4px', fontSize: '0.8rem' }}>Ethical AI Guardrail:</strong>
              <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>Final hiring decisions are strictly made by the Admin team following human oversight.</span>
            </div>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '20px', display: 'flex', alignItems: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
          <UserButton showName appearance={{ 
            elements: { 
              userButtonBox: { flexDirection: 'row-reverse', gap: '10px' }, 
              userButtonOuterIdentifier: { color: 'white', fontSize: '0.9rem', fontWeight: '600' } 
            } 
          }} />
        </div>
      </aside>

      <main className="main-content">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3.5rem' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
               {!isAdmin && (
                 <>
                    <div className="pill-capsule" style={{ background: '#eff6ff', color: '#3b82f6' }}>Candidate Dashboard</div>
                    <div className="pill-capsule" style={{ background: '#dcfce7', color: '#166534' }}>Top 15% Applicant</div>
                 </>
               )}
            </div>
            <h1 style={{ fontSize: '3rem', fontWeight: '800', color: 'white', letterSpacing: '-0.04em' }}>
              {isAdmin ? 'Recruiter Hub' : `Hey ${user?.firstName}!`}
            </h1>
          </div>
          
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%' }}></div>
            <span style={{ fontWeight: '700', fontSize: '0.75rem', color: 'white' }}>AI ENGINE LIVE</span>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {isAdmin ? (
               activeTab === 'dashboard' ? <AdminDashboard candidates={candidates} /> : 
               activeTab === 'database' ? <AdminResumeDatabase candidates={candidates} onOpenChat={onOpenChat} /> :
               activeTab === 'jobs' ? <AdminJobDescriptions jobs={jobs} /> : <AdminIngestionView onRefresh={onRefresh} />
            ) : (
               activeTab === 'dashboard' ? <CandidateHome user={user} candidates={candidates} /> : 
               activeTab === 'submit' ? <CandidateSubmit setActiveTab={setActiveTab} /> :
               activeTab === 'prephub' ? <CandidatePrepHub setActiveTab={setActiveTab} /> :
               activeTab === 'mockbot' ? <CandidateSimulation setActiveTab={setActiveTab} /> : <Placeholder />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

const AdminIngestionView = ({ onRefresh }) => {
    const [candidateName, setCandidateName] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [isIngesting, setIsIngesting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleIngest = async (e) => {
        e.preventDefault();
        if (!candidateName || !selectedFile) return;

        setIsIngesting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/candidates/ingest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name: candidateName, 
                    fileName: selectedFile.name 
                })
            });

            if (response.ok) {
                setSuccess(true);
                setCandidateName("");
                setSelectedFile(null);
                if (onRefresh) onRefresh();
                setTimeout(() => setSuccess(false), 3000);
            }
        } catch (error) {
            console.error("Ingestion failed:", error);
        } finally {
            setIsIngesting(false);
        }
    };

    return (
        <div className="fadeIn glass-card" style={{ padding: '3rem', borderRadius: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h3 style={{ color: 'white', fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em' }}>AI Data Ingestion</h3>
                    <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Upload resumes to extract insights and calculate match scores</p>
                </div>
                <div style={{ padding: '8px 20px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '800', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    RAG-READY PIPELINE
                </div>
            </div>
            
            <form onSubmit={handleIngest} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ color: 'white', fontWeight: '700', fontSize: '0.9rem' }}>Candidate Full Name</label>
                    <input 
                        type="text" 
                        placeholder="e.g. John Doe"
                        value={candidateName}
                        onChange={(e) => setCandidateName(e.target.value)}
                        required
                        style={{ 
                            width: '100%', 
                            background: 'rgba(255,255,255,0.03)', 
                            border: '1px solid rgba(255,255,255,0.1)', 
                            padding: '1.25rem', 
                            borderRadius: '16px', 
                            color: 'white',
                            fontSize: '1rem',
                            outline: 'none'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ color: 'white', fontWeight: '700', fontSize: '0.9rem' }}>Resume Document</label>
                    <div 
                        style={{ 
                            position: 'relative',
                            width: '100%', 
                            height: '180px', 
                            background: selectedFile ? 'rgba(59, 130, 246, 0.05)' : 'rgba(255,255,255,0.01)', 
                            border: selectedFile ? '2px solid #3b82f6' : '2px dashed rgba(255,255,255,0.1)', 
                            borderRadius: '24px', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '1rem',
                            transition: 'all 0.3s'
                        }}
                    >
                        <input 
                            type="file" 
                            onChange={(e) => setSelectedFile(e.target.files[0])}
                            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                        />
                        <FileText size={48} color={selectedFile ? '#3b82f6' : '#94a3b8'} />
                        <span style={{ color: selectedFile ? 'white' : '#94a3b8', fontWeight: '600' }}>
                            {selectedFile ? selectedFile.name : 'Click to select or drag resume file'}
                        </span>
                        {selectedFile && <span style={{ fontSize: '0.75rem', color: '#3b82f6' }}>File ready for AI extraction</span>}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button 
                        type="submit"
                        disabled={isIngesting || !candidateName || !selectedFile}
                        className="btn-action-pro" 
                        style={{ 
                            padding: '1.25rem 3rem', 
                            background: success ? '#10b981' : '#3b82f6', 
                            color: 'white', 
                            borderRadius: '16px', 
                            fontSize: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            opacity: (isIngesting || !candidateName || !selectedFile) ? 0.5 : 1
                        }}
                    >
                        {isIngesting ? <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><Cpu size={20} /></motion.div> Analyzing...</> : 
                         success ? <><CheckCircle size={20} /> Success!</> : 
                         <><Plus size={20} /> Start AI Ingestion</>}
                    </button>
                </div>
            </form>

            <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ color: 'white', fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.5rem' }}>Batch Processing</h4>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <textarea 
                        style={{ width: '100%', height: '120px', background: 'transparent', border: 'none', color: '#cbd5e1', fontSize: '1rem', outline: 'none', resize: 'none' }} 
                        placeholder="Paste bulk text or multiple LinkedIn profiles for deep background analysis..."
                    ></textarea>
                </div>
            </div>
        </div>
    );
};

const CandidateHome = ({ user, candidates }) => {
  // Simulate finding the current candidate's data
  // In a real app, this would be a filtered match or another API call
  const candidate = candidates.find(c => c.name.includes(user?.firstName || "Alex")) || candidates[0];
  
  const matchScore = candidate?.match || 0;
  
  return (
  <div className="fadeIn" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2rem' }}>
    <div className="glass-card" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden', background: 'linear-gradient(145deg, rgba(59, 130, 246, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)', border: '1px solid rgba(59, 130, 246, 0.15)' }}>
       <div style={{ position: 'absolute', top: '-20%', right: '-20%', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)', filter: 'blur(40px)', zIndex: 0 }}></div>
       
       <div style={{ position: 'relative', zIndex: 1 }}>
           <h3 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '1.15rem', marginBottom: '2.5rem', color: 'white', fontWeight: '800' }}>
              <Cpu size={22} color="#3b82f6" /> AI Fit Analysis
           </h3>
           
           <div style={{ fontSize: '6.5rem', fontWeight: '900', letterSpacing: '-4px', color: 'white', marginBottom: '0.2rem', textShadow: '0 0 40px rgba(59, 130, 246, 0.3)' }}>
              {matchScore}<span style={{ color: '#3b82f6', fontSize: '4rem' }}>%</span>
           </div>
           <p style={{ color: '#94a3b8', fontWeight: '600', fontSize: '1rem', marginBottom: '3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Global Match Score</p>
           
           <div className="pro-progress-bg" style={{ height: '8px', marginBottom: '3.5rem', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${matchScore}%` }} transition={{ duration: 1.5, ease: 'easeOut' }} style={{ height: '100%', background: 'linear-gradient(90deg, #3b82f6, #06b6d4)', borderRadius: '4px', boxShadow: '0 0 10px rgba(59,130,246,0.5)' }}></motion.div>
           </div>
           
           <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '800', marginBottom: '8px', color: 'white' }}>
                  <span>Technical Stack</span> <span style={{ color: '#3b82f6'}}>94%</span>
                </div>
                <div className="pro-progress-bg" style={{ background: 'rgba(255,255,255,0.08)', height: '6px', borderRadius: '3px' }}>
                   <motion.div initial={{ width: 0 }} animate={{ width: '94%' }} transition={{ duration: 1.5, delay: 0.2 }} style={{ height: '100%', background: '#3b82f6', borderRadius: '3px' }}></motion.div>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '800', marginBottom: '8px', color: 'white' }}>
                  <span>Domain relevance</span> <span style={{ color: '#06b6d4'}}>72%</span>
                </div>
                <div className="pro-progress-bg" style={{ background: 'rgba(255,255,255,0.08)', height: '6px', borderRadius: '3px' }}>
                   <motion.div initial={{ width: 0 }} animate={{ width: '72%' }} transition={{ duration: 1.5, delay: 0.4 }} style={{ height: '100%', background: '#06b6d4', borderRadius: '3px' }}></motion.div>
                </div>
              </div>
           </div>
       </div>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="glass-card" style={{ borderLeft: '4px solid #10b981', background: 'linear-gradient(90deg, rgba(16,185,129,0.05) 0%, transparent 100%)' }}>
        <h4 style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '800' }}><TrendingUp size={22} /> Core Strengths Detected</h4>
        <p style={{ color: '#94a3b8', lineHeight: '1.7', fontSize: '0.95rem' }}>
            {candidate?.summary || "Your expertise matches our high-priority requirements. Establishing you as a top-tier candidate."}
        </p>
      </div>
      <div className="glass-card" style={{ borderLeft: '4px solid #f59e0b', background: 'linear-gradient(90deg, rgba(245,158,11,0.05) 0%, transparent 100%)' }}>
        <h4 style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '800' }}><AlertCircle size={22} /> AI Skill Gaps Flagged</h4>
        <p style={{ color: '#94a3b8', lineHeight: '1.7', fontSize: '0.95rem', marginBottom: '1rem' }}>
            AI detected some gaps in specific cloud infrastructure requirements compared to the role baseline.
        </p>
        <div style={{ background: 'rgba(245,158,11,0.1)', padding: '12px', borderRadius: '12px', color: '#fcd34d', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={16} /> Our AI has curated specific prep modules to address this before your interview.
        </div>
      </div>
    </div>
  </div>
  );
};

const Placeholder = () => (
    <div className="user-card fadeIn" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--pro-border)' }}>
        <span style={{ color: 'var(--pro-text-sec)', fontWeight: '600' }}>Module implementation in progress...</span>
    </div>
);

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatCandidate, setActiveChatCandidate] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const { user } = useUser();
  const isAdmin = ADMIN_EMAILS.includes(user?.primaryEmailAddress?.emailAddress);

  const fetchData = React.useCallback(async () => {
    try {
      const [candRes, jobsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/candidates`),
        fetch(`${API_BASE_URL}/jobs`)
      ]);
      const candData = await candRes.json();
      const jobsData = await jobsRes.json();
      setCandidates(candData);
      setJobs(jobsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      <SignedOut>
        <div className="login-bg">
          <div className="login-blob" style={{ top: '-10%', left: '-10%' }}></div>
          <div className="login-blob" style={{ bottom: '-10%', right: '-10%', background: 'rgba(6, 182, 212, 0.1)' }}></div>
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="login-card"
          >
            <div style={{ display: 'inline-flex', padding: '18px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '20px', marginBottom: '2rem' }}>
              <Cpu size={36} color="#3b82f6" />
            </div>
            
            <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', color: 'white', letterSpacing: '-0.04em' }}>
              HireAI <span style={{ color: '#3b82f6' }}>Portal</span>
            </h1>
            
            <p style={{ color: '#94a3b8', marginBottom: '3rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
                Bridging the gap between manual screening and AI-powered interview readiness.
            </p>

            <SignInButton mode="modal">
              <button className="login-btn">
                Enter Dashboard <ChevronRight size={20} style={{ marginLeft: '8px', verticalAlign: 'middle' }} />
              </button>
            </SignInButton>

            <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center', gap: '1.5rem', opacity: 0.6 }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#94a3b8' }}>
                 <CheckCircle size={14} color="#10b981" /> AI Scoring
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#94a3b8' }}>
                 <CheckCircle size={14} color="#10b981" /> Smarter Prep
               </div>
            </div>
          </motion.div>
        </div>
      </SignedOut>

      <SignedIn>
        <DashboardShell 
          role={isAdmin ? 'admin' : 'candidate'} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          user={user} 
          candidates={candidates}
          jobs={jobs}
          onRefresh={fetchData}
          onOpenChat={(candidate) => {
            setActiveChatCandidate(candidate || null);
            setIsChatOpen(true);
          }} 
        />
        <AIChatbotSidebar 
          isOpen={isChatOpen} 
          onClose={() => {
            setIsChatOpen(false);
            setActiveChatCandidate(null);
          }} 
          candidates={candidates} 
          activeCandidate={activeChatCandidate}
        />
      </SignedIn>
    </>
  );
};

export default App;
