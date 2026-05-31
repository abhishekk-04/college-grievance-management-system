import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Search, Eye, AlertCircle, Calendar, Trash2, ShieldCheck, UserCheck, X } from 'lucide-react';

const GrievanceManagement = () => {
  const [grievances, setGrievances] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  
  // Notification states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Assign Modal states
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [activeGrievance, setActiveGrievance] = useState(null);
  const [assignForm, setAssignForm] = useState({
    departmentId: '',
    facultyId: ''
  });

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
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const gRes = await api.get('/grievances');
      setGrievances(gRes.data);

      const fRes = await api.get('/faculty');
      setFacultyList(fRes.data.filter(f => f.role === 'Faculty')); // only load real officers for assignation dropdowns

      const dRes = await api.get('/departments');
      setDepartments(dRes.data);
    } catch (err) {
      setError('Could not retrieve grievance logs.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this grievance? This removes all conversations.')) return;
    setError('');
    setSuccess('');

    try {
      await api.delete(`/grievances/${id}`);
      setSuccess('Grievance ticket deleted successfully.');
      fetchData();
    } catch (err) {
      setError('Error deleting grievance ticket.');
    }
  };

  const openAssignModal = (g) => {
    setActiveGrievance(g);
    setAssignForm({
      departmentId: g.department?._id || '',
      facultyId: g.assignedTo?._id || ''
    });
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.put(`/grievances/${activeGrievance._id}/assign`, {
        departmentId: assignForm.departmentId,
        facultyId: assignForm.facultyId || null // support unassigned faculty
      });
      
      setSuccess(`Ticket ${activeGrievance.ticketId} assignment updated.`);
      setShowAssignModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating assignment metadata.');
    }
  };

  const handleCloseOrReject = async (id, action) => {
    // action is 'Closed' or 'Rejected'
    const reason = window.prompt(`Enter note / reason for setting status to '${action}':`);
    if (reason === null) return; // cancel

    setError('');
    setSuccess('');

    try {
      await api.put(`/grievances/${id}/status`, {
        status: action,
        note: reason || `Ticket marked as ${action} by Admin.`
      });

      setSuccess(`Ticket status updated to ${action}.`);
      fetchData();
    } catch (err) {
      setError('Error changing ticket status.');
    }
  };

  // Filter lists locally for snappy rendering
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
    const matchesDept = deptFilter === '' || g.department?._id === deptFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority && matchesDept;
  });

  return (
    <div className="animate-fade-in">
      
      {/* Title */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2rem', fontFamily: 'Outfit', fontWeight: 'bold' }}>Manage System Tickets</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Assign tickets, change departments, escalate statuses, and reject/close cases.</p>
      </div>

      {error && (
        <div style={{ background: 'rgba(244,63,94,0.1)', color: 'var(--accent-rose)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', border: '1px solid rgba(244,63,94,0.25)' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--accent-emerald)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', border: '1px solid rgba(16,185,129,0.25)' }}>
          {success}
        </div>
      )}

      {/* Filter toolbar */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr 1fr', gap: '10px' }}>
          
          {/* Search bar */}
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Search Roll, Name, Ticket..."
              className="form-control"
              style={{ paddingLeft: '36px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <select className="form-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Under Review">Under Review</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
            <option value="Rejected">Rejected</option>
          </select>

          {/* Department Filter */}
          <select className="form-control" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d._id} value={d._id}>{d.departmentName}</option>
            ))}
          </select>

          {/* Category Filter */}
          <select className="form-control" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Priority Filter */}
          <select className="form-control" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

        </div>
      </div>

      {/* Grievances List table layout */}
      {loading ? (
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px' }}>Loading grievance tickets...</p>
      ) : filteredGrievances.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 40px', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
          <AlertCircle size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
          <h3 style={{ fontFamily: 'Outfit' }}>No Grievances Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No ticket records matched these filters.</p>
        </div>
      ) : (
        <div className="glass-panel" style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '16px' }}>Ticket ID</th>
                <th style={{ padding: '16px' }}>Student</th>
                <th style={{ padding: '16px' }}>Subject</th>
                <th style={{ padding: '16px' }}>Category</th>
                <th style={{ padding: '16px' }}>Department</th>
                <th style={{ padding: '16px' }}>Assigned To</th>
                <th style={{ padding: '16px' }}>Status</th>
                <th style={{ padding: '16px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGrievances.map((g) => (
                <tr key={g._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px', fontWeight: 'bold', color: 'var(--accent-emerald)' }}>{g.ticketId}</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: '500', color: '#fff' }}>{g.studentId?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{g.studentId?.rollNumber}</div>
                  </td>
                  <td style={{ padding: '16px', maxWidth: '180px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {g.subject}
                  </td>
                  <td style={{ padding: '16px' }}>{g.category}</td>
                  <td style={{ padding: '16px' }}>{g.department?.departmentName}</td>
                  <td style={{ padding: '16px', color: g.assignedTo ? '#fff' : 'var(--text-muted)' }}>
                    {g.assignedTo ? g.assignedTo.name : 'Unassigned'}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span className={`status-badge ${
                      g.status === 'Pending' ? 'status-pending' :
                      g.status === 'Under Review' ? 'status-review' :
                      g.status === 'In Progress' ? 'status-progress' :
                      g.status === 'Resolved' ? 'status-resolved' :
                      g.status === 'Closed' ? 'status-closed' : 'status-rejected'
                    }`} style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                      {g.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      
                      {/* Assign btn */}
                      <button 
                        title="Assign Department/Officer"
                        onClick={() => openAssignModal(g)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--accent-purple)', cursor: 'pointer', padding: '4px' }}
                      >
                        <UserCheck size={16} />
                      </button>

                      {/* Close ticket (if Resolved) */}
                      {g.status === 'Resolved' && (
                        <button 
                          title="Force Close Ticket"
                          onClick={() => handleCloseOrReject(g._id, 'Closed')}
                          style={{ background: 'transparent', border: 'none', color: 'var(--accent-emerald)', cursor: 'pointer', padding: '4px' }}
                        >
                          <ShieldCheck size={16} />
                        </button>
                      )}

                      {/* Reject ticket (if Pending/Progress) */}
                      {g.status !== 'Closed' && g.status !== 'Rejected' && (
                        <button 
                          title="Reject Ticket with Reason"
                          onClick={() => handleCloseOrReject(g._id, 'Rejected')}
                          style={{ background: 'transparent', border: 'none', color: 'var(--accent-amber)', cursor: 'pointer', padding: '4px' }}
                        >
                          <X size={16} />
                        </button>
                      )}

                      {/* Delete ticket */}
                      <button 
                        title="Delete ticket completely"
                        onClick={() => handleDelete(g._id)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', padding: '4px' }}
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* RE-ASSIGN DEPARTMENT AND OFFICER MODAL */}
      {showAssignModal && activeGrievance && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '30px', borderRadius: 'var(--radius-lg)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', fontWeight: 'bold' }}>Assign Ticket</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>{activeGrievance.ticketId}</span>
              </div>
              <button 
                onClick={() => setShowAssignModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit}>
              <div className="form-group">
                <label className="form-label">Assign Department</label>
                <select 
                  className="form-control"
                  required
                  value={assignForm.departmentId}
                  onChange={(e) => setAssignForm({ ...assignForm, departmentId: e.target.value, facultyId: '' })} // reset officer on department switch
                >
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>{d.departmentName}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Assign Department Faculty Officer</label>
                <select 
                  className="form-control"
                  value={assignForm.facultyId}
                  onChange={(e) => setAssignForm({ ...assignForm, facultyId: e.target.value })}
                >
                  <option value="">Unassigned (Assigns to general Department list)</option>
                  {facultyList
                    .filter(f => String(f.department?._id) === String(assignForm.departmentId))
                    .map((fac) => (
                      <option key={fac._id} value={fac._id}>{fac.name}</option>
                    ))
                  }
                </select>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <ShieldCheck size={16} />
                Save Allocations
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default GrievanceManagement;
