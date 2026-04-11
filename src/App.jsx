import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  LayoutDashboard, 
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
  ChevronRight
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

const MOCK_CANDIDATES = [
  { id: 1, name: 'Alex Rivera', role: 'Senior React Developer', match: 92, status: 'Top Pick', skills: ['React', 'TypeScript', 'Node.js'], applied: '2 days ago' },
  { id: 2, name: 'Sarah Chen', role: 'Backend Engineer', match: 86, status: 'Strong Match', skills: ['Python', 'PostgreSQL', 'Docker'], applied: '1 week ago' },
];

const ADMIN_EMAILS = ["himanshubansal1803@gmail.com", "nikhiltelkar19@gmail.com"];

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [backendStatus, setBackendStatus] = useState('Checking...');
  const { user } = useUser();

  useEffect(() => {
    const checkServer = async () => {
        try {
            await fetch('http://localhost:5000/api/gsheets/candidates');
            setBackendStatus('Live');
        } catch (e) {
            setBackendStatus('Offline');
        }
    };
    checkServer();
  }, []);

  const isAdmin = ADMIN_EMAILS.includes(user?.primaryEmailAddress?.emailAddress);

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
        <div className="app-container" style={{ background: isAdmin ? 'var(--canvas-bg)' : 'var(--pro-bg)' }}>
          <aside className="sidebar" style={{ background: isAdmin ? 'var(--surface-card)' : 'var(--pro-sidebar)' }}>
            <div className="brand" style={{ marginBottom: '3.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', background: '#3b82f6', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>
                <Cpu size={20} color="white" />
              </div>
              <h2 className="brand-font" style={{ color: 'white', fontSize: '1.4rem', letterSpacing: '-0.02em' }}>HireAI</h2>
            </div>
            
            <nav style={{ flex: 1 }}>
              <div style={{ color: '#4b5563', fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.1em', marginBottom: '1rem', textTransform: 'uppercase' }}>
                Platform Sections
              </div>
              {isAdmin ? (
                <>
                  <button className={`nav-item-pro ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                    <LayoutDashboard size={20} /> <span>Admin Overview</span>
                  </button>
                  <button className={`nav-item-pro ${activeTab === 'ingestion' ? 'active' : ''}`} onClick={() => setActiveTab('ingestion')}>
                    <FileText size={20} /> <span>Data Ingestion</span>
                  </button>
                </>
              ) : (
                <>
                  <button className={`nav-item-pro ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                    <LayoutDashboard size={18} /> <span>Evaluation Status</span>
                  </button>
                  <button className={`nav-item-pro ${activeTab === 'prephub' ? 'active' : ''}`} onClick={() => setActiveTab('prephub')}>
                    <HelpCircle size={18} /> <span>Interview Prep Hub</span>
                  </button>
                  <button className={`nav-item-pro ${activeTab === 'mockbot' ? 'active' : ''}`} onClick={() => setActiveTab('mockbot')}>
                    <MessageSquare size={18} /> <span>Simulation Arena</span>
                  </button>
                  <button className={`nav-item-pro ${activeTab === 'submit' ? 'active' : ''}`} onClick={() => setActiveTab('submit')}>
                    <FileText size={18} /> <span>Submission Portal</span>
                  </button>
                </>
              )}
            </nav>

            {!isAdmin && (
              <div className="ethical-guardrail-pro">
                <div style={{ display: 'flex', gap: '12px' }}>
                  <ShieldCheck size={32} style={{ flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: '#991b1b', display: 'block', marginBottom: '2px' }}>Ethical AI Guardrail:</strong>
                    Final hiring decisions are strictly made by the Admin team following human oversight.
                  </div>
                </div>
              </div>
            )}

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '16px', display: 'flex', alignItems: 'center' }}>
              <UserButton showName appearance={{ elements: { userButtonBox: { padding: '0' }, userButtonOuterIdentifier: { color: 'white', fontSize: '0.85rem' } } }} />
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
                <h1 style={{ fontSize: '3rem', fontWeight: '800', color: isAdmin ? 'white' : 'var(--pro-text)', letterSpacing: '-0.04em' }}>
                  {isAdmin ? 'Recruiter Hub' : `Hey ${user?.firstName}!`}
                </h1>
              </div>
              
              <div style={{ background: 'white', padding: '8px 16px', borderRadius: '12px', border: '1px solid var(--pro-border)', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></div>
                <span style={{ fontWeight: '700', fontSize: '0.75rem', color: '#1f2937' }}>AI ENGINE LIVE</span>
              </div>
            </header>

            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {isAdmin ? (
                   activeTab === 'dashboard' ? <AdminDashboardView /> : <AdminIngestionView />
                ) : (
                  <>
                    {activeTab === 'dashboard' && <UserHomeView />}
                    {activeTab === 'prephub' && <UserPrepHubView />}
                    {activeTab === 'mockbot' && <UserMockBotView />}
                    {activeTab === 'submit' && <UserSubmitView />}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </SignedIn>
    </>
  );
};

// --- Candidate Sub-views (MATCHES SCREENSHOT) ---

const UserHomeView = () => (
  <div className="fadeIn" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2.5rem' }}>
    <div className="user-card" style={{ textAlign: 'center' }}>
       <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', marginBottom: '3rem' }}>
          <Cpu size={20} color="#3b82f6" /> AI Fit Analysis
       </h3>
       
       <div style={{ fontSize: '6rem', fontWeight: '900', letterSpacing: '-6px', color: '#111827', marginBottom: '0.5rem' }}>88<span style={{ color: '#3b82f6' }}>%</span></div>
       <p style={{ color: '#6b7280', fontWeight: '600', fontSize: '0.95rem', marginBottom: '3rem' }}>Global Match Score</p>
       
       <div className="pro-progress-bg" style={{ height: '10px', marginBottom: '4rem' }}><div className="pro-progress-fill" style={{ width: '88%' }}></div></div>
       
       <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '800', marginBottom: '6px' }}>
              <span>Technical Stack</span> <span>94%</span>
            </div>
            <div className="pro-progress-bg"><div className="pro-progress-fill" style={{ width: '94%' }}></div></div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '800', marginBottom: '6px' }}>
              <span>Domain relevance</span> <span>72%</span>
            </div>
            <div className="pro-progress-bg"><div className="pro-progress-fill" style={{ width: '72%', background: '#60a5fa' }}></div></div>
          </div>
       </div>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="user-card" style={{ borderLeft: '6px solid #10b981' }}>
        <h4 style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}><TrendingUp size={20} /> Core Strengths</h4>
        <p style={{ color: '#4b5563', lineHeight: '1.6', fontSize: '0.95rem' }}>
            Your expertise in React & Scalable Systems matches 95% of our high-priority requirements. AI detected strong architectural reasoning in your "Project Alpha" summary.
        </p>
      </div>
      <div className="user-card" style={{ borderLeft: '6px solid #f59e0b' }}>
        <h4 style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}><AlertCircle size={20} /> Skill Gaps Detected</h4>
        <p style={{ color: '#4b5563', lineHeight: '1.6', fontSize: '0.95rem' }}>
            Limited exposure to Cloud Infrastructure (Terraform/AWS) detected. Our AI has curated 5 specific prep modules in the Prep Hub to address this before your interview.
        </p>
      </div>
    </div>
  </div>
);

