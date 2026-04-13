import React, { useState } from 'react';
import { 
  Plus,
  MapPin, 
  Clock, 
  Users, 
  Briefcase, 
  DollarSign,
  MoreVertical,
  ChevronRight,
  Sparkles,
  Trash2,
  Edit3,
  UploadCloud,
  FileText,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LiveKeywordStream from '../shared/LiveKeywordStream';

const AdminJobDescriptions = ({ jobs: initialJobs = [] }) => {
  const [jobs, setJobs] = useState(initialJobs);
  const [expandedId, setExpandedId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', department: '', location: '', type: 'Full-Time', description: '', skills: '' });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [keywords, setKeywords] = useState([]);
  const fileInputRef = React.useRef(null);

  // Update local state if props change (simple sync)
  React.useEffect(() => {
    setJobs(initialJobs);
  }, [initialJobs]);

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append('jdPdf', file);

    try {
      const res = await fetch('http://localhost:5001/api/jobs/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (res.ok) {
        setKeywords(data.analysisKeywords || []);
        // Pre-fill form
        setNewJob({
          title: data.title || '',
          department: data.department || '',
          location: data.location || '',
          type: 'Full-Time',
          description: data.description || '',
          skills: Array.isArray(data.skills) ? data.skills.join('\n') : ''
        });
        setShowCreateForm(true);
      }
    } catch (err) {
      console.error("JD Extraction failed:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanent delete?")) return;
    try {
      const res = await fetch(`http://localhost:5001/api/jobs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setJobs(prev => prev.filter(j => j.id !== id));
        if (initialJobs.length > 0 && typeof onRefresh === 'function') onRefresh();
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5001/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJob)
      });
      
      if (res.ok) {
        setNewJob({ title: '', department: '', location: '', type: 'Full-Time', description: '', skills: '' });
        setShowCreateForm(false);
        if (typeof onRefresh === 'function') onRefresh();
      }
    } catch (err) {
      console.error("Create failed:", err);
    }
  };

  return (
    <div className="fadeIn">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h2 style={{ color: 'white', fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
            Job Descriptions
          </h2>
          <p style={{ color: '#94a3b8', marginTop: '0.5rem', fontSize: '0.9rem' }}>
            {jobs.length} positions • {jobs.filter(j => j.status === 'Active').length} actively hiring
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handlePdfUpload} 
            style={{ display: 'none' }} 
            accept="application/pdf"
          />
          <button 
            onClick={() => fileInputRef.current.click()}
            className="btn-action-pro" 
            style={{ 
              padding: '1rem 1.5rem', 
              background: 'rgba(59, 130, 246, 0.1)', 
              color: '#3b82f6', 
              borderRadius: '16px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              fontSize: '0.9rem',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {isAnalyzing ? <Loader2 size={18} className="spin" /> : <UploadCloud size={18} />}
            <span>{isAnalyzing ? 'AI Extracting...' : 'Upload JD PDF'}</span>
            <LiveKeywordStream isAnalyzing={isAnalyzing} customKeywords={keywords} />
          </button>
          
          <button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn-action-pro" 
            style={{ 
              padding: '1rem 2rem', 
              background: '#3b82f6', 
              color: 'white', 
              borderRadius: '16px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
              fontSize: '0.9rem'
            }}
          >
            <Plus size={18} /> New Job Posting
          </button>
        </div>
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden', marginBottom: '2rem' }}
          >
            <form onSubmit={handleCreate} className="glass-card" style={{ padding: '2.5rem', borderRadius: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
                <Sparkles size={20} color="#3b82f6" />
                <h3 style={{ color: 'white', fontSize: '1.25rem', fontWeight: '800' }}>Create New Position</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '700' }}>JOB TITLE</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Senior React Developer" 
                    value={newJob.title}
                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                    required
                    style={inputStyle}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '700' }}>DEPARTMENT</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Engineering" 
                    value={newJob.department}
                    onChange={(e) => setNewJob({ ...newJob, department: e.target.value })}
                    required
                    style={inputStyle}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '700' }}>LOCATION</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Remote" 
                    value={newJob.location}
                    onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                    required
                    style={inputStyle}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '700' }}>MATCHING KEYWORDS (ONE PER LINE)</label>
                  <textarea 
                    placeholder="React&#10;TypeScript&#10;Node.js" 
                    value={newJob.skills}
                    onChange={(e) => setNewJob({ ...newJob, skills: e.target.value })}
                    style={{ ...inputStyle, height: '100px', resize: 'none' }}
                  />
                </div>
              </div>

              <textarea 
                placeholder="Write a compelling job description..." 
                value={newJob.description}
                onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                required
                style={{ ...inputStyle, height: '120px', resize: 'vertical' }}
              />

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setShowCreateForm(false)}
                  style={{ ...inputStyle, cursor: 'pointer', width: 'auto', padding: '0.75rem 2rem', textAlign: 'center' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn-action-pro"
                  style={{ padding: '0.75rem 2rem', background: '#3b82f6', color: 'white', fontSize: '0.9rem', borderRadius: '12px' }}
                >
                  Publish Job
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Job Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '1.5rem' }}>
        {jobs.map(job => (
          <motion.div 
            layout
            key={job.id} 
            className="glass-card" 
            style={{ 
              padding: '2rem', 
              borderRadius: '24px', 
              cursor: 'pointer',
              transition: 'all 0.3s',
              border: expandedId === job.id ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(255,255,255,0.08)'
            }}
            onClick={() => setExpandedId(expandedId === job.id ? null : job.id)}
          >
            {/* Card Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                  <span 
                    className="pill-capsule" 
                    style={{ 
                      background: job.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', 
                      color: job.status === 'Active' ? '#10b981' : '#f59e0b',
                      fontSize: '0.65rem'
                    }}
                  >
                    {job.status}
                  </span>
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{job.posted}</span>
                </div>
                <h3 style={{ color: 'white', fontSize: '1.2rem', fontWeight: '800', letterSpacing: '-0.02em' }}>{job.title}</h3>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(job.id); }} 
                  className="btn-action-pro" 
                  style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '6px' }}
                >
                  <Trash2 size={14} />
                </button>
                <button className="btn-action-pro" style={{ padding: '6px' }}>
                  <Edit3 size={14} />
                </button>
              </div>
            </div>

            {/* Meta Info */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.8rem' }}>
                <Briefcase size={14} /> {job.department}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.8rem' }}>
                <MapPin size={14} /> {job.location}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.8rem' }}>
                <Clock size={14} /> {job.type}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.8rem' }}>
                <DollarSign size={14} /> {job.salary}
              </span>
            </div>

            {/* Applicants Count */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <Users size={16} color="#3b82f6" />
              <span style={{ color: 'white', fontWeight: '700', fontSize: '0.9rem' }}>{job.applicants}</span>
              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>applicants</span>
            </div>

            {/* Skills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {job.skills.map(skill => (
                <span 
                  key={skill} 
                  style={{ 
                    padding: '4px 12px', 
                    background: 'rgba(59, 130, 246, 0.1)', 
                    border: '1px solid transparent',
                    borderRadius: '8px', 
                    color: '#3b82f6', 
                    fontSize: '0.7rem', 
                    fontWeight: '700' 
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>

            {/* Expanded Description */}
            <AnimatePresence>
              {expandedId === job.id && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <p style={{ color: '#94a3b8', lineHeight: '1.7', fontSize: '0.9rem' }}>{job.description}</p>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                      <button className="btn-action-pro" style={{ background: '#3b82f6', color: 'white', padding: '8px 16px' }}>
                        View Applicants <ChevronRight size={14} style={{ marginLeft: '4px' }} />
                      </button>
                      <button className="btn-action-pro" style={{ padding: '8px 16px' }}>
                        Edit Description
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.1)',
  padding: '1.25rem',
  borderRadius: '16px',
  color: 'white',
  fontSize: '1rem',
  outline: 'none',
  transition: 'all 0.3s'
};

export default AdminJobDescriptions;
