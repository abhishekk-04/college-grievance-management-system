import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { 
  Search, 
  Filter, 
  Eye,
  AlertCircle,
  ArrowRight,
  TrendingDown,
  Calendar
} from 'lucide-react';

const MyGrievances = () => {
  const location = useLocation();

  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Fixed categories list
  const categories = [
    'Attendance Issues',
    'Examination Issues',
    'Marks/Re-evaluation',
    'Fee Related',
    'Scholarship',
    'Hostel Complaints',
    'Library Complaints',
    'Infrastructure',
    'Faculty Related',
    'Technical/Lab',
    'Other'
  ];

  useEffect(() => {
    const fetchGrievances = async () => {
      try {
        const res = await api.get('/grievances/mine');
        setGrievances(res.data);
      } catch (err) {
        console.error('Error fetching grievances:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGrievances();
  }, []);

  // Filter list locally for immediate feedback
  const filteredGrievances = grievances.filter(g => {
    const matchesSearch = 
      g.ticketId.toLowerCase().includes(search.toLowerCase()) ||
      g.subject.toLowerCase().includes(search.toLowerCase()) ||
      g.description.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === '' || g.status === statusFilter;
    const matchesCategory = categoryFilter === '' || g.category === categoryFilter;
    const matchesPriority = priorityFilter === '' || g.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2rem', fontFamily: 'Outfit', fontWeight: 'bold' }}>My Grievance History</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Review the status of your submitted tickets, read comments from department staff, and submit feedback.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', gap: '12px' }}>
          
          {/* Search bar */}
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Search Ticket ID or subject..."
              className="form-control"
              style={{ paddingLeft: '36px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Under Review">Under Review</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
            <option value="Rejected">Rejected</option>
          </select>

          {/* Category Filter */}
          <select
            className="form-control"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            className="form-control"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

        </div>
      </div>

      {/* Grid Log layout of Grievances */}
      {loading ? (
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px' }}>Loading grievance log...</p>
      ) : filteredGrievances.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 40px', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
          <AlertCircle size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
          <h3 style={{ fontFamily: 'Outfit', marginBottom: '8px' }}>No Grievances Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 20px auto' }}>
            No records matched your search filters. Try updating your criteria or submit a new ticket.
          </p>
          <Link to="/student/submit" className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
            Submit a New Grievance
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
          {filteredGrievances.map((g) => (
            <div key={g._id} className="glass-panel glass-card-interactive" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 'bold', fontFamily: 'Outfit', color: 'var(--primary)' }}>
                      {g.ticketId}
                    </span>
                    <span className={`status-badge ${
                      g.status === 'Pending' ? 'status-pending' :
                      g.status === 'Under Review' ? 'status-review' :
                      g.status === 'In Progress' ? 'status-progress' :
                      g.status === 'Resolved' ? 'status-resolved' :
                      g.status === 'Closed' ? 'status-closed' : 'status-rejected'
                    }`}>
                      {g.status}
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: g.priority === 'High' ? 'rgba(244,63,94,0.1)' : 'rgba(255,255,255,0.05)',
                      color: g.priority === 'High' ? 'var(--accent-rose)' : 'var(--text-secondary)'
                    }}>
                      {g.priority} Priority
                    </span>
                  </div>
                  
                  <h3 style={{ fontSize: '1.15rem', fontFamily: 'Outfit', fontWeight: '600', marginTop: '12px', color: '#fff' }}>
                    {g.subject}
                  </h3>
                  
                  <p style={{ 
                    fontSize: '0.9rem', 
                    color: 'var(--text-secondary)', 
                    margin: '8px 0 16px 0',
                    display: '-webkit-box',
                    WebkitLineClamp: '2',
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: '1.4'
                  }}>
                    {g.description}
                  </p>

                  <div style={{ display: 'flex', gap: '20px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} />
                      {new Date(g.createdAt).toLocaleDateString()}
                    </div>
                    <div>
                      Department: <span style={{ color: 'var(--text-secondary)' }}>{g.department?.departmentName || 'General'}</span>
                    </div>
                  </div>
                </div>

                <Link to={`/student/track?ticketId=${g.ticketId}`} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  <Eye size={16} />
                  View Progress
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyGrievances;
