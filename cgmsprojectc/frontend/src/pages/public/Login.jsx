import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { GraduationCap, LogIn, AlertCircle, Bot, ArrowLeft } from 'lucide-react';

const Login = () => {
  const { login, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleTab, setRoleTab] = useState('Student'); // 'Student' or 'Staff' (Faculty/Admin)
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionExpiredMsg, setSessionExpiredMsg] = useState(false);

  // Check if redirected from expired session
  useEffect(() => {
    if (location.search.includes('expired=true')) {
      setSessionExpiredMsg(true);
    }
  }, [location]);

  // If user already logged in, redirect them to their respective dashboard
  useEffect(() => {
    if (user) {
      if (user.role === 'Student') {
        navigate('/student/dashboard');
      } else if (user.role === 'Faculty') {
        navigate('/faculty/dashboard');
      } else if (user.role === 'Admin') {
        navigate('/admin/dashboard');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSessionExpiredMsg(false);
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      
      // Enforce portal boundaries based on current portal tab
      if (roleTab === 'Student' && loggedUser.role !== 'Student') {
        await logout();
        setError('Access denied. Please use the Faculty / Admin login portal.');
        return;
      }
      
      if (roleTab === 'Staff' && loggedUser.role === 'Student') {
        await logout();
        setError('Access denied. Please use the Student login portal.');
        return;
      }

      if (loggedUser.role === 'Student') {
        navigate('/student/dashboard');
      } else if (loggedUser.role === 'Faculty') {
        navigate('/faculty/dashboard');
      } else if (loggedUser.role === 'Admin') {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '80vh',
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
        maxWidth: '440px',
        padding: '40px',
        borderRadius: 'var(--radius-lg)'
      }}>
        
        {/* Logo/Branding */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
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
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.75rem', fontWeight: 'bold' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Access the College Grievance System
          </p>
        </div>

        {/* Tab Role Selector */}
        <div style={{
          display: 'flex',
          background: 'rgba(15, 23, 42, 0.5)',
          padding: '4px',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '24px',
          border: '1px solid var(--border)'
        }}>
          <button
            type="button"
            onClick={() => { setRoleTab('Student'); setError(''); }}
            style={{
              flex: 1,
              padding: '10px 0',
              border: 'none',
              background: roleTab === 'Student' ? 'var(--primary)' : 'transparent',
              color: roleTab === 'Student' ? '#fff' : 'var(--text-secondary)',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          >
            Student Portal
          </button>
          <button
            type="button"
            onClick={() => { setRoleTab('Staff'); setError(''); }}
            style={{
              flex: 1,
              padding: '10px 0',
              border: 'none',
              background: roleTab === 'Staff' ? 'var(--primary)' : 'transparent',
              color: roleTab === 'Staff' ? '#fff' : 'var(--text-secondary)',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          >
            Faculty / Admin
          </button>
        </div>

        {/* Session Expired / Error Alert */}
        {sessionExpiredMsg && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.1)',
            color: 'var(--accent-amber)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            marginBottom: '20px',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <AlertCircle size={16} />
            Your session has expired. Please login again.
          </div>
        )}

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

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              placeholder="name@college.edu"
              className="form-control"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label className="form-label" style={{ margin: 0 }}>Password</label>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              className="form-control"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
          >
            <LogIn size={18} />
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Credentials Alert Helper */}
        <div style={{
          marginTop: '24px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 16px',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)'
        }}>
          <span style={{ fontWeight: 'bold', color: 'var(--primary)', display: 'block', marginBottom: '4px' }}>
            💡 Demo Logins:
          </span>
          {roleTab === 'Student' ? (
            <span>student@cgs.com / student123</span>
          ) : (
            <span>admin@cgs.com / admin123 (Admin)<br />faculty@cgs.com / faculty123 (Faculty)</span>
          )}
        </div>

        {/* Student Registration redirect link */}
        {roleTab === 'Student' && (
          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            New student? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '500' }}>Create an account</Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default Login;
