import React, { useState } from 'react';
import { 
  Search, 
  Trash2, 
  Download, 
  Bot, 
  History, 
  Filter,
  ArrowUpRight,
  MoreVertical
} from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_HISTORY = [
  { id: 10, name: 'Alex Rivera', role: 'Senior React Developer', match: 92, applied: '2 days ago', file: 'Alex_CV_2024.pdf' },
  { id: 11, name: 'Sarah Chen', role: 'Backend Engineer', match: 86, applied: '1 week ago', file: 'Sarah_Backend.pdf' },
  { id: 12, name: 'Marcus Thorne', role: 'Solutions Architect', match: 78, applied: '3 days ago', file: 'MarcusT_Resume.pdf' },
  { id: 13, name: 'Elena Rodriguez', role: 'Frontend Lead', match: 95, applied: '4 hours ago', file: 'Elena_Frontend.pdf' },
  { id: 14, name: 'David Miller', role: 'Product Manager', match: 94, applied: '5 days ago', file: 'DavidM_Updated.pdf' },
];

const AdminResumeDatabase = ({ onOpenChat }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [candidates, setCandidates] = useState(MOCK_HISTORY);

  const filteredCandidates = candidates.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id) => {
    setCandidates(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="fadeIn">
      {/* Search and Chat Trigger */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', gap: '2rem' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '600px' }}>
          <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={20} />
          <input 
            type="text" 
            placeholder="Search candidate history by name..." 
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
            onClick={onOpenChat}
            className="btn-action-pro" 
            style={{ padding: '1.25rem 2rem', display: 'flex', alignItems: 'center', gap: '12px', background: '#3b82f6', color: 'white', borderRadius: '16px', boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)' }}
        >
            <Bot size={20} /> ASK HireAI Intelligence
        </button>
      </div>

      {/* History Table */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <History size={20} color="#3b82f6" />
            <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '800' }}>Candidate Repository</h3>
            <span style={{ padding: '4px 10px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', fontSize: '0.75rem', color: '#94a3b8' }}>{filteredCandidates.length} Items</span>
        </div>
        <button className="btn-action-pro" style={{ background: 'transparent', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={18} /> Filters
        </button>
      </div>

      <div className="admin-table-container glass-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Resume File</th>
              <th>AI Score</th>
              <th>Date Processed</th>
              <th>Contact Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCandidates.map(c => (
              <motion.tr layout key={c.id}>
                <td style={{ fontWeight: '700', color: 'white' }}>{c.name}</td>
                <td style={{ color: '#3b82f6', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Download size={14} /> {c.file}
                    </div>
                </td>
                <td>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '99px', border: '1px solid rgba(59, 130, 246, 0.15)' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '900', color: '#3b82f6' }}>{c.match}%</span>
                    </div>
                </td>
                <td style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{c.applied}</td>
                <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#10b981', fontWeight: '700' }}>
                        <div style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%' }}></div> Active
                    </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleDelete(c.id)} className="btn-action-pro" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                        <Trash2 size={16} />
                    </button>
                    <button style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                        <MoreVertical size={16} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {filteredCandidates.length === 0 && (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
                No candidates found matching "{searchTerm}"
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminResumeDatabase;
