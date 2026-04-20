import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import {
  User, Mail, Calendar, Code2, Briefcase,
  FileText, CheckCircle, Copy, Plus,
  BadgeCheck, TrendingUp, Zap,
  Trash2, Loader2, Cpu, AlertCircle,
  FilePlus, Archive
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './candidate.css';

const MAX_RESUMES = 4;
const API_BASE = 'http://localhost:5001/api';

/* ── Avatar ── */
const Avatar = ({ user, size = 96 }) => {
  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase() || '?';
  return user?.imageUrl ? (
    <img src={user.imageUrl} alt={user.fullName}
      className="cp-avatar-img"
      style={{ width: size, height: size }} />
  ) : (
    <div className="cp-avatar-placeholder"
      style={{ width: size, height: size, fontSize: size * 0.35 }}>
      {initials}
    </div>
  );
};

/* ── Stat Card ── */
const StatCard = ({ icon, label, value, color = 'var(--primary)' }) => (
  <div className="cp-stat-card">
    <div className="cp-stat-icon-box" style={{ background: `${color}18` }}>
      {React.cloneElement(icon, { size: 22, color })}
    </div>
    <div>
      <div className="cp-stat-label">{label}</div>
      <div className="cp-stat-value">{value}</div>
    </div>
  </div>
);

/* ── Skill Pill ── */
const SkillPill = ({ label }) => (
  <span className="cp-skill-pill">{label}</span>
);

/* ── Score Ring ── */
const ScoreRing = ({ score }) => {
  const r = 28, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 70 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--danger)';
  return (
    <div className="cp-score-ring-wrapper">
      <svg width={72} height={72} className="cp-score-ring">
        <circle cx={36} cy={36} r={r} fill="none" stroke="hsla(255,100%,100%,0.05)" strokeWidth={6} />
        <circle cx={36} cy={36} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease', transform: 'rotate(-90deg)', transformOrigin: 'center' }} />
      </svg>
      <div className="cp-ring-text-overlay">{score}%</div>
    </div>
  );
};

