import React, { useState } from 'react';
import { 
  Plus, 
  MapPin, 
  Clock, 
  Users, 
  Briefcase, 
  DollarSign,
  MoreVertical,
  ChevronRight,
  Sparkles,
  Trash2,
  Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_JOBS = [
  {
    id: 1,
    title: 'Senior React Developer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-Time',
    salary: '$120k - $160k',
    posted: '2 days ago',
    applicants: 48,
    status: 'Active',
    description: 'We are looking for an experienced React developer to lead our frontend architecture. You will work closely with the design and backend teams to deliver scalable, high-performance web applications.',
    skills: ['React', 'TypeScript', 'Node.js', 'GraphQL']
  },
  {
    id: 2,
    title: 'Backend Engineer',
    department: 'Engineering',
    location: 'Bangalore, IN',
    type: 'Full-Time',
    salary: '₹18L - ₹28L',
    posted: '5 days ago',
    applicants: 112,
    status: 'Active',
    description: 'Join our backend team to design and build robust APIs and microservices. Experience with distributed systems and cloud infrastructure is a strong plus.',
    skills: ['Python', 'PostgreSQL', 'Docker', 'AWS']
  },
  {
    id: 3,
    title: 'Product Manager',
    department: 'Product',
    location: 'Hybrid - Mumbai',
    type: 'Full-Time',
    salary: '₹22L - ₹35L',
    posted: '1 week ago',
    applicants: 67,
    status: 'Active',
    description: 'Drive product strategy and roadmap for our AI-powered recruitment platform. Collaborate with engineering, design, and business teams to deliver impactful features.',
    skills: ['Product Strategy', 'Agile', 'Data Analysis', 'Stakeholder Management']
  },
  {
    id: 4,
    title: 'UI/UX Designer',
    department: 'Design',
    location: 'Remote',
    type: 'Contract',
    salary: '$80k - $110k',
    posted: '3 days ago',
    applicants: 29,
    status: 'Draft',
    description: 'Create stunning, user-centered designs for our platform. You will own the end-to-end design process from research and wireframing to high-fidelity prototypes.',
    skills: ['Figma', 'User Research', 'Design Systems', 'Prototyping']
  }
];

const AdminJobDescriptions = () => {
  const [jobs, setJobs] = useState(MOCK_JOBS);
  const [expandedId, setExpandedId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', department: '', location: '', type: 'Full-Time', description: '', skills: '' });

  const handleDelete = (id) => {
    setJobs(prev => prev.filter(j => j.id !== id));
  };

  const handleCreate = (e) => {
    e.preventDefault();
    const created = {
      id: Date.now(),
      ...newJob,
      skills: newJob.skills.split(',').map(s => s.trim()),
      salary: 'TBD',
      posted: 'Just now',
      applicants: 0,
      status: 'Draft'
    };
    setJobs(prev => [created, ...prev]);
    setNewJob({ title: '', department: '', location: '', type: 'Full-Time', description: '', skills: '' });
    setShowCreateForm(false);
  };

  return (
    <div className="fadeIn">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h2 style={{ color: 'white', fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
            Job Descriptions
          </h2>
          <p style={{ color: '#94a3b8', marginTop: '0.5rem', fontSize: '0.9rem' }}>
            {jobs.length} positions • {jobs.filter(j => j.status === 'Active').length} actively hiring
          </p>
        </div>
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn-action-pro" 
          style={{ 
            padding: '1rem 2rem', 
            background: '#3b82f6', 
            color: 'white', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
            fontSize: '0.9rem'
          }}
        >
          <Plus size={18} /> New Job Posting
        </button>
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden', marginBottom: '2rem' }}
          >
            <form onSubmit={handleCreate} className="glass-card" style={{ padding: '2.5rem', borderRadius: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
                <Sparkles size={20} color="#3b82f6" />
                <h3 style={{ color: 'white', fontSize: '1.25rem', fontWeight: '800' }}>Create New Position</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <input 
                  type="text" 
                  placeholder="Job Title (e.g. Senior React Developer)" 
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  required
                  style={inputStyle}
                />
                <input 
                  type="text" 
                  placeholder="Department (e.g. Engineering)" 
                  value={newJob.department}
                  onChange={(e) => setNewJob({ ...newJob, department: e.target.value })}
                  required
                  style={inputStyle}
                />
                <input 
                  type="text" 
                  placeholder="Location (e.g. Remote)" 
                  value={newJob.location}
                  onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                  required
                  style={inputStyle}
                />
                <input 
                  type="text" 
                  placeholder="Required Skills (comma separated)" 
                  value={newJob.skills}
                  onChange={(e) => setNewJob({ ...newJob, skills: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <textarea 
                placeholder="Write a compelling job description..." 
                value={newJob.description}
                onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                required
                style={{ ...inputStyle, height: '120px', resize: 'vertical' }}
              />

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setShowCreateForm(false)}
                  style={{ ...inputStyle, cursor: 'pointer', width: 'auto', padding: '0.75rem 2rem', textAlign: 'center' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn-action-pro"
                  style={{ padding: '0.75rem 2rem', background: '#3b82f6', color: 'white', fontSize: '0.9rem', borderRadius: '12px' }}
                >
                  Publish Job
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Job Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '1.5rem' }}>
        {jobs.map(job => (
          <motion.div 
            layout
            key={job.id} 
            className="glass-card" 
            style={{ 
              padding: '2rem', 
              borderRadius: '24px', 
              cursor: 'pointer',
              transition: 'all 0.3s',
              border: expandedId === job.id ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(255,255,255,0.08)'
            }}
            onClick={() => setExpandedId(expandedId === job.id ? null : job.id)}
          >
            {/* Card Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                  <span 
                    className="pill-capsule" 
                    style={{ 
                      background: job.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', 
                      color: job.status === 'Active' ? '#10b981' : '#f59e0b',
                      fontSize: '0.65rem'
                    }}
                  >
                    {job.status}
                  </span>
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{job.posted}</span>
                </div>
                <h3 style={{ color: 'white', fontSize: '1.2rem', fontWeight: '800', letterSpacing: '-0.02em' }}>{job.title}</h3>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(job.id); }} 
                  className="btn-action-pro" 
                  style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '6px' }}
                >
                  <Trash2 size={14} />
                </button>
                <button className="btn-action-pro" style={{ padding: '6px' }}>
                  <Edit3 size={14} />
                </button>
              </div>
            </div>

            {/* Meta Info */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.8rem' }}>
                <Briefcase size={14} /> {job.department}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.8rem' }}>
                <MapPin size={14} /> {job.location}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.8rem' }}>
                <Clock size={14} /> {job.type}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.8rem' }}>
                <DollarSign size={14} /> {job.salary}
              </span>
            </div>

            {/* Applicants Count */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <Users size={16} color="#3b82f6" />
              <span style={{ color: 'white', fontWeight: '700', fontSize: '0.9rem' }}>{job.applicants}</span>
              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>applicants</span>
            </div>

            {/* Skills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {job.skills.map(skill => (
                <span 
                  key={skill} 
                  style={{ 
                    padding: '4px 12px', 
                    background: 'rgba(59, 130, 246, 0.1)', 
                    border: '1px solid transparent',
                    borderRadius: '8px', 
                    color: '#3b82f6', 
                    fontSize: '0.7rem', 
                    fontWeight: '700' 
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>

            {/* Expanded Description */}
            <AnimatePresence>
              {expandedId === job.id && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <p style={{ color: '#94a3b8', lineHeight: '1.7', fontSize: '0.9rem' }}>{job.description}</p>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                      <button className="btn-action-pro" style={{ background: '#3b82f6', color: 'white', padding: '8px 16px' }}>
                        View Applicants <ChevronRight size={14} style={{ marginLeft: '4px' }} />
                      </button>
                      <button className="btn-action-pro" style={{ padding: '8px 16px' }}>
                        Edit Description
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

/* replaced */

export default AdminJobDescriptions;
