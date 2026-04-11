import React from 'react';
import { 
  LayoutDashboard, 
  FileText,
  Users,
  TrendingUp,
  Settings,
  MoreVertical,
  ChevronRight,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_CANDIDATES = [
  { id: 1, name: 'Alex Rivera', role: 'Senior React Developer', match: 92, status: 'Shortlisted', skills: ['React', 'TypeScript', 'Node.js'], applied: '2 days ago' },
  { id: 2, name: 'Sarah Chen', role: 'Backend Engineer', match: 86, status: 'In Review', skills: ['Python', 'PostgreSQL', 'Docker'], applied: '1 week ago' },
  { id: 3, name: 'Marcus Thorne', role: 'Solutions Architect', match: 78, status: 'Initial Screen', skills: ['AWS', 'Terraform', 'Go'], applied: '3 days ago' },
  { id: 4, name: 'Elena Rodriguez', role: 'Frontend Lead', match: 95, status: 'Shortlisted', skills: ['Vue', 'Redux', 'D3.js'], applied: '4 hours ago' },
];

const AdminDashboard = () => {
    return (
        <div className="fadeIn">
            {/* Stats Overview */}
            <div className="dashboard-grid">
                <div className="glass-card stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="stat-label">Total Ingestion</span>
                        <div style={{ color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)', padding: '4px', borderRadius: '8px' }}>
                            <TrendingUp size={16} />
                        </div>
                    </div>
                    <span className="stat-value">1,280</span>
                    <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '700' }}>+12% vs last month</span>
                </div>
                
                <div className="glass-card stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="stat-label">AI Match Rate</span>
                        <div style={{ color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)', padding: '4px', borderRadius: '8px' }}>
                            <Settings size={16} />
                        </div>
                    </div>
                    <span className="stat-value">99.2%</span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Model: HireAI-v4</span>
                </div>

                <div className="glass-card stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="stat-label">Pending Reviews</span>
                        <div style={{ color: '#ea580c', background: 'rgba(234, 88, 12, 0.1)', padding: '4px', borderRadius: '8px' }}>
                            <Users size={16} />
                        </div>
                    </div>
                    <span className="stat-value">14</span>
                    <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: '700' }}>8 prioritized</span>
                </div>
            </div>

            {/* Candidate Backlog Table */}
            <div style={{ marginTop: '3.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '800' }}>Manual Evaluation Backlog</h3>
                    <button className="btn-action-pro" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Plus size={16} /> Bulk Export
                    </button>
                </div>
                
                <div className="admin-table-container glass-card">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Candidate</th>
                                <th>Target Role</th>
                                <th>Match</th>
                                <th>Status</th>
                                <th>Applied</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {MOCK_CANDIDATES.map(candidate => (
                                <tr key={candidate.id}>
                                    <td style={{ fontWeight: '700' }}>{candidate.name}</td>
                                    <td style={{ color: '#94a3b8' }}>{candidate.role}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '40px', height: '4px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '2px' }}>
                                                <div style={{ width: `${candidate.match}%`, height: '100%', background: candidate.match > 90 ? '#3b82f6' : '#3b82f6', borderRadius: '2px' }}></div>
                                            </div>
                                            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'white' }}>{candidate.match}%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="pill-capsule" style={{ background: candidate.status === 'Shortlisted' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)', color: candidate.status === 'Shortlisted' ? '#3b82f6' : '#94a3b8', fontSize: '0.65rem' }}>
                                            {candidate.status}
                                        </span>
                                    </td>
                                    <td style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{candidate.applied}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button className="btn-action-pro" style={{ background: 'rgba(255,255,255,0.05)', color: '#3b82f6', padding: '6px 12px' }}>Analyze</button>
                                            <button style={{ background: 'transparent', border: 'none', color: '#4b5563', cursor: 'pointer' }}>
                                                <MoreVertical size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
