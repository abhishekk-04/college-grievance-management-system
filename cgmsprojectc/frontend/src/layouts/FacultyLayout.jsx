import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { 
  LayoutDashboard, 
  FolderLock, 
  LogOut, 
  ShieldAlert,
  UserCheck,
  ArrowLeft,
  Sun,
  Moon
} from 'lucide-react';

const FacultyLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

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
    { name: 'Faculty Dashboard', path: '/faculty/dashboard', icon: LayoutDashboard },
    { name: 'Assigned Tickets', path: '/faculty/grievances', icon: FolderLock }
  ];

  return (
    <div className="layout-container" style={{ display: 'flex', minHeight: '100vh' }}>
      
      {/* Sidebar */}
      <aside className="sidebar glass-panel" style={{ 
        width: '260px', 
        padding: '24px 16px', 
        margin: '16px', 
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'sticky',
        top: '16px',
        height: 'calc(100vh - 32px)'
      }}>
        <div>
          {/* Logo / Branding */}
          <div className="branding" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            marginBottom: '40px',
            paddingLeft: '8px'
          }}>
            <ShieldAlert size={32} style={{ color: 'var(--accent-purple)' }} />
            <div>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'Outfit', fontWeight: 'bold' }}>CGS Portal</h3>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Faculty Division</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    background: isActive ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                    color: isActive ? 'var(--accent-purple)' : 'var(--text-secondary)',
                    borderLeft: isActive ? '3px solid var(--accent-purple)' : '3px solid transparent',
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
        <div className="user-widget" style={{ 
          borderTop: '1px solid var(--border)', 
          paddingTop: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'var(--accent-purple)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              fontWeight: 'bold',
              color: '#fff'
            }}>
              <UserCheck size={20} />
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: '0.85rem', fontWeight: '600', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {user?.name || 'Faculty Member'}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {user?.department?.departmentName || 'Dept Officer'}
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
      <main className="main-content" style={{ flex: 1, padding: '32px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Top Navbar with Back & Theme options */}
        <div className="top-nav-bar" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border)'
        }}>
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

export default FacultyLayout;
