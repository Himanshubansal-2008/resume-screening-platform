import React, { useState } from 'react';
import { 
  Send, 
  Bot, 
  X, 
  MessageSquare, 
  Sparkles,
  ChevronRight,
  Terminal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AIChatbotSidebar = ({ isOpen, onClose, candidates }) => {
  const [messages, setMessages] = useState([
    { id: 1, role: 'bot', text: "Hello! I have analyzed all 1,280 resumes in history. I can help you compare candidates, generate interview questions, or summarize background experience. What would you like to know?" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages = [...messages, { id: Date.now(), role: 'user', text: input }];
    setMessages(newMessages);
    setInput("");

    // Mock bot response
    setTimeout(() => {
        setMessages(prev => [...prev, { 
            id: Date.now() + 1, 
            role: 'bot', 
            text: `Based on the candidates in our database (including ${candidates[0]?.name}), this candidate has a strong match for your requirements. I suggest asking: "Can you walk us through a complex React architecture you've scaled?"` 
        }]);
    }, 1000);
  };

  const PROMPTS = [
    "What to ask Alex Rivera?",
    "Compare top 3 React devs",
    "Missing skills across all applicants",
    "Generate Node.js quiz"
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000 }}
          />

          {/* Sidebar */}
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
              width: '420px', 
              zIndex: 1001, 
              borderLeft: '1px solid rgba(59, 130, 246, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              background: '#0f0f1a'
            }}
          >
            {/* Header */}
            <div style={{ padding: '2rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '10px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px' }}>
                  <Bot color="#3b82f6" size={24} />
                </div>
                <div>
                  <h3 style={{ color: 'white', fontSize: '1.2rem', fontWeight: '800' }}>HireAI <span style={{ color: '#3b82f6' }}>Copilot</span></h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: '#3b82f6', fontWeight: '800' }}>
                    <div style={{ width: '6px', height: '6px', background: '#3b82f6', borderRadius: '50%' }}></div>
                    CONTEXT: 1,280 RESUMES
                  </div>
                </div>
              </div>
              <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {/* Chat Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
               {messages.map(msg => (
                 <div key={msg.id} style={{ 
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    padding: '1rem',
                    borderRadius: '16px',
                    background: msg.role === 'user' ? '#3b82f6' : 'rgba(255,255,255,0.05)',
                    color: 'white',
                    fontSize: '0.9rem',
                    lineHeight: '1.5',
                    border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)'
                 }}>
                   {msg.text}
                 </div>
               ))}
            </div>

            {/* Suggested Prompts */}
            <div style={{ padding: '1rem 2rem', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {PROMPTS.map(p => (
                   <button 
                    key={p} 
                    onClick={() => setInput(p)}
                    style={{ 
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      background: 'rgba(59, 130, 246, 0.05)', 
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      color: '#3b82f6',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                   >
                     {p}
                   </button>
                ))}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} style={{ padding: '2rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ position: 'relative' }}>
                    <input 
                      type="text" 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask about a candidate..." 
                      style={{ 
                        width: '100%', 
                        background: 'rgba(255,255,255,0.03)', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        padding: '1.25rem 3.5rem 1.25rem 1.5rem', 
                        borderRadius: '12px', 
                        color: 'white',
                        outline: 'none'
                      }} 
                    />
                    <button type="submit" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: '#3b82f6', border: 'none', padding: '8px', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>
                        <Send size={18} />
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
