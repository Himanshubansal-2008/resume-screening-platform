import React, { useState, useRef } from 'react';
import { 
  Plus,
  MapPin, 
  Briefcase, 
  Trash2,
  UploadCloud,
  Loader2,
  StickyNote,
  Gift,
  Zap,
  Globe,
  Brain,
  X,
  Sparkles,
  CheckCircle,
  FileText,
  Users,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LiveKeywordStream from '../shared/LiveKeywordStream';
import TalentProfileModal from '../shared/TalentProfileModal';
import { API_BASE_URL } from '../../apiConfig';
import './Admin.css';

const formatTimeAgo = (dateString) => {
    if (!dateString) return 'recently';
    const date = new Date(dateString);
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + 'y ago';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + 'm ago';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + 'd ago';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + 'h ago';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + 'min ago';
    return 'just now';
};

const AdminJobDescriptions = ({ jobs: initialJobs = [], onRefresh }) => {
  const [jobs, setJobs] = useState(initialJobs);
  const [expandedId, setExpandedId] = useState(null);
  const [selectedCandidateForProfile, setSelectedCandidateForProfile] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [showSuccessPulse, setShowSuccessPulse] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [newJob, setNewJob] = useState({ title: '', department: '', location: '', type: 'Full-Time', salary: '', description: '', skills: '', benefits: '', interviewProcess: '', culture: '', responsibilities: '', requirements: '', bonusPoints: '' });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keywords, setKeywords] = useState([]);
  const fileInputRef = useRef(null);

  React.useEffect(() => { setJobs(initialJobs); }, [initialJobs]);

  const filteredJobs = jobs.filter(j => j.title?.toLowerCase().includes(searchQuery.toLowerCase()) || j.department?.toLowerCase().includes(searchQuery.toLowerCase()));

  const handlePdfUpload = async (file) => {
    if (!file || file.type !== 'application/pdf') { alert("Please upload a PDF."); return; }
    setIsAnalyzing(true); setKeywords([]);
    const formData = new FormData();
    formData.append('jdPdf', file);
    try {
      const res = await fetch(`${API_BASE_URL}/api/jobs/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) { alert(`Extraction failed: ${data.error}`); setIsAnalyzing(false); return; }
      setShowSuccessPulse(true);
      setTimeout(() => {
          setShowSuccessPulse(false); setIsAnalyzing(false); setKeywords(data.skills || []);
          const salaryMatch = (data.benefits || '').match(/(?:₹|\$|USD|INR|LPA|lpa)?\s*[\d,]+\s*(?:k|K|L|lakh|lakhs)?(?:\s*[-–]\s*(?:₹|\$)?\s*[\d,]+\s*(?:k|K|L|lakh|lakhs)?)?\s*(?:per year|per month|per annum|PA|CTC|p\.a\.)?/i);
          setNewJob({ title: data.title || '', department: data.department || '', location: data.location || '', type: data.type || 'Full-Time', salary: salaryMatch ? salaryMatch[0].trim() : '', description: data.description || '', skills: Array.isArray(data.skills) ? data.skills.join('\n') : '', benefits: data.benefits || '', interviewProcess: data.interviewProcess || '', culture: data.culture || '', responsibilities: data.responsibilities || '', requirements: data.requirements || '', bonusPoints: data.bonusPoints || '' });
          setShowCreateForm(true);
      }, 1200);
    } catch (err) { alert(`Network error: ${err.message}`); setIsAnalyzing(false); }
  };

  const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragActive(e.type === "dragenter" || e.type === "dragover"); };
  const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragActive(false); if (e.dataTransfer.files?.[0]) handlePdfUpload(e.dataTransfer.files[0]); };

  const handleCreate = async (e) => {
    e.preventDefault(); setIsSubmitting(true);
    try {
      const payload = { ...newJob, skills: newJob.skills.split('\n').filter(s => s.trim() !== ''), salary: newJob.salary || 'Competitive' };
      const res = await fetch(`${API_BASE_URL}/api/jobs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) { setShowCreateForm(false); if (onRefresh) onRefresh(); }
    } catch (err) { alert(`Error: ${err.message}`); } finally { setIsSubmitting(false); }
  };

  return (
    <div className="fadeIn admin-page-container">
      <div className="admin-upload-container">
        <div className="flex-col gap-1">
          <div className="flex-col gap-05">
            <div className="pill-badge-primary self-start"><Sparkles size={14} /> AI EXTRACTION ENGINE v4.0</div>
            <p className="admin-desc-muted mt-2">Index your hiring strategy with multi-dimensional neural extraction.</p>
          </div>
          <div className="flex gap-1 items-center mt-6">
             <button onClick={() => setShowCreateForm(true)} className="btn-action-pro btn-primary h-12 px-8 rounded-xl">
                <Plus size={18} /> New Manual Posting
             </button>
             <div className="flex items-center gap-2 text-muted-700 font-bold text-sm">
                <div className="w-2 h-2 rounded-full bg-success shadow-glow-success"></div>
                Cloud Sync Active
             </div>
          </div>
        </div>

        <motion.div 
            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
            onClick={() => !isAnalyzing && fileInputRef.current?.click()}
            className={`admin-upload-zone ${isDragActive ? 'drag-active' : ''}`}
            whileHover={{ scale: 1.01 }}
        >
          <input type="file" ref={fileInputRef} onChange={(e) => handlePdfUpload(e.target.files[0])} className="hidden" accept="application/pdf" />
          <AnimatePresence mode="wait">
            {isAnalyzing ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-col items-center gap-1">
                <div className="loader-ring"></div>
                <div className="text-center mt-4">
                    <p className="font-black text-white tracking-widest uppercase">Neural Scan In Progress</p>
                    <p className="admin-desc-muted text-xs mt-1">Gemini 1.5 mapping knowledge nodes.</p>
                </div>
                <LiveKeywordStream isAnalyzing={true} customKeywords={keywords} />
              </motion.div>
            ) : showSuccessPulse ? (
              <motion.div key="success" initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center">
                 <div className="w-16 h-16 bg-success-dim rounded-full flex items-center justify-center mx-auto mb-4 border border-success-20">
                    <CheckCircle size={32} color="var(--success)" />
                 </div>
                 <h4 className="text-success font-black text-lg">STRUCTURE EXTRACTED</h4>
              </motion.div>
            ) : (
              <motion.div key="idle" className="text-center">
                <div className="upload-icon-circle"><UploadCloud size={40} /></div>
                <h4 className="text-white text-xl font-extrabold mb-2">{isDragActive ? "Inhale Strategy" : "Neural Extractions"}</h4>
                <p className="admin-desc-muted text-sm max-w-[240px]">Inhale strategy from any PDF to auto-fill details.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="flex justify-between items-center bg-white-02 p-4 rounded-2xl border border-white-05">
         <div className="admin-search-wrapper max-w-md">
            <Search className="search-icon-abs" size={18} />
            <input type="text" placeholder="Search index by title or team..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="admin-search-field" />
         </div>
         <div className="flex gap-1 items-center">
            <button className="btn-action-pro btn-ghost px-6 py-2.5 rounded-xl"><Filter size={16} /> Filters</button>
            <div className="v-line" style={{ height: '20px', margin: '0 10px' }}></div>
            <div className="text-muted-700 font-bold text-sm px-4">Displaying {filteredJobs.length} Positions</div>
         </div>
      </div>

      <div className="jobs-layout-grid">
        {filteredJobs.length > 0 ? filteredJobs.map(job => (
          <motion.div
            key={job.id} layout className="glass-card" onClick={() => setExpandedId(expandedId === job.id ? null : job.id)}
            style={{ border: expandedId === job.id ? '1px solid var(--primary-glow)' : '1px solid var(--card-border)', background: expandedId === job.id ? 'hsla(217, 91%, 60%, 0.03)' : 'hsla(0,0%,100%,0.01)' }}
          >
            <div className="flex justify-between items-start mb-6">
                <div className="flex gap-1">
                    <div className="kpi-icon-box text-primary w-12 h-12 rounded-xl flex items-center justify-center bg-primary-dim border border-primary-20"><Briefcase size={22} /></div>
                    <div>
                        <h3 className="text-white text-xl font-extrabold mb-1">{job.title}</h3>
                        <div className="flex gap-4 text-dim-600 font-bold text-xs uppercase tracking-tight">
                            <span className="flex items-center gap-1"><Users size={12} /> {job.department}</span>
                            <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                        </div>
                    </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); }} className="btn-action-pro text-danger-60 p-1.5 bg-transparent border-none hover:bg-danger-10 rounded-lg"><Trash2 size={16} /></button>
            </div>

            <div className="flex gap-2 flex-wrap mb-5">
                <span className="badge-success-compact">{job.salary || 'Competitive'}</span>
                <span className="badge-primary-compact">{job.type || 'Full-Time'}</span>
                <span className="text-muted-700 text-xs font-bold ml-auto self-center">{formatTimeAgo(job.createdAt)}</span>
            </div>

            <p className={`card-summary-clamped text-base leading-relaxed mb-6 ${expandedId === job.id ? 'line-clamp-none' : ''}`}>{job.description}</p>

            <div className="flex justify-between items-center pt-5 border-t border-white-05">
                <div className="flex items-center gap-2 text-white font-extrabold text-sm"><Users size={14} className="text-primary" /> {job.applications?.length || 0} Pipelines</div>
                <div className="text-primary font-black text-sm flex items-center gap-1 uppercase tracking-wider">{expandedId === job.id ? 'Collapse' : 'Inspect Details'} {expandedId === job.id ? <ChevronUp size={16}/> : <ArrowRight size={16} />}</div>
            </div>

            <AnimatePresence>
                {expandedId === job.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="overflow-hidden mt-8">
                        <div className="job-details-grid">
                            <div className="bg-white-02 p-5 rounded-2xl border border-white-05">
                                <div className="pro-section-label">REQUISITE STACK</div>
                                <div className="flex flex-wrap gap-1.5">{job.skills?.map(s => <span key={s} className="pill-primary-xs">{s}</span>)}</div>
                            </div>
                            <div className="bg-white-02 p-5 rounded-2xl border border-white-05">
                                <div className="pro-section-label text-success">OFFERING PERKS</div>
                                <p className="text-dim-600 text-sm leading-relaxed">{job.benefits || 'Standard reward structure.'}</p>
                            </div>
                            {/* Active Applicants Panel */}
                            {job.applications && job.applications.length > 0 && (
                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.75rem', borderRadius: '22px', border: '1px dashed var(--card-border)' }}>
                                    <div style={{ color: '#fff', fontWeight: '900', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Users size={16} color="var(--primary)" /> Active Applicants
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {job.applications.map(app => (
                                            <div key={app.id} 
                                                 onClick={(e) => { 
                                                    e.stopPropagation(); 
                                                    setSelectedCandidateForProfile({
                                                        ...app.candidate,
                                                        match: app.resumeScore || app.candidate?.match,
                                                        summary: app.resumeSummary || app.candidate?.summary,
                                                        skills: app.resumeSkills?.length > 0 ? app.resumeSkills : app.candidate?.skills,
                                                        appliedResumeTitle: app.resumeName || null
                                                    }); 
                                                 }}
                                                 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-primary)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--card-border)', cursor: 'pointer', transition: 'all 0.2s' }}
                                                 className="candidate-row-hover"
                                            >
                                                <div>
                                                    <span style={{ color: 'white', fontWeight: '700', fontSize: '0.95rem' }}>{app.candidate?.name}</span>
                                                    {app.resumeName && <span style={{ marginLeft: '8px', padding: '2px 6px', background: 'hsla(217, 91%, 60%, 0.1)', color: 'var(--primary)', fontSize: '0.65rem', borderRadius: '6px', fontWeight: '800' }}>{app.resumeName}</span>}
                                                    <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>{app.candidate?.email}</div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <span style={{ background: (app.resumeScore || app.candidate?.match) > 80 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.05)', color: (app.resumeScore || app.candidate?.match) > 80 ? '#10b981' : 'var(--text-dim)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800' }}>
                                                        {app.resumeScore || app.candidate?.match}% Match
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
          </motion.div>
        )) : (
            <div className="infra-msg-shell w-full" style={{ gridColumn: '1 / -1' }}>
                <Briefcase size={40} className="mb-4 opacity-50 mx-auto" color="var(--primary)" />
                <h3 className="text-white text-xl font-bold">No Positions Indexed</h3>
                <p className="admin-desc-muted mt-2">Upload a JD PDF or create a manual posting to begin extraction.</p>
            </div>
        )}
      </div>

      <AnimatePresence>
        {showCreateForm && (
          <div className="modal-overlay">
            <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card pro-modal-frame">
              <button onClick={() => setShowCreateForm(false)} className="modal-close-btn"><X size={18} /></button>
              <div className="flex items-center gap-3 mb-6">
                  <div className="bg-primary p-2 rounded-lg shadow-glow-primary"><Brain size={20} color="white" /></div>
                  <div><h3 className="text-white text-xl font-black">Neural Extraction Result</h3><p className="admin-desc-muted text-xs mt-0.5">Verify and finalize the AI-populated strategy.</p></div>
              </div>
              <form onSubmit={handleCreate}>
                 <div className="form-grid-3">
                    <div className="flex-col gap-05"><label className="label-pro">Title</label><input type="text" value={newJob.title} onChange={(e) => setNewJob({...newJob, title: e.target.value})} className="pro-input" required /></div>
                    <div className="flex-col gap-05"><label className="label-pro">Department</label><input type="text" value={newJob.department} onChange={(e) => setNewJob({...newJob, department: e.target.value})} className="pro-input" required /></div>
                    <div className="flex-col gap-05"><label className="label-pro">Location</label><input type="text" value={newJob.location} onChange={(e) => setNewJob({...newJob, location: e.target.value})} className="pro-input" required /></div>
                 </div>
                 <div className="form-grid-2">
                    <div className="flex-col gap-05"><label className="label-pro">Salary Range</label><input type="text" value={newJob.salary} onChange={(e) => setNewJob({...newJob, salary: e.target.value})} className="pro-input" /></div>
                    <div className="flex-col gap-05"><label className="label-pro">Job Type</label><select value={newJob.type} onChange={(e) => setNewJob({...newJob, type: e.target.value})} className="pro-input cursor-pointer"><option value="Full-Time">Full-Time</option><option value="Part-Time">Part-Time</option><option value="Internship">Internship</option><option value="Contract">Contract</option></select></div>
                 </div>
                 <div className="flex-col gap-05 mb-4"><label className="label-pro">Skill Requirements (One per line)</label><textarea value={newJob.skills} onChange={(e) => setNewJob({...newJob, skills: e.target.value})} className="pro-input h-20" /></div>
                 <div className="flex-col gap-05 mb-6"><label className="label-pro">Description & Summary</label><textarea value={newJob.description} onChange={(e) => setNewJob({...newJob, description: e.target.value})} className="pro-input h-28" required /></div>
                 <div className="flex justify-end gap-3 mt-4">
                    <button type="button" onClick={() => setShowCreateForm(false)} className="btn-action-pro btn-ghost px-6 py-2 rounded-lg border-none">Cancel</button>
                    <button type="submit" className="btn-action-pro btn-primary h-11 px-6 rounded-lg" disabled={isSubmitting}>{isSubmitting ? 'Syncing...' : 'Commit Strategy'}</button>
                 </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <TalentProfileModal isOpen={!!selectedCandidateForProfile} onClose={() => setSelectedCandidateForProfile(null)} candidate={selectedCandidateForProfile} />
    </div>
  );
};

export default AdminJobDescriptions;