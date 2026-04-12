import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Bot, 
  X, 
  MessageSquare, 
  Sparkles,
  ChevronRight,
  Terminal,
  Loader2,
  AlertCircle,
  Brain,
  Cpu,
  Waves
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { queryAI, getSystemPrompt } from '../../services/hfService';

/**
 * Premium custom text renderer for AI responses.
 * Handles bolding, lists, and line breaks without external dependencies.
 */
const NeuralText = ({ children }) => {
  if (!children) return null;

  const lines = children.split('\n');
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {lines.map((line, idx) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return <div key={idx} style={{ height: '0.5rem' }} />;

        // Handle Bullet Points
        if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
          return (
            <div key={idx} style={{ display: 'flex', gap: '8px', paddingLeft: '0.5rem' }}>
              <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>•</span>
              <span style={{ flex: 1 }}>{formatBold(trimmedLine.slice(2))}</span>
            </div>
          );
        }

        // Handle Numbered Lists
        const numberedMatch = trimmedLine.match(/^(\d+\.)\s+(.*)/);
        if (numberedMatch) {
          return (
            <div key={idx} style={{ display: 'flex', gap: '8px', paddingLeft: '0.5rem' }}>
              <span style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '0.8rem' }}>{numberedMatch[1]}</span>
              <span style={{ flex: 1 }}>{formatBold(numberedMatch[2])}</span>
            </div>
          );
        }

        // Normal Line
        return (
          <p key={idx} style={{ margin: 0, lineHeight: '1.7' }}>
            {formatBold(line)}
          </p>
        );
      })}
    </div>
  );
};

/**
 * Helper to process bold text within a string
 */
