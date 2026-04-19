import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Video, Sparkles, Briefcase, MapPin, Target, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CandidatePrepHub = ({ myProfile, setActiveTab, setActiveInterviewApp }) => {
  const [expandedId, setExpandedId] = useState(null);

  const applications = myProfile?.applications || [];

  return (
    <div className="fadeIn" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
            <Sparkles size={16} color="#3b82f6" />
            <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Simulation Readiness</span>
          </div>
          <h2 style={{ color: 'white', fontSize: '1.6rem', fontWeight: '800', fontFamily: 'Outfit, sans-serif' }}>Interview Prep Hub</h2>
          <p style={{ color: 'var(--text-dim)', marginTop: '0.35rem', fontSize: '0.88rem' }}>Engage in full-stack AI-driven interviews mapped dynamically to your actual applications.</p>
        </div>
      </div>

      {applications.length === 0 ? (
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '24px', padding: '4rem 2rem', textAlign: 'center' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '50%', display: 'inline-flex', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Target size={40} color="var(--text-muted)" />
              </div>
              <h3 style={{ color: 'white', fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.75rem' }}>No Active Applications</h3>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem' }}>You have not submitted any job applications yet. Head over to the Job Board to apply and unlock their customized Interview Simulations here!</p>
          </div>
      ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {applications.map((app, i) => {
              if (!app.job) return null; // Edge case
              
              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="glass-card"
                  style={{
                    padding: 0,
                    overflow: 'hidden',
                    borderRadius: '16px',
                    border: '1px solid var(--card-border)',
                    background: 'var(--card-bg)'
                  }}
                >
                  <div style={{ padding: '1.5rem 1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '4px 12px', borderRadius: '7px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                                {app.job.department}
                            </span>
                            <h3 style={{ color: 'white', fontSize: '1.1rem', fontWeight: '700', lineHeight: '1.5' }}>{app.job.title}</h3>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                            {app.resumeName && <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>📄 Profile: {app.resumeName}</span>}
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} /> {app.job.location}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)' }}>★ {app.resumeScore || app.candidate?.match}% Match Context</span>
                        </div>
                    </div>

                    <div style={{ marginLeft: '1rem', flexShrink: 0 }}>
                       <button
                          onClick={() => {
                              setActiveInterviewApp(app);
                              setActiveTab('interview');
                          }}
                          className="btn-action-pro btn-primary"
                          style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}
                        >
                          <Video size={16} /> Enter Interview
                        </button>
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </div>
      )}
    </div>
  );
};

export default CandidatePrepHub;
