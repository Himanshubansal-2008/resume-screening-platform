import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, CheckCircle, Video, ArrowRight } from 'lucide-react';
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

const CandidatePrepHub = ({ setActiveTab }) => {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="fadeIn" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ color: 'white', fontSize: '1.75rem', fontWeight: '800' }}>Interview Prep Hub</h2>
          <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>AI-curated questions based on your resume profile and target role.</p>
        </div>
        
        <button 
            onClick={() => setActiveTab('mockbot')}
            style={{ 
                padding: '1rem 2rem', 
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', 
                color: 'white', 
                border: 'none', 
                borderRadius: '16px', 
                fontSize: '1rem', 
                fontWeight: '700', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)'
            }}
        >
            <Video size={20} /> Enter Simulation Arena
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {MOCK_QUESTIONS.map((q) => (
          <div 
            key={q.id} 
            style={{ 
                background: 'rgba(255,255,255,0.02)', 
                border: expandedId === q.id ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px', 
                overflow: 'hidden',
                transition: 'all 0.3s'
            }}
          >
            <div 
                onClick={() => toggleExpand(q.id)}
                style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>
                        {q.category}
                    </div>
                    <h3 style={{ color: 'white', fontSize: '1.1rem', fontWeight: '600' }}>{q.question}</h3>
                </div>
                <div style={{ color: '#94a3b8' }}>
                    {expandedId === q.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
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
                        <div style={{ padding: '0 2rem 2rem 2rem' }}>
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', marginTop: '0.5rem', display: 'flex', gap: '12px' }}>
                                <HelpCircle size={20} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                    <h4 style={{ color: '#10b981', marginBottom: '8px', fontSize: '0.9rem' }}>AI Response Strategy</h4>
                                    <p style={{ color: '#94a3b8', lineHeight: '1.6', fontSize: '0.95rem' }}>{q.hint}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CandidatePrepHub;
