import React from 'react';
import { 
  TrendingUp, 
  AlertCircle, 
  Cpu
} from 'lucide-react';

const CandidateHome = ({ user }) => {
  return (
    <div className="fadeIn" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2.5rem' }}>
      <div className="user-card" style={{ textAlign: 'center' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', marginBottom: '3rem' }}>
            <Cpu size={20} color="#3b82f6" /> AI Fit Analysis
        </h3>
        
        <div style={{ fontSize: '6rem', fontWeight: '900', letterSpacing: '-6px', color: '#111827', marginBottom: '0.5rem' }}>88<span style={{ color: '#3b82f6' }}>%</span></div>
        <p style={{ color: '#6b7280', fontWeight: '600', fontSize: '0.95rem', marginBottom: '3rem' }}>Global Match Score</p>
        
        <div className="pro-progress-bg" style={{ height: '10px', marginBottom: '4rem' }}><div className="pro-progress-fill" style={{ width: '88%' }}></div></div>
        
        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '800', marginBottom: '6px' }}>
              <span>Technical Stack</span> <span>94%</span>
            </div>
            <div className="pro-progress-bg"><div className="pro-progress-fill" style={{ width: '94%' }}></div></div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '800', marginBottom: '6px' }}>
              <span>Domain relevance</span> <span>72%</span>
            </div>
            <div className="pro-progress-bg"><div className="pro-progress-fill" style={{ width: '72%', background: '#60a5fa' }}></div></div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="user-card" style={{ borderLeft: '6px solid #10b981' }}>
          <h4 style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}><TrendingUp size={20} /> Core Strengths</h4>
          <p style={{ color: '#4b5563', lineHeight: '1.6', fontSize: '0.95rem' }}>
              Your expertise in React & Scalable Systems matches 95% of our high-priority requirements. AI detected strong architectural reasoning in your "Project Alpha" summary.
          </p>
        </div>
        <div className="user-card" style={{ borderLeft: '6px solid #f59e0b' }}>
          <h4 style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}><AlertCircle size={20} /> Skill Gaps Detected</h4>
          <p style={{ color: '#4b5563', lineHeight: '1.6', fontSize: '0.95rem' }}>
              Limited exposure to Cloud Infrastructure (Terraform/AWS) detected. Our AI has curated 5 specific prep modules in the Prep Hub to address this before your interview.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CandidateHome;
