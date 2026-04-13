import React, { useState, useEffect, useRef } from 'react';
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
  Bot,
  Sparkles,
  Zap,
  CheckCircle2,
  ListRestart
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
import CandidateJobBoard from './components/candidate/CandidateJobBoard';
import CandidatePrepHub from './components/candidate/CandidatePrepHub';
import CandidateSimulation from './components/candidate/CandidateSimulation';
import LiveKeywordStream from './components/shared/LiveKeywordStream';

const ADMIN_EMAILS = [
  "himanshubansal1803@gmail.com", 
  "nikhiltelkar19@gmail.com", 
  "hartejsinghsandhu2806@gmail.com", 
  "vivekkrishna7985@gmail.com"
];

const API_BASE_URL = "http://localhost:5001/api";

const DashboardShell = ({ role, activeTab, setActiveTab, user, onOpenChat, candidates, jobs, onRefresh, recommendations }) => {
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
              <button className={`nav-item-pro`} onClick={() => onOpenChat()} style={{ marginTop: '1rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
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
              <button className={`nav-item-pro ${activeTab === 'jobboard' ? 'active' : ''}`} onClick={() => setActiveTab('jobboard')}>
                <Search size={20} /> <span>Job Openings</span>
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
               activeTab === 'database' ? <AdminResumeDatabase candidates={candidates} onOpenChat={onOpenChat} onRefresh={onRefresh} /> :
               activeTab === 'jobs' ? <AdminJobDescriptions jobs={jobs} onRefresh={onRefresh} /> : <AdminIngestionView onRefresh={onRefresh} />
            ) : (
               activeTab === 'dashboard' ? <CandidateHome user={user} candidates={candidates} recommendations={recommendations} /> : 
               activeTab === 'submit' ? <CandidateSubmit setActiveTab={setActiveTab} onRefresh={onRefresh} /> :
               activeTab === 'jobboard' ? <CandidateJobBoard user={user} allJobs={jobs} recommendations={recommendations} /> :
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
    const [fileStatus, setFileStatus] = useState(null);
    const [extractedName, setExtractedName] = useState("");
    const fileInputRef = useRef(null);

    const handleFileChange = async (fileOrEvent) => {
      let file = null;
      if (fileOrEvent?.target?.files) file = fileOrEvent.target.files[0];
      else if (fileOrEvent instanceof File) file = fileOrEvent;
      else return;

      if (!file) return;

      setFileStatus('uploading');

      const formData = new FormData();
      formData.append('resumePdf', file);
      formData.append('name', 'Admin Upload');
      formData.append('email', `admin-upload-${Date.now()}@hireai.com`);
      formData.append('role', 'Any Role');

      try {
        const response = await fetch(`${API_BASE_URL}/candidates`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Server returned an error');
        }

        const data = await response.json();
        setExtractedName(data.name || 'Extracted Candidate');
        setFileStatus('extracted');
        if (onRefresh) onRefresh();
      } catch (error) {
        console.error(error);
        setFileStatus('error');
      }
    };

    const handleZoneClick = () => {
      fileInputRef.current.click();
    };

    const [isDragActive, setIsDragActive] = useState(false);

    const handleDragOver = (e) => {
      e.preventDefault();
      setIsDragActive(true);
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      setIsDragActive(false);
    };

    const handleDrop = (e) => {
      e.preventDefault();
      setIsDragActive(false);
      if (fileStatus === 'error' || fileStatus === null || fileStatus === 'extracted') {
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleFileChange(e.dataTransfer.files[0]);
        }
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
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
              accept="application/pdf"
            />

            <div 
                onClick={handleZoneClick} 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{ 
                    cursor: 'pointer', 
                    width: '100%', 
                    height: '240px', 
                    background: isDragActive ? 'rgba(59, 130, 246, 0.05)' : 'rgba(255,255,255,0.01)', 
                    border: fileStatus === 'error' ? '2px dashed #ef4444' : (isDragActive ? '2px dashed #3b82f6' : '2px dashed rgba(255,255,255,0.1)'), 
                    borderRadius: '24px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '1rem',
                    transition: 'all 0.3s'
                }}
            >
                <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem', position: 'relative' }}>
                   <FileText size={40} color={fileStatus === 'extracted' ? '#10b981' : '#3b82f6'} />
                   <LiveKeywordStream isAnalyzing={fileStatus === 'uploading'} />
                </div>
                <span style={{ color: 'white', fontWeight: '700', fontSize: '1.1rem' }}>
                    {fileStatus === 'uploading' ? 'Analyzing Resume Content...' : 
                     fileStatus === 'extracted' ? 'Resume Processed Successfully!' : 'Drop Resume to Analyze'}
                </span>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Supports PDF format up to 10MB</p>
            </div>

            {fileStatus === 'extracted' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Extracted Identity</span>
                            <div style={{ color: 'white', fontSize: '1.25rem', fontWeight: '800', marginTop: '4px' }}>{extractedName}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                             <button className="btn-action-pro" style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }} onClick={() => setFileStatus(null)}>Clear</button>
                             <button className="btn-action-pro" style={{ background: '#10b981', color: 'white' }}>Save to Database</button>
                        </div>
                    </div>
                </motion.div>
            )}

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

