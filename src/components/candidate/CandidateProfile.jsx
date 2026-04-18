import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import {
  User, Mail, Calendar, Award, Code2, Briefcase, Star,
  FileText, CheckCircle, Copy, ExternalLink, Plus,
  BadgeCheck, TrendingUp, Zap, Shield, Hash, Clock,
  Trash2, UploadCloud, Loader2, Cpu, AlertCircle,
  FilePlus, Archive
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MAX_RESUMES = 5;
const API_BASE = 'http://localhost:5001/api';
const STORAGE_KEY = (email) => `hireai_resumes_${email}`;

/* ── Avatar ── */
const Avatar = ({ user, size = 96 }) => {
  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase() || '?';
  return user?.imageUrl ? (
    <img src={user.imageUrl} alt={user.fullName}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover',
        border: '3px solid var(--primary)',
        boxShadow: '0 0 0 4px hsla(217,91%,60%,0.15), 0 12px 40px rgba(0,0,0,0.4)' }} />
  ) : (
    <div style={{ width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, var(--primary), var(--accent))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 900, color: 'white',
      border: '3px solid var(--primary)',
      boxShadow: '0 0 0 4px hsla(217,91%,60%,0.15), 0 12px 40px rgba(0,0,0,0.4)' }}>
      {initials}
    </div>
  );
};

/* ── Stat Card ── */
const StatCard = ({ icon, label, value, color = 'var(--primary)' }) => (
  <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)',
    borderRadius: 20, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: 16,
    backdropFilter: 'blur(20px)' }}>
    <div style={{ width: 46, height: 46, borderRadius: 14, background: `${color}18`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {React.cloneElement(icon, { size: 22, color })}
    </div>
    <div>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 800,
        letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ color: 'white', fontWeight: 900, fontSize: '1.1rem', marginTop: 2 }}>{value}</div>
    </div>
  </div>
);

/* ── Skill Pill ── */
const SkillPill = ({ label }) => (
  <span style={{ padding: '5px 14px', borderRadius: 99,
    background: 'hsla(217,91%,60%,0.08)', border: '1px solid hsla(217,91%,60%,0.2)',
    color: 'var(--primary)', fontSize: '0.78rem', fontWeight: 700 }}>
    {label}
  </span>
);

/* ── Score Ring ── */
const ScoreRing = ({ score }) => {
  const r = 28, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 70 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--danger)';
  return (
    <svg width={72} height={72} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={36} cy={36} r={r} fill="none" stroke="hsla(255,100%,100%,0.05)" strokeWidth={6} />
      <circle cx={36} cy={36} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
      <text x={36} y={36} fill="white" textAnchor="middle" dominantBaseline="central"
        style={{ transform: 'rotate(90deg)', transformOrigin: '36px 36px',
          fontSize: '0.75rem', fontWeight: 900, fontFamily: 'Outfit, sans-serif' }}>
        {score}%
      </text>
    </svg>
  );
};

