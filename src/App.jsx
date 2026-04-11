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
  Plus
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
  const { getToken } = useAuth();

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
        <div style={{ 
          height: '100vh', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          background: 'var(--canvas-bg)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative Elements */}
          <div className="blob" style={{ top: '-10%', left: '-10%', background: 'rgba(139, 92, 246, 0.2)' }}></div>
          <div className="blob" style={{ bottom: '-10%', right: '-10%', background: 'rgba(6, 182, 212, 0.2)' }}></div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }}
            className="glass-card" 
            style={{ 
              padding: '4rem 3rem', 
              textAlign: 'center', 
              maxWidth: '500px',
              width: '90%',
              zIndex: 1,
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
              <div className="glass-pill">
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-secondary)' }}></span>
                New: AI Resume V2 is live
              </div>
            </div>

            <div style={{ display: 'inline-flex', padding: '16px', background: 'var(--accent-gradient)', borderRadius: '24px', marginBottom: '2rem', boxShadow: '0 0 40px rgba(139, 92, 246, 0.3)' }}>
              <TrendingUp size={32} color="white" />
            </div>

            <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', lineHeight: '1.2' }}>
              Next-Gen <span className="text-gradient">Recruitment</span>
            </h1>
            
            <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1.1rem', maxWidth: '380px', margin: '0 auto 3rem' }}>
              Harness the power of AI to screen, rank, and interview your top talent in minutes, not days.
            </p>

            <SignInButton mode="modal">
              <button className="glass-card glow-btn" style={{ 
                padding: '1.2rem 2.5rem', 
                background: 'var(--accent-gradient)', 
                color: 'white', 
                fontWeight: '700', 
                fontSize: '1.1rem',
                width: '100%',
                border: 'none',
                boxShadow: '0 10px 25px -5px rgba(139, 92, 246, 0.4)'
              }}>
                Enter the Arena
              </button>
            </SignInButton>

            <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <CheckCircle size={14} color="#10b981" /> AI Scoring
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <CheckCircle size={14} color="#10b981" /> Live Sync
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <CheckCircle size={14} color="#10b981" /> Ethics Verified
              </div>
            </div>
          </motion.div>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="app-container">
          <aside className="sidebar">
            <div className="brand" style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <TrendingUp size={24} color="var(--accent-primary)" />
              <h2 className="brand-font">HireAI</h2>
            </div>
            <nav style={{ flex: 1 }}>
              <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                <LayoutDashboard size={20} /> <span>{isAdmin ? 'Admin Panel' : 'My Status'}</span>
              </button>
              {isAdmin && (
                <button className={`nav-item ${activeTab === 'analyze' ? 'active' : ''}`} onClick={() => setActiveTab('analyze')}>
                  <Search size={20} /> <span>Intelligence</span>
                </button>
              )}
            </nav>
            <div style={{ marginTop: 'auto' }}>
              <UserButton showName appearance={{ elements: { userButtonBox: { padding: '10px' } } }} />
            </div>
          </aside>

          <main className="main-content">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h1 style={{ fontSize: '1.5rem', opacity: 0.6, marginBottom: '4px' }}>
                  {isAdmin ? 'ADMINISTRATOR' : 'CANDIDATE PORTAL'}
                </h1>
                <h2 style={{ fontSize: '2.4rem' }}>
                  {activeTab === 'dashboard' ? 'Welcome Back' : 'AI Analysis'}
                </h2>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ 
                  background: isAdmin ? '#e0f2fe' : '#dcfce7', 
                  color: isAdmin ? '#0369a1' : '#166534',
                  padding: '6px 14px',
                  borderRadius: '999px',
                  fontWeight: '800',
                  fontSize: '0.7rem',
                  letterSpacing: '0.02em',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}>
                  {isAdmin ? 'ADMIN ACCESS' : 'USER ACCESS'}
                </div>
                <span className="glass-pill">
                  <span style={{ width: '8px', height: '8px', background: backendStatus === 'Live' ? '#10b981' : '#ef4444', borderRadius: '50%' }}></span>
                  System: {backendStatus}
                </span>
                <UserButton />
              </div>
            </header>
            
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                {isAdmin ? (
                  <>
                    {activeTab === 'dashboard' && <AdminDashboardView />}
                    {activeTab === 'analyze' && <AdminAnalysisView />}
                  </>
                ) : (
                  <UserDashboardView />
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </SignedIn>
    </>
  );
};

// --- Views ---

const AdminDashboardView = () => (
  <div className="fadeIn">
    <div className="dashboard-grid">
      <div className="glass-card stat-card">
        <span className="stat-label">Pending Reviews</span>
        <span className="stat-value">12</span>
      </div>
      <div className="glass-card stat-card">
        <span className="stat-label">Hire Velocity</span>
        <span className="stat-value">+24%</span>
      </div>
      <div className="glass-card stat-card">
        <span className="stat-label">AI Accuracy</span>
        <span className="stat-value">99.2%</span>
      </div>
    </div>
    
    <div style={{ marginTop: '3rem' }}>
      <h3 style={{ marginBottom: '1.5rem' }}>Top Priority Candidates</h3>
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
            <tr>
              <th style={{ padding: '1.5rem' }}>Candidate</th>
              <th style={{ padding: '1.5rem' }}>Match Score</th>
              <th style={{ padding: '1.5rem' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_CANDIDATES.map(c => (
              <tr key={c.id} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '1.5rem' }}>
                  <div style={{ fontWeight: '600' }}>{c.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{c.role}</div>
                </td>
                <td style={{ padding: '1.5rem' }}>
                  <span style={{ fontWeight: '800', color: 'var(--accent-secondary)' }}>{c.match}% Match</span>
                </td>
                <td style={{ padding: '1.5rem' }}>
                  <span className="badge badge-success">{c.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const AdminAnalysisView = () => (
  <div className="fadeIn glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
    <Search size={48} color="var(--accent-primary)" style={{ marginBottom: '1.5rem' }} />
    <h2>Advanced Resume Intelligence</h2>
    <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>Admin tools for cross-referencing resumes with global benchmarks.</p>
    <button className="glass-card glow-btn" style={{ padding: '1rem 2rem', background: 'var(--accent-gradient)', color: 'white', fontWeight: '700' }}>
      Launch AI Pipeline
    </button>
  </div>
);

const UserDashboardView = () => (
  <div className="fadeIn">
    <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
      <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <CheckCircle size={40} color="white" />
      </div>
      <h2>Application Status: Under Review</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Our AI has processed your resume. You are currently in the Top 15% of applicants.</p>
      
      <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'left' }}>
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px' }}>
            <span>Resume Score</span>
            <span>88%</span>
          </div>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: '88%', height: '100%', background: 'var(--accent-gradient)' }}></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default App;
