import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Users, ShieldAlert, FileSearch, Sun, Moon, Menu, X } from 'lucide-react';

const About = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
      {/* Header Navbar */}
      <header className="public-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GraduationCap size={36} style={{ color: 'var(--primary)' }} />
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.5rem', fontWeight: 'bold' }}>CGS Portal</h2>
        </div>
        
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)} 
          className="public-menu-btn"
          title="Toggle Navigation Menu"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <nav className={`public-nav ${isMenuOpen ? 'open' : ''}`}>
          <Link to="/" onClick={() => setIsMenuOpen(false)} style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Home</Link>
          <Link to="/about" onClick={() => setIsMenuOpen(false)} style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>About</Link>
          <Link to="/contact" onClick={() => setIsMenuOpen(false)} style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Contact</Link>
          <button 
            onClick={() => {
              toggleTheme();
              setIsMenuOpen(false);
            }} 
            className="btn-secondary" 
            style={{ 
              padding: '8px 12px', 
              fontSize: '0.85rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <Link to="/login" onClick={() => setIsMenuOpen(false)} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>Login</Link>
          <Link to="/register" onClick={() => setIsMenuOpen(false)} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>Register</Link>
        </nav>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '800px', margin: '40px auto 80px auto' }} className="animate-fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <GraduationCap size={40} style={{ color: 'var(--primary)' }} />
          <h1 style={{ fontFamily: 'Outfit', fontSize: '2.5rem', fontWeight: 'bold' }}>About CGS</h1>
        </div>

        <div className="glass-panel" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', marginBottom: '30px', lineHeight: '1.7' }}>
          <p style={{ marginBottom: '20px', fontSize: '1.05rem', color: 'var(--text-primary)' }}>
            The College Grievance Management System (CGS) is an institutional platform designed to address complaints, disputes, and service failures across our campus infrastructure.
          </p>
          <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
            CGS acts as a bridge. By automating the registration workflow, assigning tickets to the relevant academic or facility department head, and providing transparent progress tracking, we ensure every voice is heard and every issue is resolved efficiently.
          </p>

          <h3 style={{ fontFamily: 'Outfit', fontSize: '1.4rem', margin: '30px 0 16px 0', color: 'var(--primary)' }}>Key Workflow Milestones</h3>
          <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--text-secondary)' }}>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>Grievance Logging:</strong> Students describe their issue, select a category, upload up to 5 documents (up to 10MB each), and confirm the AI categorization recommendation.
            </li>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>Auto-Assignment:</strong> Tickets are registered with a secure ticket ID and assigned to department heads (e.g. Finance, Academic Affairs, Hostel Warden).
            </li>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>Status Management:</strong> The assigned department logs responses and updates status tags (Pending ➔ Under Review ➔ In Progress ➔ Resolved).
            </li>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>Student Feedback:</strong> Upon resolving, students review comments, rate the service (1-5 stars), and submit feedback, closing the ticket.
            </li>
          </ol>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
            <Users size={24} style={{ color: 'var(--accent-purple)', marginBottom: '12px' }} />
            <h4 style={{ fontFamily: 'Outfit', marginBottom: '8px' }}>Student Rights</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Every student has the right to submit complaints without bias or academic penalty.</p>
          </div>
          <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
            <ShieldAlert size={24} style={{ color: 'var(--accent-emerald)', marginBottom: '12px' }} />
            <h4 style={{ fontFamily: 'Outfit', marginBottom: '8px' }}>Security & Privacy</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>All submissions are protected by JWT encryption and accessible only by authorized personnel.</p>
          </div>
          <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
            <FileSearch size={24} style={{ color: 'var(--accent-amber)', marginBottom: '12px' }} />
            <h4 style={{ fontFamily: 'Outfit', marginBottom: '8px' }}>Auditing</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Every action, assign, or status shift is recorded in the timeline history for audit compliance.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ 
        borderTop: '1px solid var(--border)', 
        padding: '30px 0', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        fontSize: '0.85rem',
        color: 'var(--text-muted)'
      }}>
        <p>&copy; 2026 College Grievance Management System (CGS). All Rights Reserved. Credits: Abhishek</p>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact Support</Link>
        </div>
      </footer>
    </div>
  );
};

export default About;