const CandidateHome = ({ user, candidates, recommendations = [] }) => {
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const candidate = candidates.find(c => c.email && userEmail && c.email === userEmail) || candidates[0];
  const matchScore = candidate?.match || 0;
  
  return (
  <div className="fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2rem' }}>
      <div className="glass-card" style={{ textAlign: 'center', background: 'linear-gradient(145deg, rgba(59, 130, 246, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)', border: '1px solid rgba(59, 130, 246, 0.15)', padding: '2.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '1.15rem', marginBottom: '2.5rem', color: 'white', fontWeight: '800' }}>
              <Cpu size={22} color="#3b82f6" /> AI Fit Analysis
          </h3>
          
          <div style={{ fontSize: '6.5rem', fontWeight: '900', letterSpacing: '-4px', color: 'white', marginBottom: '0.2rem' }}>
              {matchScore}<span style={{ color: '#3b82f6', fontSize: '4rem' }}>%</span>
          </div>
          <p style={{ color: '#94a3b8', fontWeight: '600', fontSize: '1rem', marginBottom: '3rem', textTransform: 'uppercase' }}>Global Match Score</p>
          
          <div className="pro-progress-bg" style={{ height: '8px', marginBottom: '3.5rem', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${matchScore}%` }} style={{ height: '100%', background: 'linear-gradient(90deg, #3b82f6, #06b6d4)', borderRadius: '4px' }}></motion.div>
          </div>
          
          <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '16px' }}>
              <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '800', marginBottom: '8px', color: 'white' }}>
                      <span>Technical Alignment</span> <span style={{ color: '#3b82f6'}}>94%</span>
                  </div>
                  <div className="pro-progress-bg" style={{ background: 'rgba(255,255,255,0.08)', height: '6px' }}>
                      <div style={{ width: '94%', height: '100%', background: '#3b82f6', borderRadius: '3px' }}></div>
                  </div>
              </div>
          </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Core Strengths */}
        <div className="glass-card" style={{ borderLeft: '4px solid #10b981', padding: '2rem' }}>
          <h4 style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', fontWeight: '800' }}><TrendingUp size={22} /> Core Strengths Detected</h4>
          <p style={{ color: '#cbd5e1', lineHeight: '1.7' }}>{candidate?.summary || "Analyzing your profile..."}</p>
        </div>

        {/* AI Resume Insights */}
        <div className="glass-card" style={{ borderLeft: '4px solid #3b82f6', background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.4) 0%, rgba(2, 6, 23, 0.4) 100%)', padding: '2rem' }}>
          <h4 style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Zap size={20} fill="#3b82f6" /> AI Optimization Tips
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {(candidate?.feedback && candidate.feedback.length > 0) ? (
              candidate.feedback.map((tip, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={idx} 
                  style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <CheckCircle2 size={18} color="#10b981" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>{tip}</p>
                </motion.div>
              ))
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                <ListRestart size={32} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                <p>Upload your latest resume to generate personalized AI improvement tips.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Recommendations Section */}
    <div className="fadeIn">
        <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={24} color="#3b82f6" /> Recommended Positions For You
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {recommendations.length > 0 ? recommendations.map(job => (
                <motion.div key={job.id} whileHover={{ y: -5 }} className="glass-card" style={{ border: '1px solid rgba(59, 130, 246, 0.2)', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span className="pill-capsule" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>{job.matchPercent}% Match</span>
                    </div>
                    <h4 style={{ color: 'white', fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.5rem' }}>{job.title}</h4>
                    <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '1rem' }}>{job.department} • {job.location}</p>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', fontSize: '0.8rem', color: '#cbd5e1', fontStyle: 'italic', marginBottom: '1.5rem' }}>
                        "{job.reason}"
                    </div>
                    <button className="btn-action-pro" style={{ width: '100%', background: '#3b82f6', color: 'white', borderRadius: '10px' }}>Apply Now</button>
                </motion.div>
            )) : (
                <div style={{ gridColumn: '1/-1', padding: '3rem', textAlign: 'center', color: '#64748b', background: 'rgba(255,255,255,0.01)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.05)' }}>
                    AI is scanning current openings for your profile...
                </div>
            )}
        </div>
    </div>
  </div>
  );
};

const Placeholder = () => (
    <div className="user-card fadeIn" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed rgba(255,255,255,0.1)' }}>
        <span style={{ color: '#64748b', fontWeight: '600' }}>Module implementation in progress...</span>
    </div>
);

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatCandidate, setActiveChatCandidate] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const { user } = useUser();
  const isAdmin = ADMIN_EMAILS.includes(user?.primaryEmailAddress?.emailAddress);

  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const userId = user?.id;

  const fetchData = React.useCallback(async () => {
    try {
      const [candRes, jobsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/candidates`, { cache: 'no-store' }),
        fetch(`${API_BASE_URL}/jobs`, { cache: 'no-store' })
      ]);
      const candData = await candRes.json();
      const jobsData = await jobsRes.json();
      
      setCandidates(candData);
      setJobs(jobsData);

      // Compute the active candidate used by the dashboard
      const dashboardCandidate = candData.find(c => c.email && userEmail && c.email === userEmail) || candData[0];

      // Fetch AI recommendations for exact displayed candidate (including all=true for Job Board)
      if (!isAdmin && dashboardCandidate) {
        const urlParams = dashboardCandidate.email 
          ? `email=${dashboardCandidate.email}&id=${dashboardCandidate.id}&all=true` 
          : `id=${dashboardCandidate.id}&all=true`;
          
        const recRes = await fetch(`${API_BASE_URL}/candidates/recommendations?${urlParams}`);
        const recData = await recRes.json();
        if (Array.isArray(recData)) {
          setRecommendations(recData);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [isAdmin, userId, userEmail]);

  useEffect(() => {
    fetchData();
  }, [fetchData, activeTab]);

  return (
    <>
      <SignedOut>
        <div className="login-bg">
          <div className="login-blob" style={{ top: '-10%', left: '-10%' }}></div>
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="login-card">
            <div style={{ display: 'inline-flex', padding: '18px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '20px', marginBottom: '2rem' }}>
              <Cpu size={36} color="#3b82f6" />
            </div>
            <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', color: 'white' }}>HireAI Portal</h1>
            <p style={{ color: '#94a3b8', marginBottom: '3rem' }}>Next-gen AI recruitment screening and preparation platform.</p>
            <SignInButton mode="modal"><button className="login-btn">Enter Platform <ChevronRight size={20} /></button></SignInButton>
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
          recommendations={recommendations}
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