/* ═══════════════════════════════════════════ */
const CandidateProfile = ({ user, myProfile, onRefresh, setActiveTab }) => {
  const [copied, setCopied] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [uploadState, setUploadState] = useState('idle');
  const [uploadMsg, setUploadMsg] = useState('');
  const fileInputRef = useRef(null);

  const email = user?.primaryEmailAddress?.emailAddress ?? '—';
  const fullName = user?.fullName ?? (`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'Candidate');
  const joinedAt = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '—';
  const score = myProfile?.match ?? 0;
  const skills = myProfile?.skills ?? [];

  const fetchResumes = async () => {
    if (!email || email === '—') return;
    try {
      const res = await fetch(`${API_BASE}/candidates/${email}/resumes`);
      if (res.ok) setResumes(await res.json());
    } catch (err) { console.error("Failed to fetch resumes:", err); }
  };

  useEffect(() => { fetchResumes(); }, [email]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
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
    formData.append('resumeTitle', file.name);
    try {
      const res = await fetch(`${API_BASE}/candidates`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      await res.json();
      await fetchResumes();
      if (onRefresh) onRefresh();
      setUploadState('idle');
    } catch (err) {
      console.error(err);
      setUploadMsg('Upload failed. Please try again.');
      setUploadState('error');
      setTimeout(() => setUploadState('idle'), 4000);
    }
  };

  const deleteResume = async (id) => {
    try {
      await fetch(`${API_BASE}/resumes/${id}`, { method: 'DELETE' });
      await fetchResumes();
    } catch (err) { console.error("Failed to delete resume:", err); }
  };

  const setActive = async (id) => {
    try {
      await fetch(`${API_BASE}/resumes/${id}/active`, { method: 'PUT' });
      await fetchResumes();
    } catch (err) { console.error("Failed to set active resume:", err); }
  };

  const activeResume = resumes.find(r => r.active);

  const copyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fadeIn cp-container">

      {/* ── Hero Banner ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card cp-hero-banner">
        <div className="cp-hero-glow" />
        <div className="cp-hero-content">
          <Avatar user={user} size={100} />
          <div className="cp-hero-info">
            <div className="cp-hero-name-row">
              <h2 className="cp-hero-name">{fullName}</h2>
              <BadgeCheck size={22} color="var(--primary)" />
            </div>
            <div className="cp-hero-email-row">
              <Mail size={15} /><span>{email}</span>
              <button onClick={copyEmail} title="Copy email"
                className={`cp-copy-btn ${copied ? 'copied' : ''}`}>
                {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <div className="cp-hero-joined-row">
              <Calendar size={13} /><span>Member since {joinedAt}</span>
            </div>
          </div>
          <div className="cp-hero-score-box">
            <div className="cp-hero-score-value">
              {score}<span className="cp-hero-score-unit">%</span>
            </div>
            <div className="cp-hero-score-label">MATCH SCORE</div>
          </div>
        </div>
      </motion.div>


      {/* ── Main Grid ── */}
      <div className="cp-main-grid">

        {/* Left Column */}
        <div className="cp-column">

          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="glass-card">
            <h4 className="cp-section-title">
              <Code2 size={18} color="var(--accent)" /> Detected Skills
            </h4>
            {skills.length > 0 ? (
              <div className="cp-skills-container">
                {skills.map((s, i) => <SkillPill key={i} label={s} />)}
              </div>
            ) : (
              <p className="cp-skills-empty">
                No skills extracted yet. Upload a resume below to get AI-powered skill detection.
              </p>
            )}
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="cp-column">
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
            className="glass-card cp-vault-card">

            <div className="cp-vault-header">
              <div className="cp-vault-header-left">
                <div className="cp-vault-icon-wrapper">
                  <Archive size={22} color="var(--accent)" />
                </div>
                <div>
                  <h3 className="cp-vault-title">Resume Vault</h3>
                  <p className="cp-vault-subtitle">{resumes.length} of {MAX_RESUMES} slots used</p>
                </div>
              </div>
              <button
                onClick={() => typeof setActiveTab === 'function' && setActiveTab('submit')}
                disabled={resumes.length >= MAX_RESUMES}
                className={`cp-btn-add-resume ${resumes.length >= MAX_RESUMES ? 'disabled' : 'enabled'}`}>
                <Plus size={15} /> Add Resume
              </button>
            </div>

            <AnimatePresence>
              {uploadState === 'error' && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="cp-error-banner">
                  <AlertCircle size={16} /> {uploadMsg}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {uploadState === 'uploading' && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="cp-upload-progress">
                  <Cpu size={18} color="var(--primary)" />
                  <div className="cp-upload-progress-info">
                    <div className="cp-progress-title">AI is analyzing your resume…</div>
                    <div className="cp-progress-subtitle">Parsing skills, experience, and fit score</div>
                  </div>
                  <Loader2 size={18} color="var(--primary)" className="cp-spin" />
                </motion.div>
              )}
            </AnimatePresence>

            {resumes.length === 0 ? (
              <div className="cp-vault-empty">
                <FilePlus size={36} color="hsla(260,80%,70%,0.4)" className="cp-vault-empty-icon" />
                <p className="cp-vault-empty-text">
                  No resumes yet.<br />
                  Click <strong className="cp-primary-text">Add Resume</strong> to upload your first PDF (max {MAX_RESUMES}).
                </p>
              </div>
            ) : (
              <div className="cp-resume-list">
                {resumes.map((r, idx) => (
                  <AnimatePresence key={r.id}>
                    <motion.div
                      initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className={`cp-resume-item ${r.active ? 'active' : 'inactive'}`}>
                      <ScoreRing score={r.score} />
                      <div className="cp-resume-meta">
                        <div className="cp-resume-name-row">
                          <div className="cp-resume-name">{r.name}</div>
                          {r.active && <span className="cp-active-badge">ACTIVE</span>}
                        </div>
                        <div className="cp-resume-info-text">
                          Uploaded {r.date} · AI Score: <span className="cp-resume-score-highlight">{r.score}%</span>
                        </div>
                      </div>
                      <div className="cp-resume-actions">
                        {!r.active && (
                          <button onClick={() => setActive(r.id)} title="Set as active" className="cp-btn-set-active">
                            <CheckCircle size={12} /> Set Active
                          </button>
                        )}
                        <button onClick={() => deleteResume(r.id)} title="Delete resume" className="cp-btn-delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                ))}
                {resumes.length < MAX_RESUMES && (
                  <div className="cp-slots-indicator">
                    {Array.from({ length: MAX_RESUMES }).map((_, i) => (
                      <div key={i} className={`cp-slot-dot ${i < resumes.length ? 'filled' : ''}`} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeResume?.summary && (
              <div className="cp-active-summary-box">
                <div className="cp-summary-header">
                  <Zap size={12} /> ACTIVE RESUME · AI SUMMARY
                </div>
                <p className="cp-summary-text">
                  {activeResume.summary.slice(0, 280)}{activeResume.summary.length > 280 ? '…' : ''}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfile;
