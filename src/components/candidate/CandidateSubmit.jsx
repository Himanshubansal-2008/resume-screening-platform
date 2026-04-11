import React, { useState } from 'react';
import { FileText, UploadCloud, CheckCircle, Cpu, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CandidateSubmit = ({ setActiveTab }) => {
  const [uploadState, setUploadState] = useState('idle'); // idle, uploading, analyzing, complete
  const [score, setScore] = useState(0);

  const handleUpload = () => {
    setUploadState('uploading');
    
    setTimeout(() => {
      setUploadState('analyzing');
      
      // Animate score from 0 to 88
      let currentScore = 0;
      const interval = setInterval(() => {
        currentScore += 2;
        setScore(currentScore);
        if (currentScore >= 88) {
          clearInterval(interval);
          setUploadState('complete');
        }
      }, 40);

    }, 2000); // 2 seconds of "uploading"
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
            onClick={uploadState === 'idle' ? handleUpload : undefined}
            style={{ 
                background: 'rgba(255,255,255,0.02)', 
                border: '2px dashed rgba(59, 130, 246, 0.4)', 
                borderRadius: '24px', 
                padding: '4rem 2rem', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                cursor: uploadState === 'idle' ? 'pointer' : 'default',
                transition: 'all 0.3s',
                minHeight: '350px'
            }}
        >
          <AnimatePresence mode="wait">
            {uploadState === 'idle' && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '20px', borderRadius: '50%', display: 'inline-block', marginBottom: '1.5rem' }}>
                    <UploadCloud size={48} color="#3b82f6" />
                </div>
                <h3 style={{ color: 'white', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Drag & Drop Resume</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Supports PDF, DOCX (Max 5MB)</p>
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
                <p style={{ color: '#10b981', fontSize: '0.9rem' }}>Nikhil_Telkar_Resume.pdf processed</p>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '4rem', fontWeight: '900', color: 'white', letterSpacing: '-2px' }}>
                            {score}<span style={{ color: '#3b82f6', fontSize: '2.5rem' }}>%</span>
                        </div>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Match score for target role</p>
                    </div>

                    {uploadState === 'complete' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 'auto' }}>
                            <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: '#10b981', fontSize: '0.9rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <CheckCircle size={16} /> Shortlisting criteria met.
                            </div>
                            
                            <button 
                                onClick={() => setActiveTab('prephub')}
                                style={{ width: '100%', padding: '1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                                Continue to Prep Hub <ArrowRight size={18} />
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
