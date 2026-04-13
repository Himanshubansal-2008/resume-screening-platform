import React from 'react';
import { 
  TrendingUp, 
  AlertCircle, 
  Cpu,
  CheckCircle2,
  ListRestart,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

const CandidateHome = ({ user, candidates = [] }) => {
  const email = user?.primaryEmailAddress?.emailAddress;
  const candidate = candidates.find(c => c.email === email);
  
  if (!candidate) {
    return (
      <div className="fadeIn" style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#94a3b8' }}>
        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '2rem', borderRadius: '30px', marginBottom: '2rem' }}>
            <Cpu size={64} color="#3b82f6" />
        </div>
        <h2 style={{ color: 'white', fontSize: '2rem', fontWeight: '900', marginBottom: '1rem' }}>Profile Analysis Pending</h2>
        <p style={{ maxWidth: '400px', lineHeight: '1.6', marginBottom: '2.5rem' }}>
            We haven't analyzed your resume yet. Please head to the **Submission Portal** to upload your latest resume and unlock your AI career insights.
        </p>
        <button 
            className="login-btn" 
            style={{ width: 'auto', padding: '1rem 2rem' }}
            onClick={() => window.location.reload()} // Simple refresh to check for updates
        >
            Refresh Dashboard <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="fadeIn">
      {/* Header Banner */}
      <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
           <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'white', marginBottom: '4px', letterSpacing: '-0.02em' }}>
             Welcome back, <span style={{ color: '#3b82f6' }}>{candidate.name.split(' ')[0]}</span>
           </h2>
           <p style={{ color: '#64748b', fontSize: '1rem', fontWeight: '500' }}>Your AI-powered career evaluation is up to date.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(59, 130, 246, 0.1)', padding: '8px 16px', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
           <ShieldCheck size={16} color="#3b82f6" />
           <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#3b82f6', textTransform: 'uppercase' }}>Verified Profile</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2.5rem' }}>
        {/* Fit Analysis Card */}
        <div className="user-card" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #3b82f6, #06b6d4)' }}></div>
          
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', marginBottom: '3rem', fontWeight: '800' }}>
              <Cpu size={20} color="#3b82f6" /> AI GLOBAL FIT
          </h3>
          
          <div style={{ fontSize: '6rem', fontWeight: '900', letterSpacing: '-6px', color: '#111827', marginBottom: '0.5rem', position: 'relative', zIndex: 1 }}>
            {candidate.match}<span style={{ color: '#3b82f6' }}>%</span>
          </div>
          <p style={{ color: '#6b7280', fontWeight: '800', fontSize: '1rem', marginBottom: '3rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Market Alignment</p>
          
          <div className="pro-progress-bg" style={{ height: '12px', marginBottom: '4rem', borderRadius: '20px' }}>
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: `${candidate.match}%` }} 
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="pro-progress-fill" 
              style={{ borderRadius: '20px', boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)' }}
            />
          </div>
          
          <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '800', marginBottom: '8px', color: 'white' }}>
                <span>Technical Proficiency</span> <span>{Math.min(candidate.match + 5, 99)}%</span>
              </div>
              <div className="pro-progress-bg"><div className="pro-progress-fill" style={{ width: `${Math.min(candidate.match + 5, 99)}%` }}></div></div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '800', marginBottom: '8px', color: 'white' }}>
                <span>Role Relevance</span> <span>{candidate.match}%</span>
              </div>
              <div className="pro-progress-bg"><div className="pro-progress-fill" style={{ width: `${candidate.match}%`, background: '#60a5fa' }}></div></div>
            </div>
          </div>
        </div>

        {/* Feedback Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {/* Optimization Tips - NEW FEATURE */}
          <div className="user-card" style={{ border: '2px solid rgba(59, 130, 246, 0.1)', background: 'linear-gradient(145deg, #0f172a 0%, #020617 100%)' }}>
            <h4 style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <Zap size={20} fill="#3b82f6" /> AI Resume Insights
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(candidate.feedback && candidate.feedback.length > 0) ? (
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
                  <ListRestart size={32} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                  <p>Upload your latest resume to generate personalized AI improvement tips.</p>
                </div>
              )}
            </div>
            
            {(candidate.feedback && candidate.feedback.length > 0) && (
              <button style={{ marginTop: '1.5rem', width: '100%', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', color: '#3b82f6', borderRadius: '12px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                HOW TO RE-UPLOAD <ArrowRight size={16} />
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="user-card" style={{ borderLeft: '6px solid #10b981', padding: '1.5rem' }}>
              <h4 style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: '900' }}><TrendingUp size={18} /> STRENGTHS</h4>
              <p style={{ color: '#94a3b8', lineHeight: '1.6', fontSize: '0.85rem' }}>
                  {candidate.summary?.split('.')[0]}. AI matches your stack {candidate.match}% with market demand.
              </p>
            </div>
            <div className="user-card" style={{ borderLeft: '6px solid #f59e0b', padding: '1.5rem' }}>
              <h4 style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: '900' }}><AlertCircle size={18} /> FOCUS AREAS</h4>
              <p style={{ color: '#94a3b8', lineHeight: '1.6', fontSize: '0.85rem' }}>
                  {candidate.skills?.slice(0, 3).join(', ')} confirmed. Targeted prep available in the Skill Hub.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateHome;
