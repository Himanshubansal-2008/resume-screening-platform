import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Video, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_QUESTIONS = [
  {
    id: 1,
    category: 'Architecture',
    question: "Can you walk us through a complex React architecture you've scaled?",
    hint: "Focus on state management (Redux/Context), code splitting, and how you handled performance bottlenecks as the user base grew. The interviewer is looking for system design thinking."
  },
  {
    id: 2,
    category: 'Technical Depth',
    question: "How do you handle memory leaks and performance optimizations in single-page applications?",
    hint: "Mention React Profiler, resolving infinite re-renders via useMemo/useCallback, and managing extensive DOM nodes."
  },
  {
    id: 3,
    category: 'Behavioral',
    question: "Tell me about a time you disagreed with an engineering decision made by the team lead.",
    hint: "Use the STAR method (Situation, Task, Action, Result). Highlight your communication skills and ability to compromise without being combative."
  }
];

const categoryColors = {
  'Architecture': { bg: '#eff6ff', color: '#3b82f6' },
  'Technical Depth': { bg: '#f0fdf4', color: '#10b981' },
  'Behavioral': { bg: '#fff7ed', color: '#f97316' },
};

const CandidatePrepHub = ({ setActiveTab }) => {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div className="fadeIn" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
            <Sparkles size={16} color="#3b82f6" />
            <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.08em' }}>AI-Curated</span>
          </div>
          <h2 style={{ color: 'var(--text-primary)', fontSize: '1.6rem', fontWeight: '800', fontFamily: 'Outfit, sans-serif' }}>Interview Prep Hub</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.35rem', fontSize: '0.88rem' }}>AI-curated questions based on your resume profile and target role.</p>
        </div>

        <button
          onClick={() => setActiveTab('mockbot')}
          className="btn-primary"
        >
          <Video size={18} /> Enter Simulation Arena
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {MOCK_QUESTIONS.map((q, i) => {
          const catStyle = categoryColors[q.category] || { bg: '#f3f4f6', color: '#6b7280' };
          return (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="card"
              style={{
                padding: 0,
                overflow: 'hidden',
                border: expandedId === q.id ? '1px solid #bfdbfe' : '1px solid #e5e7eb',
                background: expandedId === q.id ? '#fafcff' : 'white'
              }}
            >
              <div
                onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                style={{ padding: '1.5rem 1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                  <span style={{ background: catStyle.bg, color: catStyle.color, padding: '4px 12px', borderRadius: '7px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                    {q.category}
                  </span>
                  <h3 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: '600', lineHeight: '1.5' }}>{q.question}</h3>
                </div>
                <div style={{ color: '#9ca3af', marginLeft: '1rem', flexShrink: 0 }}>
                  {expandedId === q.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>

              <AnimatePresence>
                {expandedId === q.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ padding: '0 1.75rem 1.75rem' }}>
                      <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '1.5rem', display: 'flex', gap: '12px' }}>
                        <HelpCircle size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <h4 style={{ color: '#10b981', marginBottom: '8px', fontSize: '0.82rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Response Strategy</h4>
                          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '0.9rem' }}>{q.hint}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default CandidatePrepHub;
