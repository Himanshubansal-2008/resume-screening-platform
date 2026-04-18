import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Users, FileText, LayoutDashboard, Database, Search, 
  TrendingUp, CheckCircle, AlertCircle, MessageSquare, Plus,
  ShieldCheck, HelpCircle, Cpu, ChevronRight, ClipboardList, Bot, ArrowRight, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';

import AdminDashboard from './components/admin/AdminDashboard';
import AdminResumeDatabase from './components/admin/AdminResumeDatabase';
import AdminJobDescriptions from './components/admin/AdminJobDescriptions';
import AIChatbotSidebar from './components/admin/AIChatbotSidebar';
import CandidateSubmit from './components/candidate/CandidateSubmit';
import CandidateJobBoard from './components/candidate/CandidateJobBoard';
import CandidateHome from './components/candidate/CandidateHome';
import CandidatePrepHub from './components/candidate/CandidatePrepHub';
import CandidateProfile from './components/candidate/CandidateProfile';

const ADMIN_EMAILS = [
  "himanshubansal1803@gmail.com", "nikhiltelkar19@gmail.com", 
  "hartejsinghsandhu2806@gmail.com", "vivekkrishna7985@gmail.com"
];

const API_BASE_URL = "http://localhost:5001/api";

const DashboardShell = ({ role, activeTab, setActiveTab, user, onOpenChat, candidates, jobs, onRefresh, recommendations }) => {
  const isAdmin = role === 'admin';
  
  // Robustly find the candidate profile for the logged-in user
  const myProfile = useMemo(() => {
    return candidates.find(c => c.email === user?.primaryEmailAddress?.emailAddress);
  }, [candidates, user]);

  return (
    <div className="app-container" style={{ background: '#07070b' }}>
      <aside className="sidebar" style={{ borderRight: '1px solid hsla(0,0%,100%,0.05)', background: '#0a0a0f' }}>
        <div className="brand" style={{ marginBottom: '4rem', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px -4px var(--primary-glow)' }}>
            <Cpu size={24} color="white" />
          </div>
          <div>
            <h2 className="brand-font" style={{ color: 'white', fontSize: '1.6rem', lineHeight: '1', letterSpacing: '-1px' }}>HireAI</h2>
            <div style={{ fontSize: '0.6rem', color: 'var(--primary)', fontWeight: '900', letterSpacing: '0.15em', marginTop: '4px' }}>ENTERPRISE</div>
          </div>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {isAdmin ? (
            <>
              <button className={`nav-item-pro ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                <LayoutDashboard size={18} /> <span>Admin Overview</span>
              </button>
              <button className={`nav-item-pro ${activeTab === 'database' ? 'active' : ''}`} onClick={() => setActiveTab('database')}>
                <Database size={18} /> <span>Resume Database</span>
              </button>
              <button className={`nav-item-pro ${activeTab === 'jobs' ? 'active' : ''}`} onClick={() => setActiveTab('jobs')}>
                <ClipboardList size={18} /> <span>Job Descriptions</span>
              </button>
              
              <div style={{ margin: '2rem 1rem', borderTop: '1px solid hsla(0,0%,100%,0.05)' }}></div>
              <div style={{ padding: '0 1rem', marginBottom: '1rem', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800', letterSpacing: '0.1em' }}>INTELLIGENCE</div>

              <button 
                className="nav-item-pro" 
                onClick={() => onOpenChat()}
                style={{ 
                  background: 'hsla(217, 91%, 60%, 0.05)',
                  border: '1px solid hsla(217, 91%, 60%, 0.15)',
                  color: 'var(--primary)',
                  fontWeight: '800'
                }}
              >
                <Bot size={18} /> <span>Ask HireAI Bot</span>
              </button>
            </>
          ) : (
            <>
              <button className={`nav-item-pro ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                <LayoutDashboard size={18} /> <span>Evaluation Status</span>
              </button>
              <button className={`nav-item-pro ${activeTab === 'jobboard' ? 'active' : ''}`} onClick={() => setActiveTab('jobboard')}>
                <Search size={18} /> <span>Job Openings</span>
              </button>
              <button className={`nav-item-pro ${activeTab === 'submit' ? 'active' : ''}`} onClick={() => setActiveTab('submit')}>
                <FileText size={18} /> <span>Submission Portal</span>
              </button>
              <button className={`nav-item-pro ${activeTab === 'prephub' ? 'active' : ''}`} onClick={() => setActiveTab('prephub')}>
                <HelpCircle size={18} /> <span>Interview Prep Hub</span>
              </button>
              <button className={`nav-item-pro ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
                <User size={18} /> <span>My Profile</span>
              </button>
            </>
          )}
        </nav>

        <div style={{ background: 'hsla(0,0%,100%,0.02)', padding: '12px', borderRadius: '16px', display: 'flex', alignItems: 'center', border: '1px solid hsla(0,0%,100%,0.05)' }}>
          <UserButton showName appearance={{ elements: { userButtonOuterIdentifier: { color: 'white', fontWeight: '700', fontSize: '13px' } } }} />
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="main-content" style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #07070b 100%)' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4rem', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '3.5rem', color: 'white', fontWeight: '900', letterSpacing: '-2px' }}>{isAdmin ? 'Recruiter Hub' : `Hey ${user?.firstName}!`}</h1>
            <p style={{ color: 'var(--text-dim)', marginTop: '0.5rem', fontSize: '1.1rem' }}>
                {isAdmin ? "Orchestrate your multi-dimensional hiring pipeline." : "Track your strategic application roadmap."}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800' }}>
               <ShieldCheck size={16} color="var(--primary)" /> SECURE SESSION
            </div>
            <div style={{ background: 'hsla(0,0%,100%,0.03)', padding: '8px 20px', borderRadius: '12px', border: '1px solid hsla(0,0%,100%,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="pulse" style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', boxShadow: '0 0 10px var(--primary-glow)' }}></div>
                <span style={{ fontWeight: '900', fontSize: '0.7rem', color: 'white', letterSpacing: '0.08em' }}>STABLE MODE</span>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: "easeOut" }}>
            {isAdmin ? (
               activeTab === 'dashboard' ? <AdminDashboard candidates={candidates} onOpenChat={onOpenChat} /> : 
               activeTab === 'database' ? <AdminResumeDatabase candidates={candidates} onOpenChat={onOpenChat} onRefresh={onRefresh} /> :
               <AdminJobDescriptions jobs={jobs} onRefresh={onRefresh} />
            ) : (
               activeTab === 'dashboard' ? <CandidateHome user={user} candidates={candidates} myProfile={myProfile} recommendations={recommendations} /> : 
               activeTab === 'submit' ? <CandidateSubmit onRefresh={onRefresh} setActiveTab={setActiveTab} /> :
               activeTab === 'jobboard' ? <CandidateJobBoard user={user} allJobs={jobs} myProfile={myProfile} onRefresh={onRefresh} recommendations={recommendations} setActiveTab={setActiveTab} /> :
               activeTab === 'profile' ? <CandidateProfile user={user} myProfile={myProfile} onRefresh={onRefresh} /> :
               <CandidatePrepHub />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};


const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatCandidate, setActiveChatCandidate] = useState(null);
  const { user } = useUser();
  const isAdmin = useMemo(() => ADMIN_EMAILS.includes(user?.primaryEmailAddress?.emailAddress), [user]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const [candRes, jobsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/candidates`),
        fetch(`${API_BASE_URL}/jobs`)
      ]);
      const candData = await candRes.json();
      const jobsData = await jobsRes.json();
      setCandidates(Array.isArray(candData) ? candData : []);
      setJobs(Array.isArray(jobsData) ? jobsData : []);

      // Fetch recommendations only for candidates
      if (!isAdmin) {
          const userEmail = user?.primaryEmailAddress?.emailAddress;
          const recRes = await fetch(`${API_BASE_URL}/candidates/recommendations?email=${userEmail}`);
          const recData = await recRes.json();
          if (Array.isArray(recData)) setRecommendations(recData);
      }
    } catch (error) {
      console.error("Critical Fetch Error:", error);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenChat = (candidate = null) => {
    setActiveChatCandidate(candidate);
    setIsChatOpen(true);
  };

  return (
    <>
      <SignedOut>
        <div className="login-bg">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="login-card"
          >
            <div style={{ width: '80px', height: '80px', background: 'var(--primary)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 3rem', boxShadow: '0 20px 40px var(--primary-glow)' }}>
               <Cpu size={42} color="white" />
            </div>
            
            <h1 style={{ color: 'white', fontSize: '4.5rem', marginBottom: '1rem', letterSpacing: '-0.06em', fontWeight: '900' }}>
              HireAI <span style={{ color: 'var(--primary)' }}>Portal</span>
            </h1>
            
            <p style={{ color: 'var(--text-dim)', marginBottom: '4rem', fontSize: '1.25rem', lineHeight: '1.6', maxWidth: '440px', margin: '0 auto 4rem' }}>
              The world's most advanced AI-driven candidate screening and interview readiness platform.
            </p>

            <SignInButton mode="modal">
              <button className="login-btn">
                Initialize Secure Session <ChevronRight size={20} />
              </button>
            </SignInButton>

            <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'center', gap: '2rem', opacity: 0.4 }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: '700', color: 'white' }}>
                 <CheckCircle size={14} color="var(--success)" /> Neural Extraction
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: '700', color: 'white' }}>
                 <CheckCircle size={14} color="var(--success)" /> 0ms Latency
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
          recommendations={recommendations}
          onOpenChat={handleOpenChat}
          onRefresh={fetchData}
        />
        <AIChatbotSidebar 
          isOpen={isChatOpen} 
          onClose={() => setIsChatOpen(false)} 
          candidates={candidates}
          activeCandidate={activeChatCandidate}
        />
      </SignedIn>
    </>
  );
};

export default App;
