import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Search, Eye, AlertCircle, Calendar } from 'lucide-react';

const AssignedGrievances = () => {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

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
        const res = await api.get('/grievances/department');
        setGrievances(res.data);
      } catch (err) {
        console.error('Error fetching grievances:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGrievances();
  }, []);

  // Filter list locally based on query criteria
  const filteredGrievances = grievances.filter(g => {
    const searchString = search.toLowerCase();
    const studentName = g.studentId?.name?.toLowerCase() || '';
    const studentRoll = g.studentId?.rollNumber?.toLowerCase() || '';
    const subject = g.subject?.toLowerCase() || '';
    const ticketId = g.ticketId?.toLowerCase() || '';

    const matchesSearch = 
      ticketId.includes(searchString) ||
      studentName.includes(searchString) ||
      studentRoll.includes(searchString) ||
      subject.includes(searchString);

    const matchesStatus = statusFilter === '' || g.status === statusFilter;
    const matchesCategory = categoryFilter === '' || g.category === categoryFilter;
    const matchesPriority = priorityFilter === '' || g.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2rem', fontFamily: 'Outfit', fontWeight: 'bold' }}>Department Grievances</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Manage all grievances assigned to your department. Search by roll number or update ticket statuses.
        </p>
      </div>

      {/* Filter toolbar */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
        <div className="filter-toolbar-grid-4">
          
          {/* Search bar */}
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Search Ticket, Name, or Roll..."
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

      {/* Grievances List */}
      {loading ? (
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px' }}>Loading department grievances...</p>
      ) : filteredGrievances.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 40px', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
          <AlertCircle size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
          <h3 style={{ fontFamily: 'Outfit', marginBottom: '8px' }}>No Assigned Grievances</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
            No complaints found matching your search.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
          {filteredGrievances.map((g) => (
            <div key={g._id} className="glass-panel glass-card-interactive" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 'bold', fontFamily: 'Outfit', color: 'var(--accent-purple)' }}>
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
                  
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Submitted by: <strong style={{ color: '#fff' }}>{g.studentId?.name}</strong> ({g.studentId?.rollNumber}) &bull; Course: {g.studentId?.course}
                  </p>

                  <p style={{ 
                    fontSize: '0.9rem', 
                    color: 'var(--text-secondary)', 
                    margin: '12px 0 16px 0',
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
                      Category: <span style={{ color: 'var(--text-secondary)' }}>{g.category}</span>
                    </div>
                  </div>
                </div>

                <Link to={`/faculty/respond?ticketId=${g.ticketId}`} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  <Eye size={16} />
                  Manage Ticket
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignedGrievances;
