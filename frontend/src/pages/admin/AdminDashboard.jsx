import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { 
  Users, 
  UserCheck, 
  FileText, 
  Clock, 
  CheckCircle, 
  XOctagon, 
  HelpCircle,
  BarChart,
  LineChart as LineChartIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart as ReLineChart,
  Line,
  PieChart as RePieChart,
  Pie,
  Cell
} from 'recharts';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchSummaryStats = async () => {
      try {
        const res = await api.get('/reports/summary');
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching admin summary stats:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSummaryStats();
  }, []);

  const COLORS = [
    '#6366f1', // Indigo
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#8b5cf6', // Purple
    '#06b6d4', // Cyan
    '#f43f5e', // Rose
    '#3b82f6', // Blue
    '#ec4899', // Pink
    '#eab308', // Yellow
    '#14b8a6'  // Teal
  ];

  if (loading) {
    return <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px' }}>Loading analytics dashboard...</p>;
  }

  const { counts, categoryStats, departmentStats, monthlyTrends } = stats || {
    counts: { students: 0, faculty: 0, grievances: 0, pending: 0, underReview: 0, inProgress: 0, resolved: 0, closed: 0, rejected: 0 },
    categoryStats: [],
    departmentStats: [],
    monthlyTrends: []
  };

  return (
    <div className="animate-fade-in">
      
      {/* Banner */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontFamily: 'Outfit', fontWeight: 'bold' }}>Analytics Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Monitor college-wide complaints, review student/faculty counts, and analyze trend categories.
        </p>
      </div>

      {/* Main Core counters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Total Students */}
        <div className="glass-panel stat-card" style={{ padding: '20px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>TOTAL STUDENTS</span>
            <div className="stat-value" style={{ fontSize: '1.8rem' }}>{counts.students}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'var(--primary-glow)', color: 'var(--primary)', width: '40px', height: '40px' }}>
            <Users size={18} />
          </div>
        </div>

        {/* Total Faculty */}
        <div className="glass-panel stat-card" style={{ padding: '20px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>TOTAL FACULTY</span>
            <div className="stat-value" style={{ fontSize: '1.8rem' }}>{counts.faculty}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-purple)', width: '40px', height: '40px' }}>
            <UserCheck size={18} />
          </div>
        </div>

        {/* Total Grievances */}
        <div className="glass-panel stat-card" style={{ padding: '20px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>TOTAL TICKETS</span>
            <div className="stat-value" style={{ fontSize: '1.8rem' }}>{counts.grievances}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)', width: '40px', height: '40px' }}>
            <FileText size={18} />
          </div>
        </div>

      </div>

      {/* Ticket Status Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {/* Pending */}
        <div className="glass-panel" style={{ padding: '16px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'bold', display: 'block' }}>PENDING</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-amber)', fontFamily: 'Outfit' }}>{counts.pending}</span>
        </div>
        {/* Under Review */}
        <div className="glass-panel" style={{ padding: '16px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'bold', display: 'block' }}>UNDER REVIEW</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-purple)', fontFamily: 'Outfit' }}>{counts.underReview}</span>
        </div>
        {/* In Progress */}
        <div className="glass-panel" style={{ padding: '16px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'bold', display: 'block' }}>IN PROGRESS</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-cyan)', fontFamily: 'Outfit' }}>{counts.inProgress}</span>
        </div>
        {/* Resolved */}
        <div className="glass-panel" style={{ padding: '16px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'bold', display: 'block' }}>RESOLVED</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-emerald)', fontFamily: 'Outfit' }}>{counts.resolved}</span>
        </div>
        {/* Closed */}
        <div className="glass-panel" style={{ padding: '16px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'bold', display: 'block' }}>CLOSED</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-secondary)', fontFamily: 'Outfit' }}>{counts.closed}</span>
        </div>
        {/* Rejected */}
        <div className="glass-panel" style={{ padding: '16px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'bold', display: 'block' }}>REJECTED</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-rose)', fontFamily: 'Outfit' }}>{counts.rejected}</span>
        </div>
      </div>

      {/* Visual Charts Layout */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* Grid 1: Department Bar Chart & Monthly Trends */}
        <div className="admin-dashboard-half-col">
          
          {/* Department Bar Chart */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', marginBottom: '20px', color: '#fff' }}>
              Grievances Department Distribution
            </h3>
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={departmentStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={10} tickLine={false} />
                  <YAxis stroke="var(--text-secondary)" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Trend line */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', marginBottom: '20px', color: '#fff' }}>
              Monthly Grievance Submission Trend
            </h3>
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ReLineChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize={10} tickLine={false} />
                  <YAxis stroke="var(--text-secondary)" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="Grievances" stroke="var(--accent-purple)" strokeWidth={3} dot={{ r: 4 }} />
                </ReLineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Grid 2: Category Breakdown Pie Chart */}
        <div className="admin-dashboard-two-col">
          
          {/* Category Breakdown (Pie) */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', marginBottom: '20px', color: '#fff' }}>
              Category Breakdown
            </h3>
            
            <div style={{ display: 'flex', alignItems: 'center', height: '300px' }}>
              <div style={{ width: '50%', height: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={categoryStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                    />
                  </RePieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend List */}
              <div style={{ width: '50%', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                {categoryStats.map((entry, index) => (
                  <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: COLORS[index % COLORS.length] }}></div>
                    <span style={{ color: 'var(--text-secondary)' }}>{entry.name}:</span>
                    <strong style={{ color: '#fff' }}>{entry.value}</strong>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Quick Stats sidebar summary box */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', justifySelf: 'stretch' }}>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', marginBottom: '16px', color: '#fff' }}>
              Status Summary
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Resolution Efficiency:</span>
                <strong style={{ color: 'var(--accent-emerald)' }}>
                  {counts.grievances > 0 ? (( (counts.resolved + counts.closed) / counts.grievances) * 100).toFixed(1) : 0}%
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Unaddressed (Pending):</span>
                <strong style={{ color: 'var(--accent-amber)' }}>{counts.pending}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Active (In Review/Progress):</span>
                <strong style={{ color: 'var(--accent-cyan)' }}>{counts.underReview + counts.inProgress}</strong>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
