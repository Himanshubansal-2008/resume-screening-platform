import React, { useState } from 'react';
import { 
  Search, 
  Trash2, 
  Download, 
  Bot, 
  History, 
  Filter,
  ArrowUpRight,
  MoreVertical,
  MessageSquare,
  User,
  Calendar,
  FileText,
  BadgeCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminResumeDatabase = ({ candidates, onOpenChat }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCandidates = candidates.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="fadeIn">
      {/* Search and Global Chat Trigger */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', gap: '2rem' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '600px' }}>
          <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={20} />
          <input 
            type="text" 
            placeholder="Search by name, role, or skill..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', 
              background: 'rgba(255,255,255,0.03)', 
              border: '1px solid rgba(255,255,255,0.08)', 
              padding: '1.25rem 1.25rem 1.25rem 3.5rem', 
              borderRadius: '16px', 
              color: 'white',
              fontSize: '1rem',
              outline: 'none',
              transition: 'all 0.3s'
            }} 
          />
        </div>

        <button 
            onClick={() => onOpenChat()}
            className="btn-action-pro" 
            style={{ padding: '1.25rem 2rem', display: 'flex', alignItems: 'center', gap: '12px', background: '#3b82f6', color: 'white', borderRadius: '16px', boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)' }}
        >
            <Bot size={20} /> ASK HireAI Intelligence
        </button>
      </div>

      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px' }}>
                <History size={20} color="#3b82f6" />
            </div>
            <div>
                <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '800', marginBottom: '2px' }}>Candidate Repository</h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>AI-Summarized talent pool index</p>
            </div>
            <span style={{ marginLeft: '12px', padding: '6px 12px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', border: '1px solid rgba(255,255,255,0.08)' }}>{filteredCandidates.length} Candidates</span>
        </div>
        <button className="btn-action-pro" style={{ background: 'rgba(255,255,255,0.03)', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Filter size={18} /> Filters
        </button>
      </div>

      {/* Card Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '2rem' }}>
        <AnimatePresence>
            {filteredCandidates.map(c => (
              <motion.div 
                layout
                key={c.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="glass-card"
                style={{ 
                    padding: '1.75rem', 
                    height: 'auto', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '1.5rem',
                    border: '1px solid rgba(255,255,255,0.08)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
              >
                {/* Score Badge */}
                <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(59, 130, 246, 0.1)', padding: '6px 12px', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                    <BadgeCheck size={14} color="#3b82f6" />
                    <span style={{ fontSize: '0.85rem', fontWeight: '900', color: '#3b82f6' }}>{c.match}%</span>
                </div>

                {/* Profile Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(59, 130, 246, 0.2)' }}>
                        <User size={28} color="white" />
                    </div>
                    <div>
                        <h4 style={{ color: 'white', fontSize: '1.2rem', fontWeight: '800', marginBottom: '4px' }}>{c.name}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.8rem' }}>
                            <ArrowUpRight size={14} /> {c.role}
                        </div>
                    </div>
                </div>

                {/* Summary Section */}
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                        <FileText size={12} /> AI Abstract
                    </div>
                    <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.6', opacity: 0.9 }}>
                        {c.summary}
                    </p>
                </div>

                {/* Skills Section */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {c.skills.map(skill => (
                        <span key={skill} style={{ padding: '6px 12px', background: 'rgba(255, 255, 255, 0.05)', color: '#94a3b8', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '600', border: '1px solid rgba(255,255,255,0.08)' }}>
                            {skill}
                        </span>
                    ))}
                </div>

                {/* Footer Metadata */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.75rem' }}>
                        <Calendar size={14} /> Processed {c.applied}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            onClick={() => onOpenChat(c)}
                            title="Chat with AI"
                            style={{ 
                                background: 'rgba(59, 130, 246, 0.1)', 
                                color: '#3b82f6', 
                                border: '1px solid rgba(59, 130, 246, 0.2)',
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            className="btn-hover-glow"
                        >
                            <MessageSquare size={18} />
                        </button>
                        <button 
                            title="Download Resume"
                            style={{ 
                                background: 'rgba(255, 255, 255, 0.05)', 
                                color: '#cbd5e1', 
                                border: '1px solid rgba(255,255,255,0.08)',
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            <Download size={18} />
                        </button>
                        <button 
                            title="Remove Record"
                            style={{ 
                                background: 'rgba(239, 68, 68, 0.1)', 
                                color: '#ef4444', 
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>

      {filteredCandidates.length === 0 && (
          <div style={{ padding: '8rem 4rem', textAlign: 'center', color: '#64748b', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dotted rgba(255,255,255,0.1)', marginTop: '2rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <Search size={48} style={{ opacity: 0.2 }} />
              </div>
              <h4 style={{ color: 'white', fontSize: '1.25rem', marginBottom: '0.5rem' }}>No talent matches found</h4>
              <p>Try adjusting your search terms or filters to find candidates.</p>
          </div>
      )}
    </div>
  );
};

export default AdminResumeDatabase;
