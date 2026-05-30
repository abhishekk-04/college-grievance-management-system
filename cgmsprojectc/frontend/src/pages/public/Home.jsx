import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  ShieldCheck, 
  Bot, 
  Clock, 
  BarChart3,
  GraduationCap,
  Sun,
  Moon
} from 'lucide-react';

const Home = () => {
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

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
      
      {/* Header Navbar */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '24px 0',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GraduationCap size={36} style={{ color: 'var(--primary)' }} />
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.5rem', fontWeight: 'bold' }}>CGS Portal</h2>
        </div>
        <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <Link to="/" style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Home</Link>
          <Link to="/about" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>About</Link>
          <Link to="/contact" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Contact</Link>
          <button 
            onClick={toggleTheme} 
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
          <Link to="/login" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>Login</Link>
          <Link to="/register" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>Register</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={{ 
        padding: '80px 0 60px 0', 
        textAlign: 'center',
        background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.08) 0%, transparent 70%)'
      }}>
        <div className="animate-fade-in">
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--primary-glow)',
            color: 'var(--primary)',
            padding: '6px 16px',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: '600',
            marginBottom: '24px',
            border: '1px solid rgba(99, 102, 241, 0.2)'
          }}>
            <Bot size={16} />
            AI-Enhanced Categorization & Smart Assignments
          </div>
          
          <h1 className="hero-title">
            College Grievance Management System
          </h1>
          
          <p style={{ 
            fontSize: '1.15rem', 
            color: 'var(--text-secondary)', 
            maxWidth: '650px', 
            margin: '0 auto 40px auto',
            lineHeight: '1.6'
          }}>
            Voice your concerns, track status resolutions in real-time, and experience a collaborative interface between students, faculty departments, and administration.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Link to="/register" className="btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
              Submit a Grievance
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-secondary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
              Department Portal Login
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section style={{ padding: '60px 0' }}>
        <h2 style={{ 
          fontFamily: 'Outfit', 
          fontSize: '2rem', 
          textAlign: 'center', 
          marginBottom: '40px',
          fontWeight: '700'
        }}>
          Engineered for Accountability & Speed
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '24px' 
        }}>
          
          {/* Card 1 */}
          <div className="glass-panel" style={{ padding: '32px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ 
              background: 'rgba(99, 102, 241, 0.1)', 
              width: '48px', 
              height: '48px', 
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              color: 'var(--primary)'
            }}>
              <Bot size={24} />
            </div>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', marginBottom: '12px' }}>AI Complaint Analyzer</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Automatically summarizes description text, predicts problem priority tags, and matches appropriate staff lines instantly to eliminate lag.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel" style={{ padding: '32px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ 
              background: 'rgba(16, 185, 129, 0.1)', 
              width: '48px', 
              height: '48px', 
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              color: 'var(--accent-emerald)'
            }}>
              <Clock size={24} />
            </div>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', marginBottom: '12px' }}>Real-time Audit Logs</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Track ticket phases (Pending ➔ Under Review ➔ Resolved) on interactive timelines with full comment streams.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel" style={{ padding: '32px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ 
              background: 'rgba(139, 92, 246, 0.1)', 
              width: '48px', 
              height: '48px', 
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              color: 'var(--accent-purple)'
            }}>
              <BarChart3 size={24} />
            </div>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', marginBottom: '12px' }}>Administrative Metrics</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Enables supervisors to review charts, export logs to CSV, handle department heads, and identify institutional bottlenecks.
            </p>
          </div>

        </div>
      </section>

      {/* Trust Metrics */}
      <section style={{ 
        padding: '40px', 
        borderRadius: 'var(--radius-lg)', 
        background: 'var(--bg-secondary)', 
        border: '1px solid var(--border)',
        textAlign: 'center',
        margin: '40px 0 80px 0'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px' }}>
          <div>
            <h3 style={{ fontSize: '2.5rem', fontFamily: 'Outfit', color: 'var(--primary)', fontWeight: 'bold' }}>24h</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Average Initial Response</p>
          </div>
          <div>
            <h3 style={{ fontSize: '2.5rem', fontFamily: 'Outfit', color: 'var(--accent-emerald)', fontWeight: 'bold' }}>98.4%</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Grievance Resolution Rate</p>
          </div>
          <div>
            <h3 style={{ fontSize: '2.5rem', fontFamily: 'Outfit', color: 'var(--accent-amber)', fontWeight: 'bold' }}>100%</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Accountability & Security</p>
          </div>
        </div>
      </section>

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

export default Home;
