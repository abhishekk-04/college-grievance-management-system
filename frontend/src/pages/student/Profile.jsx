import React, { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';
import { User, Key, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    course: user?.course || '',
    department: user?.department || '',
    profilePicture: user?.profilePicture || '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const academicDepartments = [
    'Biotechnology (BT)',
    'Civil Engineering (CE)',
    'Computer Science & Engineering (CSE)',
    'Computer Science & Engineering - IoT (CIOT)',
    'Computer Science & Engineering - AI (CSAI)',
    'Computer Science & Engineering - Data Science (CSDS)',
    'Computer Science & Engineering - Data Analytics (CSDA)',
    'Electronics & Communication Engineering (ECE)',
    'Electronics & Communication Engineering - IoT (ECIOT)',
    'Electronics & Communication Engineering - AI & ML (ECAM)',
    'Electrical Engineering (EE)',
    'Geoinformatics (GI)',
    'Information Technology (IT)',
    'Information Technology - Network Security (ITNS)',
    'Instrumentation & Control Engineering (ICE)',
    'Mathematics & Computing (MAC)',
    'Mechanical Engineering (ME)',
    'Mechanical Engineering - Electric Vehicles (MEEV)'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (formData.password && formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        course: formData.course,
        department: formData.department,
        profilePicture: formData.profilePicture,
        password: formData.password || undefined
      };

      const res = await api.put('/students/profile', payload);
      
      // Update global context user details
      updateProfile({
        ...user,
        ...res.data
      });

      setSuccess(true);
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '700px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2rem', fontFamily: 'Outfit', fontWeight: 'bold' }}>Profile Settings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Update your academic details, profile avatar, or change your account password.
        </p>
      </div>

      {success && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          color: 'var(--accent-emerald)',
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '24px',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <CheckCircle2 size={20} />
          Profile updated successfully!
        </div>
      )}

      {error && (
        <div style={{
          background: 'rgba(244, 63, 94, 0.1)',
          color: 'var(--accent-rose)',
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '24px',
          border: '1px solid rgba(244, 63, 94, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div className="glass-panel" style={{ padding: '32px', borderRadius: 'var(--radius-lg)' }}>
        <form onSubmit={handleSubmit}>
          
          <h3 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            <User size={18} />
            Academic Details
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Roll Number (Read-only)</label>
              <input
                type="text"
                className="form-control"
                disabled
                style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)', cursor: 'not-allowed' }}
                value={user?.rollNumber || ''}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Course</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">College Branch</label>
              <select
                className="form-control"
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                <option value="">Select Department</option>
                {academicDepartments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Avatar Profile Picture URL</label>
            <input
              type="text"
              placeholder="e.g. https://images.unsplash.com/photo-..."
              className="form-control"
              value={formData.profilePicture}
              onChange={(e) => setFormData({ ...formData, profilePicture: e.target.value })}
            />
          </div>

          <h3 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', marginTop: '32px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            <Key size={18} />
            Security & Credentials
          </h3>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '16px' }}>
            Leave the fields below empty if you do not wish to update your login password.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="form-control"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="form-control"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
          >
            <Save size={18} />
            {loading ? 'Saving Changes...' : 'Save Profile Settings'}
          </button>

        </form>
      </div>

    </div>
  );
};

export default Profile;
