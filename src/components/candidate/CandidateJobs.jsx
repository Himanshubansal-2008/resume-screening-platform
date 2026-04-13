import React, { useState } from 'react';
import { 
  MapPin, 
  Clock, 
  Briefcase, 
  DollarSign, 
  ChevronRight,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CandidateJobs = ({ jobs = [] }) => {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div className="fadeIn">
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ color: 'var(--text-primary)', fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.02em', fontFamily: 'Outfit, sans-serif' }}>
          Explore Open Roles
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.4rem', fontSize: '0.95rem' }}>
          Discover positions that match your profile and take the next step in your career.
        </p>
      </div>

      {jobs.length === 0 ? (
        <div style={{ padding: '5rem', textAlign: 'center', background: 'white', borderRadius: '24px', border: '2px dashed #e5e7eb' }}>
          <Briefcase size={48} style={{ color: '#d1d5db', marginBottom: '1.5rem' }} />
          <h4 style={{ color: '#374151', fontWeight: '700', marginBottom: '0.5rem' }}>No open roles at the moment</h4>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Check back soon for new opportunities.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
          {jobs.map((job, i) => (
            <motion.div
              layout
              key={job.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card"
              style={{
                padding: '1.75rem',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: expandedId === job.id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                boxShadow: expandedId === job.id ? '0 12px 24px rgba(59, 130, 246, 0.12)' : '0 1px 3px rgba(0,0,0,0.02)',
                background: expandedId === job.id ? '#ffffff' : '#ffffff'
              }}
              onClick={() => setExpandedId(expandedId === job.id ? null : job.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
                    <span style={{ 
                      padding: '4px 12px', 
                      background: 'rgba(59,130,246,0.08)', 
                      color: '#3b82f6', 
                      borderRadius: '100px', 
                      fontSize: '0.7rem', 
                      fontWeight: '800' ,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}>
                      {job.department}
                    </span>
                    <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Posted {job.posted}</span>
                  </div>
                  <h3 style={{ color: 'var(--text-primary)', fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.75rem', fontFamily: 'Outfit, sans-serif' }}>
                    {job.title}
                  </h3>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.85rem' }}>
                      <MapPin size={16} /> {job.location}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.85rem' }}>
                      <Clock size={16} /> {job.type}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.85rem' }}>
                      <DollarSign size={16} /> {job.salary}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {job.skills.map(skill => (
                      <span key={skill} style={{ 
                        padding: '4px 10px', 
                        background: '#f8fafc', 
                        color: '#475569', 
                        borderRadius: '6px', 
                        fontSize: '0.72rem', 
                        fontWeight: '600',
                        border: '1px solid #e2e8f0'
                      }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '12px', 
                  background: expandedId === job.id ? '#3b82f6' : '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: expandedId === job.id ? 'white' : '#64748b',
                  transition: 'all 0.3s'
                }}>
                  <motion.div animate={{ rotate: expandedId === job.id ? 90 : 0 }}>
                    <ChevronRight size={20} />
                  </motion.div>
                </div>
              </div>

              <AnimatePresence>
                {expandedId === job.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ marginTop: '1.75rem', paddingTop: '1.75rem', borderTop: '1px solid #f1f5f9' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sparkles size={16} color="#3b82f6" /> About the Role
                      </h4>
                      <p style={{ color: '#475569', lineHeight: '1.75', fontSize: '0.95rem', marginBottom: '2rem', whiteSpace: 'pre-line' }}>
                        {job.description}
                      </p>
                      
                      <button className="btn-primary" style={{ width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        Apply for this position <ArrowRight size={18} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CandidateJobs;
