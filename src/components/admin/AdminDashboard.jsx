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

const AdminDashboard = ({ candidates }) => {
    // Dynamic stats calculation
    const totalIngestion = candidates.length;
    const avgMatchRate = totalIngestion > 0 
        ? (candidates.reduce((acc, c) => acc + c.match, 0) / totalIngestion).toFixed(1) 
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
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Model: HireAI-v4</span>
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
        </div>
    );
};

export default AdminDashboard;
