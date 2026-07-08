import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Mail, Phone, MapPin, Send, Sun, Moon, Menu, X } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
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
          <Link to="/about" onClick={() => setIsMenuOpen(false)} style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>About</Link>
          <Link to="/contact" onClick={() => setIsMenuOpen(false)} style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Contact</Link>
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
      <main style={{ maxWidth: '900px', margin: '40px auto 80px auto' }} className="animate-fade-in">
        <h1 style={{ fontFamily: 'Outfit', fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '8px' }}>Contact Administration</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>If you are unable to access the CGS portal or have systemic errors, reach out to our IT support.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
          
          {/* Contact Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <Mail size={24} style={{ color: 'var(--primary)', marginTop: '4px' }} />
              <div>
                <h4 style={{ fontFamily: 'Outfit', marginBottom: '4px' }}>Email Support</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>support.cgs@college.edu</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Response within 24 hours</p>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <Phone size={24} style={{ color: 'var(--accent-emerald)', marginTop: '4px' }} />
              <div>
                <h4 style={{ fontFamily: 'Outfit', marginBottom: '4px' }}>IT Helpdesk Line</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>+1 (555) 019-2831</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mon-Fri, 9:00 AM - 5:00 PM</p>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <MapPin size={24} style={{ color: 'var(--accent-amber)', marginTop: '4px' }} />
              <div>
                <h4 style={{ fontFamily: 'Outfit', marginBottom: '4px' }}>Office Location</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Administrative Block, 2nd Floor</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Main Campus, Sector 4</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="glass-panel" style={{ padding: '32px', borderRadius: 'var(--radius-lg)' }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✉️</div>
                <h3 style={{ fontFamily: 'Outfit', marginBottom: '8px' }}>Message Sent!</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Thank you. Our administration helpdesk will contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h3 style={{ fontFamily: 'Outfit', marginBottom: '20px', fontSize: '1.25rem' }}>Send a Quick Inquiry</h3>
                
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
                  <label className="form-label">College Email</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    required 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Message Description</label>
                  <textarea 
                    className="form-control" 
                    rows="4" 
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  ></textarea>
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  <Send size={16} />
                  Submit Inquiry
                </button>
              </form>
            )}
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

export default Contact;
