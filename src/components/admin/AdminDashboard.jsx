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

const AdminDashboard = ({ candidates = [] }) => {
    // Dynamic stats calculation
    const totalIngestion = candidates.length;
    const avgMatchRate = totalIngestion > 0 
        ? (candidates.reduce((acc, c) => acc + (c.match || 0), 0) / totalIngestion).toFixed(1) 
        : 0;
    const pendingReviews = candidates.filter(c => c.status === 'Initial Screen' || c.status === 'In Review').length;

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
                    <span className="stat-value">{totalIngestion}</span>
                    <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '700' }}>Live DB sync</span>
                </div>
                
                <div className="glass-card stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="stat-label">Avg Match Rate</span>
                        <div style={{ color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)', padding: '4px', borderRadius: '8px' }}>
                            <Settings size={16} />
                        </div>
                    </div>
                    <span className="stat-value">{avgMatchRate}%</span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Model: Gemini-Flash</span>
                </div>

                <div className="glass-card stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="stat-label">Pending Reviews</span>
                        <div style={{ color: '#ea580c', background: 'rgba(234, 88, 12, 0.1)', padding: '4px', borderRadius: '8px' }}>
                            <Users size={16} />
                        </div>
                    </div>
                    <span className="stat-value">{pendingReviews}</span>
                    <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: '700' }}>Prioritized</span>
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
                            {candidates.length > 0 ? candidates.map(candidate => (
                                <tr key={candidate.id}>
                                    <td style={{ fontWeight: '700' }}>{candidate.name}</td>
                                    <td style={{ color: '#94a3b8' }}>{candidate.role}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '40px', height: '4px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '2px' }}>
                                                <div style={{ width: `${candidate.match}%`, height: '100%', background: '#3b82f6', borderRadius: '2px' }}></div>
                                            </div>
                                            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'white' }}>{candidate.match}%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="pill-capsule" style={{ background: candidate.status === 'Top Pick' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)', color: candidate.status === 'Top Pick' ? '#3b82f6' : '#94a3b8', fontSize: '0.65rem' }}>
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
                            )) : (
                                <tr>
                                    <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No candidates found in database</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
