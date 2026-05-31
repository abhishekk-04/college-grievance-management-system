import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Building2, Plus, Edit, Trash2, X, Save } from 'lucide-react';

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal Control
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create', 'edit'
  const [editingDeptId, setEditingDeptId] = useState(null);

  const [form, setForm] = useState({
    departmentName: '',
    departmentHead: '',
    description: ''
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/departments');
      setDepartments(res.data);
    } catch (err) {
      setError('Could not load departments.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/departments', form);
      setSuccess('Department successfully added.');
      setShowModal(false);
      setForm({ departmentName: '', departmentHead: '', description: '' });
      fetchDepartments();
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating department.');
    }
  };

  const openEditModal = (deptObj) => {
    setEditingDeptId(deptObj._id);
    setForm({
      departmentName: deptObj.departmentName,
      departmentHead: deptObj.departmentHead,
      description: deptObj.description
    });
    setModalType('edit');
    setShowModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.put(`/departments/${editingDeptId}`, form);
      setSuccess('Department details updated.');
      setShowModal(false);
      setForm({ departmentName: '', departmentHead: '', description: '' });
      fetchDepartments();
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating department.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department? Warning: This might break faculty associations.')) return;
    setError('');
    setSuccess('');

    try {
      await api.delete(`/departments/${id}`);
      setSuccess('Department successfully deleted.');
      fetchDepartments();
    } catch (err) {
      setError('Error deleting department.');
    }
  };

  return (
    <div className="animate-fade-in">
      
      {/* Title block */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'Outfit', fontWeight: 'bold' }}>Department Directory</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Configure departments and set division leaders.</p>
        </div>
        <button 
          onClick={() => {
            setForm({ departmentName: '', departmentHead: '', description: '' });
            setModalType('create');
            setShowModal(true);
          }}
          className="btn-primary"
        >
          <Plus size={18} />
          Add Department
        </button>
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

      {/* Grid List of Departments */}
      {loading ? (
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px' }}>Loading departments...</p>
      ) : departments.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 40px', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
          <Building2 size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
          <h3 style={{ fontFamily: 'Outfit' }}>No Departments Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Get started by adding a department.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {departments.map((dept) => (
            <div key={dept._id} className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                    <Building2 size={18} style={{ margin: 'auto' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontFamily: 'Outfit', fontWeight: 'bold', color: '#fff' }}>{dept.departmentName}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Head: {dept.departmentHead}</span>
                  </div>
                </div>
                
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '20px' }}>
                  {dept.description}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <button 
                  onClick={() => openEditModal(dept)}
                  className="btn-secondary" 
                  style={{ flex: 1, padding: '6px 12px', fontSize: '0.8rem', justifyContent: 'center' }}
                >
                  <Edit size={14} />
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(dept._id)}
                  className="btn-secondary" 
                  style={{ flex: 1, padding: '6px 12px', fontSize: '0.8rem', justifyContent: 'center', color: 'var(--accent-rose)', borderColor: 'rgba(244,63,94,0.1)' }}
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DEPARTMENT MODAL */}
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
            borderRadius: 'var(--radius-lg)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', fontWeight: 'bold' }}>
                {modalType === 'create' ? 'Create Department' : 'Edit Department Details'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={modalType === 'create' ? handleCreateSubmit : handleEditSubmit}>
              <div className="form-group">
                <label className="form-label">Department Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  placeholder="e.g. IT & Technical Support"
                  value={form.departmentName}
                  onChange={(e) => setForm({ ...form, departmentName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Head of Department (Name)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  placeholder="e.g. Mrs. Emily Bytes"
                  value={form.departmentHead}
                  onChange={(e) => setForm({ ...form, departmentHead: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Description</label>
                <textarea 
                  className="form-control" 
                  rows="4"
                  required
                  placeholder="Describe department roles and responsibilities..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                ></textarea>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <Save size={16} />
                Save Department
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DepartmentManagement;