/* ═══════════════════════════════════════════ */
const CandidateProfile = ({ user, myProfile, onRefresh }) => {
  const [copied, setCopied] = useState(false);

  /* ── Resume Vault state ── */
  const [resumes, setResumes] = useState([]);        // [{id, name, date, score, summary, active}]
  const [uploadState, setUploadState] = useState('idle'); // idle | uploading | error
  const [uploadMsg, setUploadMsg] = useState('');
  const fileInputRef = useRef(null);

  const email = user?.primaryEmailAddress?.emailAddress ?? '—';
  const fullName = user?.fullName ?? (`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'Candidate');
  const joinedAt = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '—';
  const score = myProfile?.match ?? 0;
  const skills = myProfile?.skills ?? [];
  const experience = myProfile?.experience ?? [];
  const education = myProfile?.education ?? [];

  /* ── Load vault from localStorage ── */
  useEffect(() => {
    if (!email || email === '—') return;
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY(email)) || '[]');
      setResumes(stored);
    } catch { setResumes([]); }
  }, [email]);

  const saveVault = (updated) => {
    setResumes(updated);
    localStorage.setItem(STORAGE_KEY(email), JSON.stringify(updated));
  };

  /* ── Upload handler ── */
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';          // reset so same file can re-trigger

    if (file.type !== 'application/pdf') {
      setUploadMsg('Only PDF files are supported.');
      setUploadState('error');
      setTimeout(() => setUploadState('idle'), 3000);
      return;
    }
    if (resumes.length >= MAX_RESUMES) {
      setUploadMsg(`You can store up to ${MAX_RESUMES} resumes. Delete one first.`);
      setUploadState('error');
      setTimeout(() => setUploadState('idle'), 3000);
      return;
    }

    setUploadState('uploading');
    setUploadMsg('');

    const formData = new FormData();
    formData.append('resumePdf', file);
    formData.append('email', email);
    formData.append('name', fullName || 'Candidate');
    formData.append('role', 'Software Engineer Applicant');

    try {
      const res = await fetch(`${API_BASE}/candidates`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();

      const entry = {
        id: Date.now(),
        name: file.name,
        date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
        score: data.match ?? 0,
        summary: data.summary ?? '',
        active: resumes.length === 0   // first upload = active by default
      };

      // Deactivate others if this is now active
      const updated = resumes.length === 0
        ? [entry]
        : [...resumes, { ...entry, active: false }];
      saveVault(updated);
      if (onRefresh) onRefresh();
      setUploadState('idle');
    } catch (err) {
      console.error(err);
      setUploadMsg('Upload failed. Please try again.');
      setUploadState('error');
      setTimeout(() => setUploadState('idle'), 4000);
    }
  };

  const deleteResume = (id) => {
    const updated = resumes.filter(r => r.id !== id);
    // If we deleted the active one, make the first remaining active
    if (updated.length > 0 && !updated.some(r => r.active)) {
      updated[0].active = true;
    }
    saveVault(updated);
  };

  const setActive = (id) => {
    const updated = resumes.map(r => ({ ...r, active: r.id === id }));
    saveVault(updated);
  };

  const activeResume = resumes.find(r => r.active);

  const copyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ══════════════════════════ RENDER ══════════════════════════ */
  return (
    <div className="fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

      {/* ── Hero Banner ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card"
        style={{ background: 'linear-gradient(135deg, hsla(217,91%,60%,0.08) 0%, hsla(260,80%,70%,0.05) 100%)',
          borderTop: '3px solid var(--primary)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 260, height: 260,
          background: 'var(--primary-glow)', filter: 'blur(80px)', borderRadius: '50%',
          opacity: 0.25, pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem', position: 'relative', zIndex: 1 }}>
          <Avatar user={user} size={100} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <h2 style={{ fontSize: '2rem', color: 'white', letterSpacing: '-0.04em' }}>{fullName}</h2>
              <BadgeCheck size={22} color="var(--primary)" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: 4 }}>
              <Mail size={15} /><span>{email}</span>
              <button onClick={copyEmail} title="Copy email"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px',
                  borderRadius: 6, color: copied ? 'var(--success)' : 'var(--text-muted)', transition: 'color 0.2s' }}>
                {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              <Calendar size={13} /><span>Member since {joinedAt}</span>
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '1.2rem 2rem',
            background: 'hsla(217,91%,60%,0.08)', borderRadius: 20, border: '1px solid hsla(217,91%,60%,0.2)' }}>
            <div style={{ fontSize: '2.8rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>
              {score}<span style={{ color: 'var(--primary)', fontSize: '1.4rem' }}>%</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.08em', marginTop: 4 }}>MATCH SCORE</div>
          </div>
        </div>
      </motion.div>


      {/* ── Main Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.9fr', gap: '2rem' }}>

        {/* ── Left Column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* Account Info */}
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
            className="glass-card">
            <h4 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.8rem', fontSize: '1.05rem' }}>
              <User size={18} color="var(--primary)" /> Account Info
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}><Mail size={15} /></span>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</div>
                  <div style={{ color: 'var(--text-main)', fontSize: '0.88rem', fontWeight: 600, marginTop: 1 }}>{email}</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Skills */}
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="glass-card">
            <h4 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem', fontSize: '1.05rem' }}>
              <Code2 size={18} color="var(--accent)" /> Detected Skills
            </h4>
            {skills.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {skills.map((s, i) => <SkillPill key={i} label={s} />)}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.7 }}>
                No skills extracted yet. Upload a resume below to get AI-powered skill detection.
              </p>
            )}
          </motion.div>
        </div>

        {/* ── Right Column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* ══ RESUME VAULT ══ */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
            className="glass-card" style={{ borderTop: '3px solid var(--accent)' }}>

            {/* Vault header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14,
                  background: 'linear-gradient(135deg, hsla(260,80%,70%,0.2), hsla(217,91%,60%,0.15))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Archive size={22} color="var(--accent)" />
                </div>
                <div>
                  <h3 style={{ color: 'white', fontSize: '1.2rem', fontWeight: 900 }}>Resume Vault</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 2 }}>
                    {resumes.length} of {MAX_RESUMES} slots used
                  </p>
                </div>
              </div>

              {/* Upload button */}
              <div>
                <input type="file" ref={fileInputRef} accept="application/pdf"
                  onChange={handleFileChange} style={{ display: 'none' }} />
                <button
                  onClick={() => resumes.length < MAX_RESUMES && uploadState === 'idle' && fileInputRef.current?.click()}
                  disabled={resumes.length >= MAX_RESUMES || uploadState === 'uploading'}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '9px 18px', borderRadius: 14,
                    background: resumes.length >= MAX_RESUMES ? 'hsla(255,100%,100%,0.04)' : 'var(--primary)',
                    color: resumes.length >= MAX_RESUMES ? 'var(--text-muted)' : 'white',
                    border: 'none', fontWeight: 800, fontSize: '0.82rem',
                    cursor: resumes.length >= MAX_RESUMES || uploadState === 'uploading' ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s', opacity: uploadState === 'uploading' ? 0.7 : 1
                  }}>
                  {uploadState === 'uploading'
                    ? <><Loader2 size={15} className="spin" /> Analyzing…</>
                    : <><Plus size={15} /> Add Resume</>}
                </button>
              </div>
            </div>

            {/* Upload error banner */}
            <AnimatePresence>
              {uploadState === 'error' && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ marginBottom: '1.5rem', padding: '0.9rem 1.2rem', borderRadius: 14,
                    background: 'hsla(0,85%,60%,0.08)', border: '1px solid hsla(0,85%,60%,0.2)',
                    display: 'flex', alignItems: 'center', gap: 10, color: 'var(--danger)', fontSize: '0.84rem', fontWeight: 700 }}>
                  <AlertCircle size={16} /> {uploadMsg}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Uploading progress */}
            <AnimatePresence>
              {uploadState === 'uploading' && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ marginBottom: '1.5rem', padding: '1rem 1.2rem', borderRadius: 14,
                    background: 'hsla(217,91%,60%,0.06)', border: '1px solid hsla(217,91%,60%,0.15)',
                    display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Cpu size={18} color="var(--primary)" />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'white', fontWeight: 800, fontSize: '0.88rem' }}>AI is analyzing your resume…</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 2 }}>Parsing skills, experience, and fit score</div>
                  </div>
                  <Loader2 size={18} color="var(--primary)" className="spin" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Resume list */}
            {resumes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem',
                border: '1.5px dashed hsla(260,80%,70%,0.2)', borderRadius: 20 }}>
                <FilePlus size={36} color="hsla(260,80%,70%,0.4)" style={{ marginBottom: 12 }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.7 }}>
                  No resumes yet.<br />
                  Click <strong style={{ color: 'var(--primary)' }}>Add Resume</strong> to upload your first PDF (max {MAX_RESUMES}).
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                {resumes.map((r, idx) => (
                  <AnimatePresence key={r.id}>
                    <motion.div
                      initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        padding: '1rem 1.25rem', borderRadius: 16,
                        background: r.active ? 'hsla(217,91%,60%,0.08)' : 'hsla(255,100%,100%,0.02)',
                        border: r.active ? '1.5px solid hsla(217,91%,60%,0.3)' : '1px solid var(--card-border)',
                        transition: 'all 0.2s'
                      }}>

                      {/* Score ring */}
                      <ScoreRing score={r.score} />

                      {/* Meta */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ color: 'white', fontWeight: 800, fontSize: '0.9rem',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {r.name}
                          </div>
                          {r.active && (
                            <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: '0.62rem',
                              fontWeight: 900, background: 'hsla(217,91%,60%,0.15)',
                              color: 'var(--primary)', border: '1px solid hsla(217,91%,60%,0.25)',
                              letterSpacing: '0.05em', flexShrink: 0 }}>
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 3 }}>
                          Uploaded {r.date} · AI Score: <span style={{ color: 'white', fontWeight: 700 }}>{r.score}%</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        {!r.active && (
                          <button onClick={() => setActive(r.id)} title="Set as active"
                            style={{ display: 'flex', alignItems: 'center', gap: 5,
                              padding: '5px 12px', borderRadius: 10,
                              background: 'hsla(217,91%,60%,0.08)', border: '1px solid hsla(217,91%,60%,0.2)',
                              color: 'var(--primary)', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer' }}>
                            <CheckCircle size={12} /> Set Active
                          </button>
                        )}
                        <button onClick={() => deleteResume(r.id)} title="Delete resume"
                          style={{ width: 32, height: 32, borderRadius: 10, border: 'none',
                            background: 'hsla(0,85%,60%,0.08)', color: 'var(--danger)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', transition: 'background 0.2s' }}
                          onMouseOver={e => e.currentTarget.style.background = 'hsla(0,85%,60%,0.18)'}
                          onMouseOut={e => e.currentTarget.style.background = 'hsla(0,85%,60%,0.08)'}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                ))}

                {/* Slot indicator */}
                {resumes.length < MAX_RESUMES && (
                  <div style={{ display: 'flex', gap: 6, paddingTop: 4 }}>
                    {Array.from({ length: MAX_RESUMES }).map((_, i) => (
                      <div key={i} style={{
                        height: 4, flex: 1, borderRadius: 99,
                        background: i < resumes.length ? 'var(--primary)' : 'hsla(255,100%,100%,0.06)',
                        transition: 'background 0.3s'
                      }} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Active resume summary */}
            {activeResume?.summary && (
              <div style={{ marginTop: '1.5rem', padding: '1.1rem 1.25rem', borderRadius: 16,
                background: 'hsla(217,91%,60%,0.04)', border: '1px solid hsla(217,91%,60%,0.1)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--primary)', fontWeight: 900,
                  letterSpacing: '0.08em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Zap size={12} /> ACTIVE RESUME · AI SUMMARY
                </div>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.83rem', lineHeight: 1.8 }}>
                  {activeResume.summary.slice(0, 280)}{activeResume.summary.length > 280 ? '…' : ''}
                </p>
              </div>
            )}
          </motion.div>

        </div>
      </div>

      {/* Spin keyframe */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`}</style>
    </div>
  );
};

export default CandidateProfile;
