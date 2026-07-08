import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';
import { GraduationCap, UserPlus, AlertCircle, ArrowLeft } from 'lucide-react';

const Register = () => {
  const { register, user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    email: '',
    course: '',
    department: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
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

  // Redirect if logged in
  useEffect(() => {
    if (user) {
      navigate('/student/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        rollNumber: formData.rollNumber,
        email: formData.email,
        course: formData.course,
        department: formData.department,
        password: formData.password
      };
      
      await register(payload);
      navigate('/student/dashboard');
    } catch (err) {
      setError(err || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '90vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px'
    }} className="animate-fade-in">
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '16px', fontSize: '0.9rem' }}>
        <ArrowLeft size={16} />
        Back to Home
      </Link>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '520px',
        padding: '40px',
        borderRadius: 'var(--radius-lg)'
      }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--primary-glow)',
            marginBottom: '16px',
            border: '1px solid rgba(99, 102, 241, 0.15)'
          }}>
            <GraduationCap size={32} style={{ color: 'var(--primary)' }} />
          </div>
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.75rem', fontWeight: 'bold' }}>Create Student Account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Register to submit and track grievances
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.1)',
            color: 'var(--accent-rose)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            marginBottom: '20px',
            border: '1px solid rgba(244, 63, 94, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                placeholder="Abhishek Kumar"
                className="form-control"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Roll Number</label>
              <input
                type="text"
                placeholder="CS20230042"
                className="form-control"
                required
                value={formData.rollNumber}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">College Email Address</label>
            <input
              type="email"
              placeholder="abhishek@college.edu"
              className="form-control"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Course / Degree</label>
              <input
                type="text"
                placeholder="B.Tech CSE"
                className="form-control"
                required
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Student Department</label>
              <select
                className="form-control"
                required
                style={{ appearance: 'none', WebkitAppearance: 'none' }}
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="form-control"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="form-control"
                required
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
            <UserPlus size={18} />
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '500' }}>Sign In</Link>
        </div>

      </div>
    </div>
  );
};

export default Register;
