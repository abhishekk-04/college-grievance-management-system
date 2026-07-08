import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  ArrowRight, 
  ShieldCheck, 
  Bot, 
  Clock, 
  BarChart3,
  GraduationCap,
  Sun,
  Moon,
  Star,
  Menu,
  X
} from 'lucide-react';

const Home = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    totalRegistered: 0,
    totalResolved: 0,
    averageResolutionTime: 24
  });
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const statsRes = await api.get('/public/stats');
        setStats(statsRes.data);
        
        const reviewsRes = await api.get('/public/reviews');
        setReviews(reviewsRes.data);
      } catch (err) {
        console.error('Error loading public homepage stats/reviews:', err.message);
      }
    };
    fetchPublicData();
  }, []);

  const [activeIdx, setActiveIdx] = useState(0);
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const getBaseList = () => {
    if (reviews.length === 0) return [];
    let list = [...reviews];
    while (list.length < 6) {
      list = [...list, ...reviews];
    }
    return list;
  };
  const baseList = getBaseList();
  const extendedReviews = [...baseList, ...baseList];

  useEffect(() => {
    if (reviews.length === 0 || isHovered) return;
    
    const interval = setInterval(() => {
      setIsTransitionEnabled(true);
      setActiveIdx(prev => prev + 1);
    }, 4500);

    return () => clearInterval(interval);
  }, [reviews, isHovered]);

  useEffect(() => {
    if (reviews.length === 0) return;

    if (activeIdx === baseList.length) {
      const timeout = setTimeout(() => {
        setIsTransitionEnabled(false);
        setActiveIdx(0);
      }, 600);
      
      return () => clearTimeout(timeout);
    }
  }, [activeIdx, baseList.length, reviews.length]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const categories = [
    { name: 'Attendance Issues', emoji: '📝' },
    { name: 'Examination Issues', emoji: '📄' },
    { name: 'Marks/Re-evaluation', emoji: '📊' },
    { name: 'Fee Related', emoji: '💰' },
    { name: 'Scholarship', emoji: '🎓' },
    { name: 'Hostel Complaints', emoji: '🏠' },
    { name: 'Library Complaints', emoji: '📚' },
    { name: 'Infrastructure', emoji: '🚧' },
    { name: 'Faculty Related', emoji: '👩‍🏫' },
    { name: 'Technical/Lab', emoji: '💻' },
    { name: 'Other', emoji: '📌' }
  ];

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
          <Link to="/" onClick={() => setIsMenuOpen(false)} style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Home</Link>
          <Link to="/about" onClick={() => setIsMenuOpen(false)} style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>About</Link>
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

      <section style={{ padding: '40px 0 20px 0', textAlign: 'center' }}>
        <h2 style={{ 
          fontFamily: 'Outfit', 
          fontSize: '2rem', 
          fontWeight: '700', 
          marginBottom: '10px' 
        }}>
          Grievance Categories
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '32px' }}>
          11 categories to ensure complaints reach the correct department
        </p>
        
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '14px', 
          justifyContent: 'center',
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          {categories.map((cat) => (
            <div 
              key={cat.name} 
              className="glass-panel" 
              style={{ 
                padding: '10px 20px', 
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'var(--transition)'
              }}
            >
              <span>{cat.emoji}</span>
              <span>{cat.name}</span>
            </div>
          ))}
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
        margin: '40px 0 60px 0'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px' }}>
          <div>
            <h3 style={{ fontSize: '2.5rem', fontFamily: 'Outfit', color: 'var(--primary)', fontWeight: 'bold' }}>
              {stats.totalRegistered}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Total Issues Registered</p>
          </div>
          <div>
            <h3 style={{ fontSize: '2.5rem', fontFamily: 'Outfit', color: 'var(--accent-emerald)', fontWeight: 'bold' }}>
              {stats.totalResolved}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Issues Resolved</p>
          </div>
          <div>
            <h3 style={{ fontSize: '2.5rem', fontFamily: 'Outfit', color: 'var(--accent-amber)', fontWeight: 'bold' }}>
              {stats.averageResolutionTime}h
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Average Resolution Time</p>
          </div>
        </div>
      </section>

      {/* Student Reviews Scrolling Loop */}
      {reviews.length > 0 && (
        <section style={{ 
          padding: '60px 0', 
          textAlign: 'center',
          borderTop: '1px solid var(--border)',
          marginTop: '20px'
        }}>
          <h2 style={{ 
            fontFamily: 'Outfit', 
            fontSize: '2rem', 
            fontWeight: '700', 
            marginBottom: '10px'
          }}>
            Student Voices
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '40px' }}>
            Real feedback from solved grievance cases
          </p>

          <div 
            className="reviews-slider-container"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={() => setIsHovered(true)}
            onTouchEnd={() => setIsHovered(false)}
          >
            <div 
              className="reviews-slider-track"
              style={{
                transform: `translateX(calc(-1 * ${activeIdx} * (var(--card-width) + 24px)))`,
                transition: isTransitionEnabled ? 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
              }}
            >
              {extendedReviews.map((rev, idx) => (
                <div 
                  key={`${rev._id || idx}-${idx}`}
                  className="glass-panel reviews-slider-card"
                  style={{
                    padding: '36px',
                    borderRadius: 'var(--radius-lg)',
                    position: 'relative',
                    boxShadow: 'var(--glass-shadow)',
                    border: '1px solid var(--border)',
                    textAlign: 'center',
                    minHeight: '220px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  {/* Giant Quotation Mark Decors */}
                  <span style={{ 
                    position: 'absolute', 
                    top: '10px', 
                    left: '20px', 
                    fontSize: '4rem', 
                    fontFamily: 'Outfit', 
                    color: 'rgba(99, 102, 241, 0.08)', 
                    lineHeight: 1, 
                    userSelect: 'none' 
                  }}>
                    “
                  </span>

                  {/* Star Rating display */}
                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginBottom: '12px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        size={16} 
                        fill={rev.rating >= star ? 'var(--accent-amber)' : 'none'} 
                        stroke={rev.rating >= star ? 'var(--accent-amber)' : 'var(--text-muted)'} 
                      />
                    ))}
                  </div>

                  {/* Comment text */}
                  <p style={{ 
                    fontSize: '0.95rem', 
                    lineHeight: '1.5', 
                    color: 'var(--text-primary)', 
                    fontStyle: 'italic', 
                    marginBottom: '16px',
                    padding: '0 10px',
                    flex: 1
                  }}>
                    "{rev.comment || 'No comments provided'}"
                  </p>

                  {/* Credit Author */}
                  <h4 style={{ 
                    fontFamily: 'Outfit', 
                    fontSize: '0.9rem', 
                    color: 'var(--primary)', 
                    fontWeight: '600',
                    margin: 0
                  }}>
                    — {rev.studentName}
                  </h4>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Resolved Case Review
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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
