import React from 'react';
import ReactDOM from 'react-dom';
import { 
  X, 
  Cpu, 
  Briefcase, 
  MapPin, 
  Calendar, 
  Target, 
  User, 
  ShieldCheck, 
  TrendingUp, 
  Brain, 
  Download,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TalentProfileModal = ({ isOpen, onClose, candidate }) => {
  if (!candidate) return null;

  const analysis = candidate.detailedAnalysis || {
      technicalDeepDive: { "Knowledge Node": "Basic Profile - Detailed metrics pending AI re-crawl." },
      experienceArchitecture: { "History": "Standard experience verification complete." },
      culturalCalibration: { "Alignment": "Culture-fit assessment pending." }
  };

  const handleDownload = () => {
    if (candidate.file) {
        window.open(candidate.file, '_blank');
    } else {
        alert("No original resume file found in database for this candidate.");
    }
  };

  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay">
          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 15 }}
            className="talent-modal-frame"
          >
            {/* Header */}
            <div className="talent-modal-header">
              <div className="flex gap-2 absolute top-6 right-8">
                <button 
                  onClick={handleDownload}
                  className="btn-action-pro btn-ghost border border-white-05 px-4 py-2 rounded-xl text-sm font-bold"
                >
                  <Download size={16} /> PDF
                </button>
                <button 
                  onClick={onClose}
                  className="card-icon-button w-9 h-9 flex items-center justify-center rounded-xl"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex items-center gap-8">
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center shadow-glow-primary">
                  <User size={40} color="white" />
                </div>
                <div>
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h2 className="text-white text-4xl font-black tracking-tight">{candidate.name}</h2>
                        <span className="talent-score-badge">
                            {candidate.match}% AI MATCH
                        </span>
                        {candidate.appliedResumeTitle && (
                            <span className="pill-badge-primary text-xs py-1">
                                <Sparkles size={12} /> {candidate.appliedResumeTitle}
                            </span>
                        )}
                    </div>
                  <div className="flex flex-wrap gap-6 text-dim-600 font-bold text-sm">
                    <div className="flex items-center gap-2"><Briefcase size={16} className="text-primary" /> {candidate.role}</div>
                    <div className="flex items-center gap-2"><MapPin size={16} /> HQ / Global Node</div>
                    <div className="flex items-center gap-2"><Calendar size={16} /> Synced {candidate.applied}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="talent-modal-body hide-scrollbar">
              <div className="talent-grid">
                
                {/* Left Column */}
                <div className="flex-col gap-2">
                  <section>
                    <div className="pro-section-label text-primary mb-5">
                      <Cpu size={16} /> TECHNICAL DEEP DIVE
                    </div>
                    <div className="flex-col gap-3">
                      {Object.entries(analysis.technicalDeepDive).map(([key, value]) => (
                        <div key={key} className="talent-section-card">
                          <span className="text-muted-700 text-xs font-black uppercase mb-1.5 block tracking-widest">{key}</span>
                          <span className="text-white text-sm font-semibold leading-relaxed block">{value}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="mt-8">
                    <div className="pro-section-label text-secondary mb-5">
                      <Target size={16} /> PROFICIENCY NODES
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(candidate.skills || []).map(skill => (
                        <span key={skill} className="badge-primary-compact">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </section>
                </div>

                {/* Right Column */}
                <div className="flex-col gap-2">
                  <section>
                    <div className="pro-section-label text-warning mb-5">
                      <TrendingUp size={16} /> EXPERIENCE ARCHITECTURE
                    </div>
                    <div className="flex-col gap-4">
                      {Object.entries(analysis.experienceArchitecture).map(([key, value]) => (
                        <div key={key} className="pl-5 border-l-2 border-warning-20">
                          <span className="text-warning text-xs font-black block mb-1 uppercase tracking-wider">{key}</span>
                          <span className="text-dim-600 text-sm font-medium leading-relaxed block">{value}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="mt-8">
                    <div className="pro-section-label text-purple-400 mb-5">
                      <ShieldCheck size={16} /> CULTURAL CALIBRATION
                    </div>
                    <div className="p-5 rounded-2xl bg-white-02 border border-white-05">
                      {Object.entries(analysis.culturalCalibration).map(([key, value]) => (
                        <div key={key} className="mb-4 last:mb-0">
                          <span className="text-purple-400 text-xs font-black block mb-1 uppercase tracking-tight">{key}</span>
                          <span className="text-white text-sm font-medium leading-relaxed block">{value}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  <div className="mt-8 p-5 rounded-2xl bg-white-02 border-l-4 border-primary">
                    <div className="flex items-center gap-2 text-muted-700 text-xs font-black uppercase mb-2">
                        <Brain size={14} /> AI Recommendation
                    </div>
                    <p className="text-white font-bold text-sm leading-relaxed italic">
                        "{candidate.feedback || "Strategic growth hire with high potential."}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default TalentProfileModal;
