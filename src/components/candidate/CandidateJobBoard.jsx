import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, DollarSign, Sparkles, ChevronRight, CheckCircle2, Search, Zap, Send, Users, Globe, Gift, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const formatTimeAgo = (dateString) => {
    if (!dateString) return 'recently';
    const date = new Date(dateString);
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' mins ago';
    return 'just now';
};

const CandidateJobBoard = ({ user, allJobs, recommendations = [], myProfile, onRefresh, setActiveTab }) => {
  const [rankedJobs, setRankedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(null);

  useEffect(() => {
    const fetchResumes = async () => {
      if (!myProfile?.email) return;
      try {
        const res = await fetch(`http://localhost:5001/api/candidates/${myProfile.email}/resumes`);
        if (res.ok) {
          const data = await res.json();
          setResumes(data);
          if (data.length > 0) {
            setSelectedResumeId(data[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch resumes:", err);
      }
    };
    fetchResumes();
  }, [myProfile?.email]);

  const safeAllJobs = Array.isArray(allJobs) ? allJobs : [];
  const departments = ['All', ...new Set(safeAllJobs.map(j => j.department))];

  useEffect(() => {
    const merged = safeAllJobs.map(job => {
      const ranking = recommendations.find(r => r.id === job.id);
      return {
        ...job,
        matchPercent: ranking?.matchPercent || 0,
        reason: ranking?.reason || 'AI analysis pending profile update.'
      };
    }).sort((a, b) => b.matchPercent - a.matchPercent);

    setRankedJobs(merged);
    if (recommendations.length > 0 || safeAllJobs.length > 0) {
      setLoading(false);
    }
  }, [recommendations, allJobs]);

  const filteredJobs = rankedJobs.filter(job => {
    const matchesFilter = filter === 'All' || job.department === filter;
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (job.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleApply = async (e, jobId, isApplied) => {
    e.stopPropagation();
    if (!myProfile || !myProfile.email) {
       alert("Profile context missing, please try signing in again.");
       return;
    }
    
    if (isApplied) {
       if (!window.confirm("Are you sure you want to cancel your application?")) return;
       setProcessingId(jobId);
       try {
           const res = await fetch(`http://localhost:5001/api/applications/${myProfile.email}/${jobId}`, { method: 'DELETE' });
           if (res.ok && onRefresh) await onRefresh();
       } catch(e) {
           console.error("Cancellation failed", e);
       } finally {
           setProcessingId(null);
       }
       return;
    }

    if (resumes.length === 0) {
       alert("Please upload at least one resume to apply for jobs.");
       if (setActiveTab) setActiveTab('submit');
       return;
    }

    setApplyingJobId(jobId);
  };

  const submitApplication = async () => {
    const selectedResume = resumes.find(r => r.id === selectedResumeId);
    if (!selectedResume) return;

    setProcessingId(applyingJobId);
    try {
        const payload = {
            candidateEmail: myProfile.email,
            jobId: applyingJobId,
            resumeName: selectedResume.name,
            resumeScore: selectedResume.score,
            resumeSummary: selectedResume.summary,
            resumeSkills: myProfile.skills || []
        };
        const res = await fetch('http://localhost:5001/api/applications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok && onRefresh) await onRefresh();
    } catch(err) {
        console.error("Apply failed", err);
    } finally {
        setProcessingId(null);
        setApplyingJobId(null);
    }
  };

  return (
    <div className="fadeIn">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
        <div>
          <h2 style={{ color: 'white', fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>AI-Ranked Career Openings</h2>
          <p style={{ color: '#94a3b8' }}>Discover roles tailored to your unique background and skills.</p>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '10px 12px 10px 40px', color: 'white', width: '250px', outline: 'none' }}
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '10px 16px', color: 'white', outline: 'none', cursor: 'pointer' }}
          >
            {departments.map(d => <option key={d} value={d} style={{ background: '#0f172a' }}>{d}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '5rem', textAlign: 'center' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} style={{ display: 'inline-block' }}>
            <Sparkles size={48} color="#3b82f6" />
          </motion.div>
          <h3 style={{ color: 'white', marginTop: '1.5rem', fontWeight: '600' }}>AI is ranking opportunities for you...</h3>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div style={{ padding: '5rem', textAlign: 'center', background: 'rgba(255,255,255,0.01)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.08)' }}>
          <Briefcase size={48} color="#334155" style={{ marginBottom: '1.5rem' }} />
          <h3 style={{ color: '#64748b', fontWeight: '600' }}>No openings match your search.</h3>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))', gap: '2.5rem' }}>
          <AnimatePresence>
            {filteredJobs.map((job, index) => {
              const isApplied = myProfile?.applications?.some(a => a.jobId === job.id) || false;
              const isExpanded = expandedId === job.id;
              
              return (
                <motion.div
                  key={job.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card"
                  style={{
                    padding: '2.5rem',
                    borderRadius: '32px',
                    border: isExpanded ? '1px solid var(--primary)' : '1px solid var(--card-border)',
                    background: isExpanded ? 'linear-gradient(145deg, hsla(217, 91%, 60%, 0.05) 0%, transparent 100%)' : 'var(--card-bg)',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onClick={() => setExpandedId(isExpanded ? null : job.id)}
                >
                  {/* High Match indicator outline block */}
                  {job.matchPercent > 85 && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #10b981, #3b82f6)' }} />
                  )}

                  {/* Title Row & Match Score */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
                          <div style={{ background: 'var(--primary-glow)', width: '52px', height: '52px', borderRadius: '16px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Briefcase size={24} color="var(--primary)" />
                          </div>
                          <div style={{ flex: 1 }}>
                              <h3 style={{ color: 'white', fontSize: '1.45rem', fontWeight: '900', letterSpacing: '-0.5px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {job.title}
                                {job.matchPercent > 85 && (
                                   <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '2px 8px', borderRadius: '12px', fontSize: '0.6rem', fontWeight: '900', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                     <Zap size={10} fill="#10b981" /> BEST MATCH
                                   </span>
                                )}
                              </h3>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: '700' }}>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Users size={13} /> {job.department}</span>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><MapPin size={13} /> {job.location}</span>
                              </div>
                          </div>
                      </div>
                      
                      {/* Match Score Bubble */}
                      <div style={{ textAlign: 'center', flexShrink: 0, marginLeft: '1rem' }}>
                        <div style={{ fontSize: '2rem', fontWeight: '900', color: job.matchPercent > 80 ? '#10b981' : 'white', letterSpacing: '-1px', marginBottom: '0.2rem' }}>
                          {job.matchPercent}<span style={{ fontSize: '1.2rem', color: 'var(--text-dim)' }}>%</span>
                        </div>
                        <p style={{ color: 'var(--text-dim)', fontWeight: '700', fontSize: '0.65rem', textTransform: 'uppercase' }}>Match</p>
                      </div>
                  </div>

                  {/* Metadata Badges */}
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                      {job.salary && (
                          <span style={{ background: 'hsla(150, 80%, 45%, 0.08)', color: 'var(--success)', border: '1px solid hsla(150, 80%, 45%, 0.2)', padding: '5px 14px', borderRadius: '30px', fontSize: '0.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <DollarSign size={13} /> {job.salary}
                          </span>
                      )}
                      <span style={{ background: 'hsla(217, 91%, 60%, 0.08)', color: 'var(--primary)', border: '1px solid hsla(217, 91%, 60%, 0.2)', padding: '5px 14px', borderRadius: '30px', fontSize: '0.8rem', fontWeight: '800' }}>
                          {job.type || 'Full-Time'}
                      </span>
                      <span style={{ background: 'hsla(255,255%,255%,0.03)', color: 'var(--text-dim)', border: '1px solid var(--card-border)', padding: '5px 14px', borderRadius: '30px', fontSize: '0.8rem', fontWeight: '700' }}>
                          Posted {formatTimeAgo(job.createdAt)}
                      </span>
                      <span style={{ background: 'hsla(255,255%,255%,0.03)', color: isExpanded ? 'var(--primary)' : 'var(--text-dim)', border: '1px solid var(--card-border)', padding: '5px 14px', borderRadius: '30px', fontSize: '0.8rem', fontWeight: '700', transition: 'all 0.3s' }}>
                          {isExpanded ? '▲ Collapse' : '▼ View Details'}
                      </span>
                  </div>

                  {/* Description Preview */}
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '1.5rem' }}>
                      {isExpanded ? job.description : (job.description || '').substring(0, 200) + '...'}
                  </p>

                  {/* Skills Chips — Always Visible */}
                  {(job.skills || []).length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1.5rem' }}>
                          {(job.skills || []).map(skill => (
                              <span key={skill} style={{ background: 'hsla(0,0%,100%,0.03)', color: 'var(--text-dim)', padding: '5px 14px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '700', border: '1px solid var(--card-border)' }}>{skill}</span>
                          ))}
                      </div>
                  )}

                  {/* Quick apply or AI Reason (when closed, we can show apply button at bottom?) 
                      Let's show the apply button always at the bottom of the visible area. 
                  */}
                  {!isExpanded && (
                     <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <div style={{ fontStyle: 'italic', fontSize: '0.85rem', color: '#cbd5e1', flex: 1, paddingRight: '1rem' }}>
                          <Sparkles size={12} color="#3b82f6" style={{ marginRight: '6px', display: 'inline' }} />
                          "{job.reason}"
                       </div>
                       <motion.button
                          whileTap={{ scale: 0.97 }}
                          whileHover={{ scale: 1.02 }}
                          onClick={(e) => handleApply(e, job.id, isApplied)}
                          disabled={processingId === job.id}
                          className="btn-action-pro"
                          style={{
                            background: isApplied ? 'rgba(16, 185, 129, 0.15)' : '#3b82f6',
                            color: isApplied ? '#10b981' : 'white',
                            border: isApplied ? '1px solid rgba(16, 185, 129, 0.3)' : 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            width: '140px', padding: '0.75rem',
                            opacity: processingId === job.id ? 0.7 : 1
                          }}
                        >
                          {processingId === job.id ? 'Processing...' : isApplied ? <><CheckCircle2 size={16} /> Applied</> : <>Apply <Send size={14} /></>}
                        </motion.button>
                     </div>
                  )}

                  {/* Expanded Details */}
                  <AnimatePresence>
                      {isExpanded && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                              <div style={{ marginTop: '1.5rem', paddingTop: '2.5rem', borderTop: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                  
                                  {/* AI Reason in Expanded View */}
                                  <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '1rem 1.5rem', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.1)', fontStyle: 'italic', fontSize: '0.9rem', color: '#cbd5e1', position: 'relative' }}>
                                    <Sparkles size={14} color="#3b82f6" style={{ position: 'absolute', right: '15px', top: '15px' }} />
                                    <span style={{ color: '#3b82f6', fontWeight: 800, marginRight: '8px', fontStyle: 'normal' }}>AI INSIGHT:</span>
                                    "{job.reason}"
                                  </div>

                                  {/* Top row: responsibilities + requirements */}
                                  {(job.responsibilities || job.requirements) && (
                                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                          {job.responsibilities && (
                                              <div style={{ background: 'hsla(217, 91%, 60%, 0.05)', padding: '1.75rem', borderRadius: '22px', border: '1px solid hsla(217, 91%, 60%, 0.12)' }}>
                                                  <div style={{ color: 'var(--primary)', fontWeight: '900', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>⚙ Key Responsibilities</div>
                                                  <p style={{ color: 'white', fontSize: '0.88rem', lineHeight: '1.75', whiteSpace: 'pre-line' }}>{job.responsibilities}</p>
                                              </div>
                                          )}
                                          {job.requirements && (
                                              <div style={{ background: 'hsla(150, 80%, 45%, 0.04)', padding: '1.75rem', borderRadius: '22px', border: '1px solid hsla(150, 80%, 45%, 0.1)' }}>
                                                  <div style={{ color: 'var(--success)', fontWeight: '900', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>✓ Requirements</div>
                                                  <p style={{ color: 'white', fontSize: '0.88rem', lineHeight: '1.75', whiteSpace: 'pre-line' }}>{job.requirements}</p>
                                              </div>
                                          )}
                                      </div>
                                  )}

                                  {/* Bonus Points */}
                                  {job.bonusPoints && (
                                      <div style={{ background: 'hsla(45, 100%, 50%, 0.04)', padding: '1.75rem', borderRadius: '22px', border: '1px solid hsla(45, 100%, 50%, 0.1)' }}>
                                          <div style={{ color: 'var(--warning)', fontWeight: '900', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>★ Bonus Points</div>
                                          <p style={{ color: 'white', fontSize: '0.88rem', lineHeight: '1.75', whiteSpace: 'pre-line' }}>{job.bonusPoints}</p>
                                      </div>
                                  )}

                                  {/* Bottom row: Perks / Process / Culture */}
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                                      <div style={{ background: 'hsla(217, 91%, 60%, 0.05)', padding: '1.5rem', borderRadius: '20px', border: '1px solid hsla(217, 91%, 60%, 0.12)' }}>
                                          <div style={{ color: 'var(--primary)', fontWeight: '900', fontSize: '0.7rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}><Gift size={15} /> Perks</div>
                                          <p style={{ color: 'white', fontSize: '0.9rem', lineHeight: '1.6' }}>{job.benefits || 'Premium reward stack.'}</p>
                                      </div>
                                      <div style={{ background: 'hsla(45, 100%, 50%, 0.05)', padding: '1.5rem', borderRadius: '20px', border: '1px solid hsla(45, 100%, 50%, 0.12)' }}>
                                          <div style={{ color: 'var(--warning)', fontWeight: '900', fontSize: '0.7rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}><Zap size={15} /> Process</div>
                                          <p style={{ color: 'white', fontSize: '0.9rem', lineHeight: '1.6' }}>{job.interviewProcess || 'Streamlined loop.'}</p>
                                      </div>
                                      <div style={{ background: 'hsla(255, 90%, 75%, 0.05)', padding: '1.5rem', borderRadius: '20px', border: '1px solid hsla(255, 90%, 75%, 0.12)' }}>
                                          <div style={{ color: '#a78bfa', fontWeight: '900', fontSize: '0.7rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}><Globe size={15} /> Culture</div>
                                          <p style={{ color: 'white', fontSize: '0.9rem', lineHeight: '1.6' }}>{job.culture || 'High-velocity DNA.'}</p>
                                      </div>
                                  </div>

                                  {/* Apply Button at bottom of expanded view */}
                                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                                    <motion.button
                                      whileTap={{ scale: 0.97 }}
                                      whileHover={{ scale: 1.02 }}
                                      onClick={(e) => handleApply(e, job.id, isApplied)}
                                      disabled={processingId === job.id}
                                      className="btn-action-pro"
                                      style={{
                                        background: isApplied ? 'rgba(16, 185, 129, 0.15)' : '#3b82f6',
                                        color: isApplied ? '#10b981' : 'white',
                                        border: isApplied ? '1px solid rgba(16, 185, 129, 0.3)' : 'none',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s',
                                        width: '100%', padding: '1.25rem', fontSize: '1.1rem',
                                        opacity: processingId === job.id ? 0.7 : 1
                                      }}
                                    >
                                      {processingId === job.id ? 'Processing...' : isApplied ? <><CheckCircle2 size={20} /> Application Submitted! (Click to cancel)</> : <>Quick Apply with AI Profile <Send size={18} /></>}
                                    </motion.button>
                                  </div>
                              </div>
                          </motion.div>
                      )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Resume Selection Modal */}
      <AnimatePresence>
        {applyingJobId && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="glass-card" style={{ width: '100%', maxWidth: '600px', padding: '2.5rem', borderRadius: '32px', position: 'relative' }}>
               <button onClick={() => setApplyingJobId(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}><X size={24} /></button>
               <h3 style={{ color: 'white', fontSize: '1.8rem', fontWeight: '800', marginBottom: '1rem' }}>Select Resume</h3>
               <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>Choose which resume profile to send to the recruiter for this application.</p>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', maxHeight: '40vh', overflowY: 'auto' }}>
                 {resumes.map(r => (
                   <div key={r.id} onClick={() => setSelectedResumeId(r.id)} style={{ padding: '1rem 1.5rem', background: selectedResumeId === r.id ? 'hsla(217, 91%, 60%, 0.1)' : 'var(--bg-primary)', border: selectedResumeId === r.id ? '2px solid var(--primary)' : '2px solid transparent', borderRadius: '16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div>
                        <div style={{ color: 'white', fontWeight: '800', fontSize: '1.1rem' }}>{r.name}</div>
                        <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: '4px' }}>Added: {r.date}</div>
                     </div>
                     <div style={{ color: 'var(--primary)', fontWeight: '900' }}>{r.score}% Match</div>
                   </div>
                 ))}
               </div>
               <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button onClick={() => setApplyingJobId(null)} className="btn-action-pro" style={{ padding: '1rem 2rem' }}>Cancel</button>
                  <button onClick={submitApplication} className="btn-action-pro btn-primary" style={{ padding: '1rem 2rem' }} disabled={processingId === applyingJobId}>
                      {processingId === applyingJobId ? 'Submitting...' : 'Submit Application'}
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CandidateJobBoard;
