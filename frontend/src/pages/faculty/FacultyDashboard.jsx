import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import useAuth from '../../hooks/useAuth';
import { 
  Inbox, 
  Hourglass, 
  RefreshCw, 
  CheckSquare, 
  FileWarning, 
  ArrowRight
} from 'lucide-react';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, progress: 0, resolved: 0 });

  useEffect(() => {
    const fetchGrievances = async () => {
      try {
        const res = await api.get('/grievances/department');
        const list = res.data;
        setGrievances(list);

        // Calculate stats
        const total = list.length;
        const pending = list.filter(g => g.status === 'Pending').length;
        const progress = list.filter(g => g.status === 'In Progress' || g.status === 'Under Review').length;
        const resolved = list.filter(g => g.status === 'Resolved' || g.status === 'Closed').length;

        setStats({ total, pending, progress, resolved });
      } catch (err) {
        console.error('Error fetching department grievances:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGrievances();
  }, []);

  const recentTickets = grievances.slice(0, 4);

  return (
    <div className="animate-fade-in">
      {/* Banner */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontFamily: 'Outfit', fontWeight: 'bold' }}>
          Welcome, {user?.name || 'Officer'} 📋
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Review and resolve student grievances submitted to the <strong style={{ color: 'var(--accent-purple)' }}>{user?.department?.departmentName || 'your department'}</strong> department.
        </p>
      </div>

      {/* Counters Grid */}
      <div className="dashboard-grid">
        
        {/* Total Assigned */}
        <div className="glass-panel stat-card">
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>TOTAL CASES ASSIGNED</span>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-purple)' }}>
            <Inbox size={22} />
          </div>
        </div>

        {/* Pending Review */}
        <div className="glass-panel stat-card">
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>PENDING REVIEW</span>
            <div className="stat-value">{stats.pending}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-amber)' }}>
            <Hourglass size={22} />
          </div>
        </div>

        {/* In Progress */}
        <div className="glass-panel stat-card">
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>IN PROGRESS</span>
            <div className="stat-value">{stats.progress}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)' }}>
            <RefreshCw size={22} />
          </div>
        </div>

        {/* Resolved */}
        <div className="glass-panel stat-card">
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>RESOLVED CASES</span>
            <div className="stat-value">{stats.resolved}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-emerald)' }}>
            <CheckSquare size={22} />
          </div>
        </div>

      </div>

      {/* Main layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '30px' }}>
        
        {/* Recent Tickets List */}
        <div className="glass-panel" style={{ padding: '30px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.25rem' }}>Recent Assigned Tickets</h3>
            <Link to="/faculty/grievances" style={{ fontSize: '0.85rem', color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All
              <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <p style={{ color: 'var(--text-secondary)' }}>Loading cases...</p>
          ) : grievances.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <FileWarning size={36} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No grievances assigned to your department.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {recentTickets.map((g) => (
                <div key={g._id} style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold', fontFamily: 'Outfit', color: 'var(--accent-purple)' }}>
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
                      {g.priority === 'High' && (
                        <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '9999px', background: 'rgba(244,63,94,0.1)', color: 'var(--accent-rose)', fontWeight: 'bold' }}>
                          HIGH PRIORITY
                        </span>
                      )}
                    </div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '600', marginTop: '6px', color: '#fff' }}>{g.subject}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Submitted by: {g.studentId?.name} ({g.studentId?.rollNumber}) &bull; {new Date(g.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Link to={`/faculty/respond?ticketId=${g.ticketId}`} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem', borderColor: 'var(--border)' }}>
                    Open
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats Summary Sidebar */}
        <div className="glass-panel" style={{ padding: '30px', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ fontFamily: 'Outfit', fontSize: '1.2rem', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            Officer Overview
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.9rem' }}>
            <div>
              <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>DEPARTMENT HEAD</span>
              <span style={{ fontWeight: '500' }}>{user?.department?.departmentHead || 'N/A'}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>OFFICER ACCOUNT</span>
              <span style={{ fontWeight: '500' }}>{user?.name}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>EMAIL</span>
              <span style={{ fontWeight: '500' }}>{user?.email}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FacultyDashboard;
