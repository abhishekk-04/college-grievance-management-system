import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Plus, Edit, Trash2, ShieldAlert, X, Check, Save } from 'lucide-react';

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState('students'); // 'students' or 'faculty'
  const [students, setStudents] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal control states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create_faculty'); // 'create_faculty', 'edit_faculty'
  const [editingFacultyId, setEditingFacultyId] = useState(null);

  // Form states for Faculty CRUD
  const [facultyForm, setFacultyForm] = useState({
    name: '',
    email: '',
    department: '',
    password: '',
    role: 'Faculty' // 'Faculty' or 'Admin'
  });

  useEffect(() => {
    fetchUsersData();
  }, []);

  const fetchUsersData = async () => {
    setLoading(true);
    setError('');
    try {
      const studentRes = await api.get('/students');
      setStudents(studentRes.data);

      const facultyRes = await api.get('/faculty');
      setFacultyList(facultyRes.data);

      const deptRes = await api.get('/departments');
      setDepartments(deptRes.data);
    } catch (err) {
      setError('Could not retrieve user directories.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFacultySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/faculty', facultyForm);
      setSuccess('Faculty member created successfully!');
      setShowModal(false);
      
      // Reset form
      setFacultyForm({ name: '', email: '', department: '', password: '', role: 'Faculty' });
      fetchUsersData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating faculty member.');
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student account? This action is permanent.')) return;
    try {
      await api.delete(`/students/${id}`);
      setSuccess('Student account deleted.');
      fetchUsersData();
    } catch (err) {
      setError('Error deleting student.');
    }
  };

  const handleDeleteFaculty = async (id) => {
    if (!window.confirm('Are you sure you want to delete this faculty member? This action is permanent.')) return;
    try {
      await api.delete(`/faculty/${id}`);
      setSuccess('Faculty member deleted.');
      fetchUsersData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting faculty.');
    }
  };

  const openEditFacultyModal = (facObj) => {
    setEditingFacultyId(facObj._id);
    setFacultyForm({
      name: facObj.name,
      email: facObj.email,
      department: facObj.department?._id || '',
      password: '', // blank password unless modifying
      role: facObj.role
    });
    setModalType('edit_faculty');
    setShowModal(true);
  };

  const handleEditFacultySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const payload = {
        name: facultyForm.name,
        email: facultyForm.email,
        department: facultyForm.role === 'Admin' ? undefined : facultyForm.department,
        role: facultyForm.role,
        password: facultyForm.password || undefined
      };

      await api.put(`/faculty/${editingFacultyId}`, payload);
      setSuccess('Faculty account details saved!');
      setShowModal(false);
      setFacultyForm({ name: '', email: '', department: '', password: '', role: 'Faculty' });
      fetchUsersData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving details.');
    }
  };

  return (
    <div className="animate-fade-in">
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'Outfit', fontWeight: 'bold' }}>User Management</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage student enrollment registries and create faculty accounts.</p>
        </div>
        
        {activeTab === 'faculty' && (
          <button 
            onClick={() => {
              setFacultyForm({ name: '', email: '', department: '', password: '', role: 'Faculty' });
              setModalType('create_faculty');
              setShowModal(true);
            }} 
            className="btn-primary"
          >
            <Plus size={18} />
            Create Faculty
          </button>
        )}
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

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '24px', gap: '8px' }}>
        <button
          onClick={() => setActiveTab('students')}
          style={{
            padding: '12px 24px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'students' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'students' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '0.95rem'
          }}
        >
          Students Directory ({students.length})
        </button>
        <button
          onClick={() => setActiveTab('faculty')}
          style={{
            padding: '12px 24px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'faculty' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'faculty' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '0.95rem'
          }}
        >
          Faculty / Admins ({facultyList.length})
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px' }}>Loading directory list...</p>
      ) : activeTab === 'students' ? (
        /* Students Directory Table */
        <div className="glass-panel" style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '16px' }}>Name</th>
                <th style={{ padding: '16px' }}>Roll Number</th>
                <th style={{ padding: '16px' }}>Email</th>
                <th style={{ padding: '16px' }}>Course</th>
                <th style={{ padding: '16px' }}>Branch</th>
                <th style={{ padding: '16px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px', fontWeight: '500', color: '#fff' }}>{student.name}</td>
                  <td style={{ padding: '16px' }}>{student.rollNumber}</td>
                  <td style={{ padding: '16px' }}>{student.email}</td>
                  <td style={{ padding: '16px' }}>{student.course}</td>
                  <td style={{ padding: '16px' }}>{student.department}</td>
                  <td style={{ padding: '16px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button 
                      onClick={() => handleDeleteStudent(student._id)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', padding: '6px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Faculty Directory Table */
        <div className="glass-panel" style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '16px' }}>Name</th>
                <th style={{ padding: '16px' }}>Email</th>
                <th style={{ padding: '16px' }}>Department</th>
                <th style={{ padding: '16px' }}>Role</th>
                <th style={{ padding: '16px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {facultyList.map((fac) => (
                <tr key={fac._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px', fontWeight: '500', color: '#fff' }}>{fac.name}</td>
                  <td style={{ padding: '16px' }}>{fac.email}</td>
                  <td style={{ padding: '16px' }}>{fac.department?.departmentName || 'All Systems (Admin)'}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: fac.role === 'Admin' ? 'rgba(16,185,129,0.1)' : 'rgba(139,92,246,0.1)',
                      color: fac.role === 'Admin' ? 'var(--accent-emerald)' : 'var(--accent-purple)'
                    }}>
                      {fac.role}
                    </span>
                  </td>
                  <td style={{ padding: '16px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button 
                      onClick={() => openEditFacultyModal(fac)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '6px' }}
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteFaculty(fac._id)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', padding: '6px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE / EDIT FACULTY MODAL POPUP */}
      {showModal && (
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
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '460px',
            padding: '30px',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', fontWeight: 'bold' }}>
                {modalType === 'create_faculty' ? 'Create Faculty Account' : 'Edit Faculty Details'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={modalType === 'create_faculty' ? handleCreateFacultySubmit : handleEditFacultySubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  value={facultyForm.name}
                  onChange={(e) => setFacultyForm({ ...facultyForm, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="form-control" 
                  required 
                  value={facultyForm.email}
                  onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">System Role</label>
                  <select 
                    className="form-control"
                    value={facultyForm.role}
                    onChange={(e) => setFacultyForm({ ...facultyForm, role: e.target.value })}
                  >
                    <option value="Faculty">Faculty Officer</option>
                    <option value="Admin">Administrator</option>
                  </select>
                </div>

                {facultyForm.role === 'Faculty' && (
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select 
                      className="form-control"
                      required
                      value={facultyForm.department}
                      onChange={(e) => setFacultyForm({ ...facultyForm, department: e.target.value })}
                    >
                      <option value="">Select Dept</option>
                      {departments.map((dept) => (
                        <option key={dept._id} value={dept._id}>{dept.departmentName}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">
                  {modalType === 'create_faculty' ? 'Account Password' : 'Password (leave blank to keep unchanged)'}
                </label>
                <input 
                  type="password" 
                  className="form-control" 
                  required={modalType === 'create_faculty'}
                  value={facultyForm.password}
                  onChange={(e) => setFacultyForm({ ...facultyForm, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <Save size={16} />
                Save Account
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserManagement;
