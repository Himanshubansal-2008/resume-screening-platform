import React, { useState, useRef } from 'react';
import { FileText, UploadCloud, CheckCircle, Cpu, Loader2, ArrowRight, Zap, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import LiveKeywordStream from '../shared/LiveKeywordStream';

const CandidateSubmit = ({ setActiveTab, onRefresh }) => {
  const [uploadState, setUploadState] = useState('idle'); // idle, uploading, complete, error
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState([]);
  const [reasoning, setReasoning] = useState('');
  const [filename, setFilename] = useState('');
  const fileInputRef = useRef(null);
  const { user } = useUser();

  const handleFileChange = async (fileOrEvent) => {
    let file = null;
    if (fileOrEvent?.target?.files) file = fileOrEvent.target.files[0];
    else if (fileOrEvent instanceof File) file = fileOrEvent;
    else return;

    if (!file) return;

    setFilename(file.name);
    setUploadState('uploading');

    const formData = new FormData();
    formData.append('resumePdf', file);
    formData.append('name', user?.fullName || 'Guest Candidate');
    formData.append('email', user?.primaryEmailAddress?.emailAddress || 'guest@example.com');
    formData.append('role', 'Any Role');

    try {
      const response = await fetch('http://localhost:5001/api/candidates', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Server returned an error');
      }

      const data = await response.json();
      setScore(data.match || data.score || 0);
      setFeedback(data.feedback || []);
      setReasoning(data.applications?.[0]?.strengths || '');
      setUploadState('complete');
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error(error);
      setUploadState('error');
    }
  };

  const handleZoneClick = () => {
    if (uploadState === 'idle' || uploadState === 'error') {
      fileInputRef.current.click();
    }
  };

  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    if (uploadState === 'idle' || uploadState === 'error') {
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileChange(e.dataTransfer.files[0]);
      }
    }
  };

  return (
    <div className="fadeIn">
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ color: 'white', fontSize: '1.75rem', fontWeight: '800' }}>Submit Application</h2>
        <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Upload your resume below. Our AI will automatically parse your experience.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem' }}>
        {/* Upload Zone */}
        <div 
            onClick={handleZoneClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{ 
                background: isDragActive ? 'rgba(59, 130, 246, 0.05)' : 'rgba(255,255,255,0.02)', 
                border: uploadState === 'error' ? '2px dashed #ef4444' : (isDragActive ? '2px dashed #3b82f6' : '2px dashed rgba(59, 130, 246, 0.4)'), 
                borderRadius: '24px', 
                padding: '4rem 2rem', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                cursor: (uploadState === 'idle' || uploadState === 'error') ? 'pointer' : 'default',
                transition: 'all 0.3s',
                minHeight: '350px'
            }}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
            accept="application/pdf"
          />
          <LiveKeywordStream isAnalyzing={uploadState === 'uploading' || uploadState === 'analyzing'} />
          <AnimatePresence mode="wait">
            {uploadState === 'idle' && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '20px', borderRadius: '50%', display: 'inline-block', marginBottom: '1.5rem' }}>
                    <UploadCloud size={48} color="#3b82f6" />
                </div>
                <h3 style={{ color: 'white', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Drag & Drop Resume</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Supports PDF (Max 5MB)</p>
              </motion.div>
            )}

            {uploadState === 'uploading' && (
              <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center' }}>
                <Loader2 size={48} color="#3b82f6" className="spin" style={{ animation: 'spin 1.5s linear infinite', marginBottom: '1.5rem', display: 'inline-block' }} />
                <h3 style={{ color: 'white', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Uploading Resume...</h3>
                <div style={{ width: '200px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', margin: '0 auto', overflow: 'hidden' }}>
                    <motion.div initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 2 }} style={{ height: '100%', background: '#3b82f6' }} />
                </div>
              </motion.div>
            )}

            {uploadState === 'analyzing' && (
              <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center' }}>
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.5rem' }}>
                    <Cpu size={48} color="#10b981" />
                    <motion.div 
                        initial={{ top: '-10px' }} animate={{ top: '60px' }} 
                        transition={{ repeat: Infinity, duration: 1, repeatType: 'reverse' }}
                        style={{ position: 'absolute', width: '100%', height: '2px', background: 'rgba(16, 185, 129, 0.8)', left: 0, boxShadow: '0 0 8px #10b981' }}
                    />
                </div>
                <h3 style={{ color: 'white', fontSize: '1.25rem', marginBottom: '0.5rem' }}>AI Parsing Identity & Skills...</h3>
              </motion.div>
            )}

            {uploadState === 'complete' && (
              <motion.div key="complete" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '20px', borderRadius: '50%', display: 'inline-block', marginBottom: '1.5rem' }}>
                    <CheckCircle size={48} color="#10b981" />
                </div>
                <h3 style={{ color: 'white', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Upload Successful</h3>
                <p style={{ color: '#10b981', fontSize: '0.9rem' }}>{filename} processed</p>
              </motion.div>
            )}

            {uploadState === 'error' && (
              <motion.div key="error" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '20px', borderRadius: '50%', display: 'inline-block', marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '48px' }}>❌</span>
                </div>
                <h3 style={{ color: 'white', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Upload Failed</h3>
                <p style={{ color: '#ef4444', fontSize: '0.9rem' }}>Check backend server connection. Click to retry.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Panel */}
        <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ color: 'white', fontSize: '1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cpu size={20} color="#3b82f6" /> Real-time Analysis
            </h3>

            {uploadState === 'idle' || uploadState === 'uploading' ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.9rem', textAlign: 'center' }}>
                    Upload a file to see AI match insights
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
                    <div style={{ textAlign: 'center', background: 'rgba(59, 130, 246, 0.05)', padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                        <div style={{ fontSize: '3.5rem', fontWeight: '900', color: 'white', letterSpacing: '-2px', lineHeight: 1 }}>
                            {score}<span style={{ color: '#3b82f6', fontSize: '2rem' }}>%</span>
                        </div>
                        <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Global Match</p>
                    </div>

                    {feedback.length > 0 && (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <h4 style={{ color: 'white', fontSize: '0.9rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase' }}>
                                <Zap size={16} color="#3b82f6" fill="#3b82f6" /> AI Optimization Insights
                            </h4>
                            <div className="custom-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '240px', overflowY: 'auto', paddingRight: '8px' }}>
                                {feedback.map((tip, idx) => (
                                    <motion.div 
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        key={idx} 
                                        style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderLeft: '3px solid #3b82f6', borderRadius: '0 8px 8px 0', fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.4' }}
                                    >
                                        {tip}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {uploadState === 'complete' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                            <button 
                                onClick={() => setActiveTab('dashboard')}
                                style={{ width: '100%', padding: '1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
                            >
                                GO TO DASHBOARD <ArrowRight size={18} />
                            </button>
                        </motion.div>
                    )}
                </div>
            )}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
};

export default CandidateSubmit;