const formatBold = (text) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: '#fff', fontWeight: '800', letterSpacing: '0.01em' }}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const NeuralThinkingBlock = ({ content }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
    style={{ 
      background: 'rgba(59, 130, 246, 0.03)', 
      borderLeft: '3px solid #3b82f6', 
      padding: '1.5rem', 
      marginBottom: '1.5rem', 
      borderRadius: '12px',
      fontSize: '0.9rem',
      color: '#94a3b8',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: 'inset 0 0 20px rgba(59, 130, 246, 0.05)'
    }}
  >
    {/* Animated Neural Pulse Background */}
    <motion.div 
      animate={{ 
        opacity: [0.1, 0.2, 0.1],
        scale: [1, 1.02, 1] 
      }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      style={{ 
        position: 'absolute', 
        inset: 0, 
        background: 'radial-gradient(circle at 10% 10%, rgba(59, 130, 246, 0.1) 0%, transparent 80%)',
        zIndex: 0
      }}
    />
    
    <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}>
          <Brain size={18} color="#3b82f6" />
        </motion.div>
        <span style={{ fontWeight: '900', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#3b82f6' }}>Neural Reasoning Engine</span>
      </div>
      <div style={{ opacity: 1, color: '#cbd5e1' }}>
        <NeuralText>{content}</NeuralText>
      </div>
    </div>
  </motion.div>
);

const AIChatbotSidebar = ({ isOpen, onClose, candidates, activeCandidate }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Set initial message and context
  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (activeCandidate) {
        setMessages([
          { 
            id: 1, 
            role: 'bot', 
            text: `I've loaded the context for **${activeCandidate.name}**. Their AI score is ${activeCandidate.match}%.\n\nSummary: "${activeCandidate.summary}"\n\nHow can I help you evaluate their potential?` 
          }
        ]);
      } else {
        setMessages([
          { 
            id: 1, 
            role: 'bot', 
            text: "Hello! I'm HireAI Intelligence. I can help you analyze candidates, compare skills, or generate interview plans. What's on your mind?" 
          }
        ]);
      }
    }
  }, [isOpen, activeCandidate]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { id: Date.now(), role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
        const history = [
            { role: "system", content: getSystemPrompt(activeCandidate) },
            ...messages.map(m => ({ 
                role: m.role === 'bot' ? 'assistant' : 'user', 
                content: m.text 
            })),
            { role: "user", content: input }
        ];

        const aiResponse = await queryAI(history);
        
        if (aiResponse && (aiResponse.content || aiResponse.reasoning_content)) {
            setMessages(prev => [...prev, { 
                id: Date.now() + 1, 
                role: 'bot', 
                text: aiResponse.content || "",
                reasoning: aiResponse.reasoning_content || null
            }]);
        } else {
            throw new Error("AI returned a valid response object but it had no content.");
        }
    } catch (err) {
        setError(err.message || "An unexpected error occurred.");
    } finally {
        setIsLoading(false);
    }
  };

  const PROMPTS = activeCandidate ? [
    `Analyze ${activeCandidate.name}'s gaps`,
    "Generate 3 interview questions",
    "How does this person fit a Lead role?"
  ] : [
    "Compare top 3 React devs",
    "General hiring advice",
    "Summarize all candidates"
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000 }}
          />

          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{ 
              position: 'fixed', 
              right: 0, 
              top: 0, 
              height: '100vh', 
              width: '460px', 
              zIndex: 1001, 
              borderLeft: '1px solid rgba(59, 130, 246, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              background: '#0a0a14',
              boxShadow: '-20px 0 50px rgba(0,0,0,0.5)'
            }}
          >
            {/* Header */}
            <div style={{ padding: '2.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(to right, #0d0d1f, #0a0a14)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.15)', borderRadius: '14px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                  <Sparkles color="#3b82f6" size={24} />
                </div>
                <div>
                  <h3 style={{ color: 'white', fontSize: '1.25rem', fontWeight: '900', letterSpacing: '-0.02em' }}>HireAI <span style={{ color: '#3b82f6' }}>Copilot</span></h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', color: '#3b82f6', fontWeight: '900', textTransform: 'uppercase' }}>
                    <div style={{ width: '6px', height: '6px', background: '#3b82f6', borderRadius: '50%', boxShadow: '0 0 8px #3b82f6' }}></div>
                    {activeCandidate ? `Targeted: ${activeCandidate.name}` : `Broad Analysis`}
                  </div>
                </div>
              </div>
              <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#64748b', cursor: 'pointer', padding: '8px', borderRadius: '10px' }}><X size={20} /></button>
            </div>

            {/* Chat Messages */}
            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', scrollBehavior: 'smooth' }}>
               {messages.map(msg => (
                 <div key={msg.id} style={{ 
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '90%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                 }}>
                   <div style={{ 
                      padding: '1.25rem',
                      borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                      background: msg.role === 'user' ? '#3b82f6' : 'rgba(255,255,255,0.04)',
                      color: 'white',
                      fontSize: '0.95rem',
                      lineHeight: '1.6',
                      border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)',
                      boxShadow: msg.role === 'user' ? '0 8px 16px rgba(59, 130, 246, 0.2)' : 'none'
                   }}>
                     {msg.reasoning && <NeuralThinkingBlock content={msg.reasoning} />}
                     <NeuralText>{msg.text || (msg.reasoning ? "" : "No content returned.")}</NeuralText>
                   </div>
                   <span style={{ fontSize: '0.65rem', color: '#475569', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', fontWeight: '700' }}>
                        {msg.role === 'user' ? 'YOU' : 'HIREAI'}
                   </span>
                 </div>
               ))}

               {isLoading && (
                 <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ alignSelf: 'flex-start', display: 'flex', gap: '12px', alignItems: 'center', background: 'rgba(59, 130, 246, 0.05)', padding: '12px 20px', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.1)' }}
                 >
                    <div style={{ position: 'relative' }}>
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            style={{ position: 'absolute', inset: -4, background: 'rgba(59, 130, 246, 0.2)', borderRadius: '50%', filter: 'blur(4px)' }}
                        />
                        <Brain size={18} color="#3b82f6" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ color: '#3b82f6', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '0.05em' }}>HIREAI THINKING</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            {[0, 1, 2].map(i => (
                                <motion.div 
                                    key={i}
                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                    style={{ width: '4px', height: '4px', background: '#3b82f6', borderRadius: '50%' }}
                                />
                            ))}
                        </div>
                    </div>
                 </motion.div>
               )}

               {error && (
                 <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <AlertCircle size={20} color="#ef4444" style={{ flexShrink: 0 }} />
                    <p style={{ color: '#fca5a5', fontSize: '0.85rem', lineHeight: '1.5' }}>{error}</p>
                 </div>
               )}
            </div>

            {/* Suggested Prompts */}
            <div style={{ padding: '0 2rem 1.5rem', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {PROMPTS.map(p => (
                   <button 
                    key={p} 
                    onClick={() => { setInput(p); }}
                    disabled={isLoading}
                    style={{ 
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      background: 'rgba(59, 130, 246, 0.05)', 
                      border: '1px solid rgba(59, 130, 246, 0.15)',
                      color: '#3b82f6',
                      padding: '8px 14px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                   >
                     {p}
                   </button>
                ))}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} style={{ padding: '2rem', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ position: 'relative' }}>
                    <input 
                      type="text" 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask HireAI anything..." 
                      disabled={isLoading}
                      style={{ 
                        width: '100%', 
                        background: 'rgba(255,255,255,0.03)', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        padding: '1.5rem 4rem 1.5rem 1.5rem', 
                        borderRadius: '16px', 
                        color: 'white',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'all 0.3s',
                      }} 
                    />
                    <button 
                        type="submit" 
                        disabled={isLoading || !input.trim()}
                        style={{ 
                            position: 'absolute', 
                            right: '12px', 
                            top: '50%', 
                            transform: 'translateY(-50%)', 
                            background: input.trim() ? '#3b82f6' : 'rgba(255,255,255,0.05)', 
                            border: 'none', 
                            padding: '12px', 
                            borderRadius: '12px', 
                            color: 'white', 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Send size={20} />
                    </button>
                </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default AIChatbotSidebar;
