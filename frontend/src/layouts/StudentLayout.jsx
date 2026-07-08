import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  User, 
  LogOut, 
  GraduationCap,
  ArrowLeft,
  Sun,
  Moon,
  Menu,
  X
} from 'lucide-react';

const StudentLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Submit Grievance', path: '/student/submit', icon: PlusCircle },
    { name: 'My Grievances', path: '/student/grievances', icon: FileText },
    { name: 'Profile Settings', path: '/student/profile', icon: User }
  ];

  return (
    <div className="layout-container">
      
      {/* Sidebar Overlay for Mobile */}
      <div className={`sidebar-overlay ${isSidebarOpen ? 'show' : ''}`} onClick={() => setIsSidebarOpen(false)} />

      {/* Sidebar */}
      <aside className={`sidebar glass-panel ${isSidebarOpen ? 'open' : ''}`}>
        <div>
          {/* Logo / Branding */}
          <div className="branding" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            gap: '12px', 
            marginBottom: '40px',
            paddingLeft: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <GraduationCap size={32} className="text-primary" style={{ color: 'var(--primary)' }} />
              <div>
                <h3 style={{ fontSize: '1.25rem', fontFamily: 'Outfit', fontWeight: 'bold' }}>CGS Portal</h3>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Student Division</p>
              </div>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="menu-toggle-btn"
              style={{ padding: '6px' }}
              title="Close Menu"
            >
              <X size={16} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="sidebar-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    background: isActive ? 'var(--primary-glow)' : 'transparent',
                    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                    borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                    textDecoration: 'none'
                  }}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer User Widget */}
        <div className="user-widget">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              fontWeight: 'bold',
              color: '#fff',
              overflow: 'hidden'
            }}>
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user?.name ? user.name[0].toUpperCase() : 'S'
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: '0.85rem', fontWeight: '600', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {user?.name || 'Student'}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {user?.rollNumber || 'CS2023000'}
              </p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="btn-secondary" 
            style={{ 
              width: '100%', 
              padding: '10px', 
              fontSize: '0.85rem', 
              justifyContent: 'center',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        
        {/* Top Navbar with Back & Theme options */}
        <div className="top-nav-bar" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="menu-toggle-btn"
              title="Open Navigation Menu"
            >
              <Menu size={18} />
            </button>
            <button 
              onClick={() => navigate(-1)} 
              className="btn-secondary" 
              style={{ 
                padding: '6px 14px', 
                fontSize: '0.8rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <ArrowLeft size={16} />
              Back
            </button>
          </div>
          
          <button 
            onClick={toggleTheme} 
            className="btn-secondary" 
            style={{ 
              padding: '6px 14px', 
              fontSize: '0.8rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
        </div>

        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;