// --- Admin Views (PRESERVED SIMPLE UI) ---

const AdminDashboardView = () => (
  <div className="fadeIn">
    <div className="dashboard-grid">
      <div className="glass-card stat-card">
        <span className="stat-label">Pending Reviews</span>
        <span className="stat-value">12</span>
      </div>
      <div className="glass-card stat-card">
        <span className="stat-label">AI Accuracy</span>
        <span className="stat-value">99.2%</span>
      </div>
    </div>
    <div style={{ marginTop: '3rem' }}>
      <h3 style={{ color: 'white', marginBottom: '1.5rem' }}>Manual Evaluation Backlog</h3>
      <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', opacity: 0.6 }}>
         Admin View preserved. No UI changes applied per request.
      </div>
    </div>
  </div>
);

const AdminIngestionView = () => (
    <div className="fadeIn glass-card" style={{ padding: '3rem' }}>
        <h3 style={{ color: 'white', marginBottom: '2rem' }}>Data Ingestion Portal</h3>
        <textarea style={{ width: '100%', height: '300px', background: 'rgba(255,255,255,0.02)', color: 'white', padding: '1.5rem', borderRadius: '12px' }} placeholder="Batch resume processing..."></textarea>
    </div>
);

// --- Other User Sections ---

const UserPrepHubView = () => (
  <div className="user-card fadeIn">
    <h3>Module 1: Cloud Orchestration</h3>
    <p style={{ color: '#6b7280', marginTop: '1rem' }}>Based on your identified gap in AWS/Terraform.</p>
  </div>
);

const UserMockBotView = () => (
  <div className="user-card fadeIn" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
     <MessageSquare size={48} color="#3b82f6" />
     <span style={{ marginLeft: '1rem', fontWeight: '700' }}>Starting Simulation Arena...</span>
  </div>
);

const UserSubmitView = () => (
  <div className="user-card fadeIn">
    <h2>Data Ingestion</h2>
    <p>Simulating Google Forms input flow...</p>
  </div>
);

export default App;
