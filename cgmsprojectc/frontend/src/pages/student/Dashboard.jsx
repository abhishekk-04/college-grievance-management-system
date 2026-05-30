import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import useAuth from '../../hooks/useAuth';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, progress: 0, resolved: 0 });

  useEffect(() => {
    const fetchGrievances = async () => {
      try {
        const res = await api.get('/grievances/mine');
        const list = res.data;
        setGrievances(list);

        // Calculate counts
        const total = list.length;
        const pending = list.filter(g => g.status === 'Pending').length;
        const progress = list.filter(g => g.status === 'In Progress' || g.status === 'Under Review').length;
        const resolved = list.filter(g => g.status === 'Resolved' || g.status === 'Closed').length;

        setStats({ total, pending, progress, resolved });
      } catch (err) {
        console.error('Error fetching grievances:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGrievances();
  }, []);

  // Filter last 3 updates for the activity feed
  const recentGrievances = grievances.slice(0, 3);

  return (
    <div className="animate-fade-in">
      {/* Welcome Banner */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontFamily: 'Outfit', fontWeight: 'bold' }}>
          Hello, {user?.name || 'Student'} 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Welcome to your grievance dashboard. You can file new complaints or track active tickets.
        </p>
      </div>

      {/* Stats Tally */}
      <div className="dashboard-grid">
        
        {/* Total Submitted */}
        <div className="glass-panel stat-card">
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>TOTAL GRIEVANCES</span>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>
            <FileText size={22} />
          </div>
        </div>

        {/* Pending Review */}
        <div className="glass-panel stat-card">
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>PENDING REVIEW</span>
            <div className="stat-value">{stats.pending}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-amber)' }}>
            <Clock size={22} />
          </div>
        </div>

        {/* In Progress */}
        <div className="glass-panel stat-card">
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>IN PROGRESS</span>
            <div className="stat-value">{stats.progress}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)' }}>
            <TrendingUp size={22} />
          </div>
        </div>

        {/* Resolved */}
        <div className="glass-panel stat-card">
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>RESOLVED / CLOSED</span>
            <div className="stat-value">{stats.resolved}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-emerald)' }}>
            <CheckCircle2 size={22} />
          </div>
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '30px' }}>
        
        {/* Recent Tickets Feed */}
        <div className="glass-panel" style={{ padding: '30px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.25rem' }}>Recent Submissions</h3>
            <Link to="/student/grievances" style={{ fontSize: '0.85rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All
              <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading activity feed...</p>
          ) : grievances.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <AlertCircle size={36} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>You have not submitted any grievances yet.</p>
              <Link to="/student/submit" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem', marginTop: '16px' }}>
                Submit Your First Ticket
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {recentGrievances.map((g) => (
                <div key={g._id} style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold', fontFamily: 'Outfit', color: 'var(--primary)' }}>
                        {g.ticketId}
                      </span>
                      <span className={`status-badge ${
                        g.status === 'Pending' ? 'status-pending' :
                        g.status === 'Under Review' ? 'status-review' :
                        g.status === 'In Progress' ? 'status-progress' :
                        g.status === 'Resolved' ? 'status-resolved' :
                        g.status === 'Closed' ? 'status-closed' : 'status-rejected'
                      }`} style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                        {g.status}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '600', marginTop: '6px' }}>{g.subject}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Category: {g.category} &bull; Assigned to: {g.department?.departmentName || 'General'}
                    </p>
                  </div>
                  <Link to={`/student/grievances?track=${g.ticketId}`} className="btn-secondary" style={{ padding: '8px 12px', fontSize: '0.8rem' }}>
                    Track
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Info Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Quick Submit CTA Card */}
          <div className="glass-panel" style={{ 
            padding: '30px', 
            borderRadius: 'var(--radius-lg)', 
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.2)'
          }}>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', marginBottom: '8px' }}>Have a problem?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '20px' }}>
              Submit a grievance with details and attach proof files. Our automatic AI tool will help routes your request to the right department.
            </p>
            <Link to="/student/submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              File a Grievance
            </Link>
          </div>

          {/* User Info Overview */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ fontFamily: 'Outfit', marginBottom: '16px', fontSize: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              Academic Profile
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Course:</span>
                <span style={{ fontWeight: '500' }}>{user?.course}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Roll Number:</span>
                <span style={{ fontWeight: '500' }}>{user?.rollNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>College Branch:</span>
                <span style={{ fontWeight: '500' }}>{user?.department}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;
