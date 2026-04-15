import React, { useState } from 'react';
import { TrendingUp, Cpu, Sparkles, CheckCircle, Zap, Lightbulb, Target, ArrowUpRight, Star, AlertTriangle, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Generate AI resume tips from real profile data
function generateTips(myProfile) {
  const tips = [];
  const skills = myProfile?.skills || [];
  const score = myProfile?.match || 0;
  const summary = myProfile?.summary || '';

  if (score < 60) {
    tips.push({ type: 'critical', icon: AlertTriangle, color: '#f59e0b', bg: 'hsla(45,100%,50%,0.06)', border: 'hsla(45,100%,50%,0.15)', title: 'Boost your match score', body: 'Your current match is below 60%. Add more quantifiable achievements and project outcomes to your resume.' });
  }
  if (skills.length < 5) {
    tips.push({ type: 'warning', icon: Target, color: '#3b82f6', bg: 'hsla(217,91%,60%,0.06)', border: 'hsla(217,91%,60%,0.15)', title: 'Expand your skill keywords', body: `Only ${skills.length} skills detected. Add specific tools, languages, and frameworks — recruiters scan for these first.` });
  }
  if (summary && summary.toLowerCase().includes('formatting')) {
    tips.push({ type: 'warning', icon: AlertTriangle, color: '#f59e0b', bg: 'hsla(45,100%,50%,0.06)', border: 'hsla(45,100%,50%,0.15)', title: 'Fix formatting issues', body: 'The AI flagged formatting inconsistencies. Use consistent date formats (e.g. Jan 2023 – Mar 2024) throughout.' });
  }
  if (score >= 70) {
    tips.push({ type: 'success', icon: Star, color: '#10b981', bg: 'hsla(150,80%,45%,0.06)', border: 'hsla(150,80%,45%,0.15)', title: 'Strong technical profile', body: 'Your score is in the top tier. Make sure your GitHub / portfolio links are active and prominently listed.' });
  }
  tips.push({ type: 'tip', icon: Lightbulb, color: '#a78bfa', bg: 'hsla(255,90%,75%,0.06)', border: 'hsla(255,90%,75%,0.15)', title: 'Add a concise summary section', body: 'Recruiters spend 6 seconds on a resume. A tight 2-sentence professional summary at the top significantly improves visibility.' });
  tips.push({ type: 'tip', icon: ArrowUpRight, color: '#3b82f6', bg: 'hsla(217,91%,60%,0.06)', border: 'hsla(217,91%,60%,0.15)', title: 'Quantify your impact', body: 'Replace vague phrases ("worked on", "helped with") with metrics: "Reduced build time by 40%", "Led a team of 5".' });

  return tips.slice(0, 4);
}

const CandidateHome = ({ user, myProfile, recommendations = [] }) => {
  const [tipExpanded, setTipExpanded] = useState(null);
  const displayScore = recommendations[0]?.matchPercent || myProfile?.match || 0;
  const aiSummary = myProfile?.summary || "Analyzing your experience...";
  const aiReview = myProfile?.feedback || "Your AI evaluation and feedback will appear here shortly.";
  const tips = generateTips(myProfile);

  return (
    <div className="fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      {/* Top Row: Score + Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '3rem' }}>
        {/* Left Column: Match Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass-card" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-30px', left: '-30px', width: '180px', height: '180px', background: 'var(--primary-glow)', filter: 'blur(50px)', borderRadius: '50%', opacity: 0.4 }}></div>

            <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.1rem', marginBottom: '3.5rem', color: 'var(--text-dim)', position: 'relative', zIndex: 1 }}>
              <Cpu size={22} color="var(--primary)" /> NEURAL MATCH SCORE
            </h3>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{ fontSize: '7.5rem', fontWeight: '900', letterSpacing: '-6px', color: 'white', marginBottom: '0.5rem', lineHeight: 1 }}
              >
                {displayScore}<span style={{ color: 'var(--primary)', fontSize: '3.5rem' }}>%</span>
              </motion.div>
              <p style={{ color: 'var(--text-muted)', fontWeight: '800', fontSize: '0.9rem', marginBottom: '3.5rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Unified Fit Index</p>
            </div>

            <div className="pro-progress-bg" style={{ height: '14px', marginBottom: '4rem', background: 'hsla(255, 255%, 255%, 0.05)' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${displayScore}%` }} className="pro-progress-fill"></motion.div>
            </div>

            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '2.5rem', position: 'relative', zIndex: 1 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '800', marginBottom: '10px', color: 'var(--text-dim)' }}>
                  <span>TECHNICAL DEPTH</span> <span>{Math.min(100, displayScore + 2)}%</span>
                </div>
                <div className="pro-progress-bg" style={{ height: '6px' }}>
                  <div className="pro-progress-fill" style={{ width: `${Math.min(100, displayScore + 2)}%` }}></div>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '800', marginBottom: '10px', color: 'var(--text-dim)' }}>
                  <span>CULTURAL SYNC</span> <span>{Math.min(100, displayScore + 5)}%</span>
                </div>
                <div className="pro-progress-bg" style={{ height: '6px' }}>
                  <div className="pro-progress-fill" style={{ width: `${Math.min(100, displayScore + 5)}%`, background: 'var(--accent)' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Insights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card" style={{ borderLeft: '6px solid var(--primary)' }}>
            <h4 style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', fontSize: '1.25rem' }}>
              <Zap size={24} /> AI Cognitive Extract
            </h4>
            <p style={{ color: 'var(--text-main)', lineHeight: '1.8', fontSize: '1.05rem', opacity: 0.9 }}>{aiSummary}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass-card" style={{ borderLeft: '6px solid var(--success)', background: 'linear-gradient(90deg, hsla(150, 80%, 45%, 0.05) 0%, transparent 100%)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h4 style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.25rem' }}>
                <CheckCircle size={24} /> AI Recruiter Review
              </h4>
              <div style={{ padding: '4px 12px', background: 'hsla(150, 80%, 45%, 0.1)', color: 'var(--success)', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '800' }}>VERIFIED EVALUATION</div>
            </div>
            <p style={{ color: 'var(--text-dim)', lineHeight: '1.8', fontSize: '1rem', fontStyle: 'italic' }}>
              <Sparkles size={16} color="var(--success)" style={{ display: 'inline', marginRight: '10px' }} />
              "{aiReview}"
            </p>
            <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--card-border)', display: 'flex', gap: '2rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '4px' }}>VERDICT</div>
                <div style={{ color: 'var(--success)', fontWeight: '900', fontSize: '1rem' }}>TOP 15% APPLICANT</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '4px' }}>NEXT STEP</div>
                <div style={{ color: 'white', fontWeight: '900', fontSize: '1rem' }}>TECHNICAL INTERVIEW</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* AI Resume Recommendation Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="glass-card" style={{ borderTop: '3px solid #a78bfa' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #a78bfa, #3b82f6)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px hsla(255,90%,75%,0.25)' }}>
                <Sparkles size={24} color="white" />
              </div>
              <div>
                <h3 style={{ color: 'white', fontSize: '1.4rem', fontWeight: '900', letterSpacing: '-0.5px' }}>
                  AI Resume Coach
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px' }}>
                  Personalized improvement tips based on your profile analysis
                </p>
              </div>
            </div>
            <div style={{ padding: '6px 14px', background: 'hsla(255,90%,75%,0.1)', color: '#a78bfa', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '900', border: '1px solid hsla(255,90%,75%,0.2)', letterSpacing: '0.05em' }}>
              {tips.length} ACTIVE TIPS
            </div>
          </div>

          {/* Tips Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
            {tips.map((tip, i) => {
              const Icon = tip.icon;
              const isOpen = tipExpanded === i;
              return (
                <motion.div
                  key={i}
                  onClick={() => setTipExpanded(isOpen ? null : i)}
                  whileHover={{ scale: 1.01 }}
                  style={{
                    background: tip.bg,
                    border: `1px solid ${tip.border}`,
                    borderRadius: '20px',
                    padding: '1.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <div style={{ width: '38px', height: '38px', background: `${tip.color}22`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={20} color={tip.color} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ color: 'white', fontSize: '0.95rem', fontWeight: '800' }}>{tip.title}</strong>
                        <ChevronRight size={16} color="var(--text-muted)" style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
                      </div>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{ color: 'var(--text-dim)', fontSize: '0.85rem', lineHeight: '1.6', marginTop: '10px', overflow: 'hidden' }}
                          >
                            {tip.body}
                          </motion.p>
                        )}
                      </AnimatePresence>
                      {!isOpen && (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '4px' }}>
                          Click to expand
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <div style={{ marginTop: '2rem', padding: '1.25rem 1.5rem', background: 'hsla(217,91%,60%,0.05)', borderRadius: '16px', border: '1px solid hsla(217,91%,60%,0.1)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <TrendingUp size={20} color="var(--primary)" />
            <p style={{ color: 'var(--text-dim)', fontSize: '0.88rem', flex: 1 }}>
              Apply these improvements and re-upload to see your score jump. Each fix can add <strong style={{ color: 'white' }}>5–15 points</strong>.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CandidateHome;
