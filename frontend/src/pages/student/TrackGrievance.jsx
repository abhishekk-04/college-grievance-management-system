import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  Search, 
  Clock, 
  MessageSquare, 
  User, 
  Send, 
  Star,
  FileText,
  AlertTriangle,
  FolderOpen,
  ArrowRight
} from 'lucide-react';

const TrackGrievance = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const ticketIdParam = searchParams.get('ticketId') || '';

  const [searchQuery, setSearchQuery] = useState(ticketIdParam);
  const [grievance, setGrievance] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Feedback states
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Load ticket automatically if query param present
  useEffect(() => {
    if (ticketIdParam) {
      handleTrackTicket(ticketIdParam);
    }
  }, [ticketIdParam]);

  // Polling for real-time comments and status updates in background
  useEffect(() => {
    if (!grievance) return;
    if (grievance.status === 'Closed' || grievance.status === 'Rejected') return;

    const pollInterval = setInterval(async () => {
      try {
        const commentRes = await api.get(`/responses/${grievance._id}`);
        if (JSON.stringify(commentRes.data) !== JSON.stringify(comments)) {
          setComments(commentRes.data);
        }

        const res = await api.get(`/grievances/ticket/${grievance.ticketId}`);
        if (res.data.status !== grievance.status || res.data.assignedTo?._id !== grievance.assignedTo?._id) {
          setGrievance(res.data);
        }
      } catch (err) {
        console.error('Error polling grievance updates:', err.message);
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [grievance, comments]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() === '') return;
    setSearchParams({ ticketId: searchQuery.trim() });
  };

  const handleTrackTicket = async (tId) => {
    setError('');
    setLoading(true);
    setGrievance(null);
    setComments([]);

    try {
      const res = await api.get(`/grievances/ticket/${tId}`);
      const gObj = res.data;
      setGrievance(gObj);

      // Fetch comment timeline
      const commentRes = await api.get(`/responses/${gObj._id}`);
      setComments(commentRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Ticket not found. Verify the Ticket ID format (e.g. CGS-2026-0001).');
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (newComment.trim() === '' || !grievance) return;

    try {
      const res = await api.post('/responses', {
        grievanceId: grievance._id,
        message: newComment
      });

      // Append new response to stream locally
      setComments(prev => [...prev, res.data]);
      setNewComment('');
    } catch (err) {
      setError('Could not post response comment.');
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!grievance) return;

    try {
      await api.post('/feedback', {
        grievanceId: grievance._id,
        rating,
        comment: feedbackComment
      });

      setFeedbackSuccess(true);
      // Reload grievance details to show closed status
      handleTrackTicket(grievance.ticketId);
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting feedback.');
    }
  };

  // Status mapping index for progress bar
  const statuses = ['Pending', 'Under Review', 'In Progress', 'Resolved', 'Closed'];
  const currentStatusIdx = grievance ? statuses.indexOf(grievance.status) : -1;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '850px', margin: '0 auto' }}>
      
      {/* Page Title */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2rem', fontFamily: 'Outfit', fontWeight: 'bold' }}>Track Grievance</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Enter a Ticket ID to track the real-time resolution timeline and communicate with officers.
        </p>
      </div>

      {/* Ticket ID search form */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)', marginBottom: '32px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Enter Ticket ID (e.g. CGS-2026-0001)"
              className="form-control"
              style={{ paddingLeft: '36px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary" style={{ padding: '0 24px' }}>
            Track Ticket
          </button>
        </form>
      </div>

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
          <AlertTriangle size={20} />
          {error}
        </div>
      )}

      {loading && (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>Retrieving ticket records...</p>
      )}

      {/* Grievance Details & Timeline */}
      {grievance && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Header Card */}
          <div className="glass-panel" style={{ padding: '32px', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                  {grievance.ticketId}
                </span>
                <h2 style={{ fontSize: '1.5rem', fontFamily: 'Outfit', fontWeight: 'bold', marginTop: '6px', color: '#fff' }}>
                  {grievance.subject}
                </h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Category: {grievance.category} &bull; Assigned Department: {grievance.department?.departmentName}
                </p>
              </div>
              <span className={`status-badge ${
                grievance.status === 'Pending' ? 'status-pending' :
                grievance.status === 'Under Review' ? 'status-review' :
                grievance.status === 'In Progress' ? 'status-progress' :
                grievance.status === 'Resolved' ? 'status-resolved' :
                grievance.status === 'Closed' ? 'status-closed' : 'status-rejected'
              }`}>
                {grievance.status}
              </span>
            </div>

            <p style={{ marginTop: '20px', fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-primary)', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              {grievance.description}
            </p>

            {/* AI Summary Banner */}
            {grievance.aiSummary && (
              <div style={{
                marginTop: '16px',
                background: 'rgba(99, 102, 241, 0.05)',
                border: '1px solid rgba(99, 102, 241, 0.15)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 16px',
                fontSize: '0.85rem'
              }}>
                <strong style={{ color: 'var(--primary)' }}>🤖 AI Generated Summary: </strong>
                <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{grievance.aiSummary}"</span>
              </div>
            )}

            {/* Attachments list */}
            {grievance.attachments && grievance.attachments.length > 0 && (
              <div style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                  ATTACHED DOCUMENTS:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {grievance.attachments.map((fileUrl, index) => {
                    const cleanUrl = fileUrl.startsWith('http') 
                      ? fileUrl 
                      : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${fileUrl}`;
                    const rawName = fileUrl.startsWith('http') 
                      ? fileUrl.substring(fileUrl.lastIndexOf('/') + 1)
                      : fileUrl;
                    const filename = rawName.split('-').slice(2).join('-') || 'Attachment';
                    return (
                      <a 
                        key={index}
                        href={cleanUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="btn-secondary" 
                        style={{ padding: '6px 12px', fontSize: '0.75rem', gap: '6px' }}
                      >
                        <FileText size={12} />
                        {filename}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Timeline Visual Status Tracker */}
          {grievance.status !== 'Rejected' && (
            <div className="glass-panel" style={{ padding: '30px', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontFamily: 'Outfit', fontSize: '1.15rem', marginBottom: '24px' }}>Resolution Path</h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', padding: '0 10px' }}>
                {/* Horizontal Progress line */}
                <div style={{
                  position: 'absolute',
                  top: '14px',
                  left: '10px',
                  right: '10px',
                  height: '4px',
                  background: 'rgba(255,255,255,0.05)',
                  zIndex: 1
                }}></div>
                
                {/* Glowing Active Progress line */}
                <div style={{
                  position: 'absolute',
                  top: '14px',
                  left: '10px',
                  width: `${(currentStatusIdx / (statuses.length - 1)) * 100}%`,
                  height: '4px',
                  background: 'var(--primary)',
                  zIndex: 1,
                  transition: 'width 0.4s ease'
                }}></div>

                {statuses.map((step, idx) => {
                  const isActive = idx <= currentStatusIdx;
                  const isCurrent = idx === currentStatusIdx;
                  return (
                    <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, position: 'relative' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: isActive ? 'var(--primary)' : 'var(--bg-secondary)',
                        border: isActive ? '2px solid var(--primary)' : '2px solid var(--border)',
                        boxShadow: isCurrent ? '0 0 12px var(--primary)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        color: isActive ? '#fff' : 'var(--text-secondary)',
                        transition: 'var(--transition)'
                      }}>
                        {idx + 1}
                      </div>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: isCurrent ? 'bold' : '500',
                        color: isCurrent ? 'var(--primary)' : isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                        marginTop: '8px',
                        textAlign: 'center'
                      }}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Feedback Form (shown if Resolved) */}
          {grievance.status === 'Resolved' && !feedbackSuccess && (
            <div className="glass-panel" style={{
              padding: '30px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%)',
              boxShadow: '0 8px 32px 0 rgba(16, 185, 129, 0.1)'
            }}>
              <h3 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', marginBottom: '8px', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Star size={20} />
                Submit Resolution Feedback
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
                This grievance has been marked as resolved. Please provide a rating and close this ticket.
              </p>

              <form onSubmit={handleFeedbackSubmit}>
                {/* Star rating selector */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      <Star
                        size={32}
                        fill={(hoverRating || rating) >= star ? 'var(--accent-amber)' : 'none'}
                        stroke={(hoverRating || rating) >= star ? 'var(--accent-amber)' : 'var(--text-muted)'}
                        style={{ transition: 'all 0.1s ease' }}
                      />
                    </button>
                  ))}
                  <span style={{ fontSize: '1.15rem', fontWeight: 'bold', marginLeft: '12px', alignSelf: 'center', color: 'var(--accent-amber)' }}>
                    {rating} / 5 Stars
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">Review / Experience Comments</label>
                  <textarea
                    placeholder="Provide details about the response and help us improve campus support..."
                    className="form-control"
                    rows="3"
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                  ></textarea>
                </div>

                <button type="submit" className="btn-primary" style={{ background: 'var(--accent-emerald)', boxShadow: '0 4px 12px rgba(16,185,129,0.2)' }}>
                  Submit Rating & Close Ticket
                </button>
              </form>
            </div>
          )}

          {/* Conversation Responses Feed */}
          <div className="glass-panel" style={{ padding: '30px', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.15rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={18} />
              Grievance Timeline & Activity logs
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '400px', overflowY: 'auto', paddingRight: '8px', marginBottom: '24px' }}>
              {comments.map((comment) => {
                const isStudent = comment.responderRole === 'Student';
                return (
                  <div key={comment._id} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignSelf: isStudent ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    background: isStudent ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.02)',
                    border: isStudent ? '1px solid rgba(99,102,241,0.15)' : '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: isStudent ? 'var(--primary)' : 'var(--accent-purple)' }}>
                        {comment.responderName} ({comment.responderRole})
                      </span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        {new Date(comment.timestamp).toLocaleDateString()} &bull; {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', lineHeight: '1.4', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                      {comment.message}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Post new message form (allowed if ticket is not Closed or Rejected) */}
            {grievance.status !== 'Closed' && grievance.status !== 'Rejected' && (
              <form onSubmit={handlePostComment} style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                <input
                  type="text"
                  placeholder="Post a reply or question about this ticket..."
                  className="form-control"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button type="submit" className="btn-primary" style={{ padding: '0 20px', flexShrink: 0 }}>
                  <Send size={16} />
                  Send
                </button>
              </form>
            )}
          </div>

        </div>
      )}

      {/* Tracker search fallback if no ticket loaded */}
      {!grievance && !loading && (
        <div className="glass-panel" style={{ padding: '60px 40px', textAlign: 'center', borderRadius: 'var(--radius-lg)', marginTop: '24px' }}>
          <FolderOpen size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
          <h3 style={{ fontFamily: 'Outfit', marginBottom: '8px' }}>No Active Ticket Selected</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
            Select a ticket from <Link to="/student/grievances" style={{ color: 'var(--primary)' }}>My Grievance history</Link> or insert a valid CGS format code above to begin.
          </p>
        </div>
      )}

    </div>
  );
};

export default TrackGrievance;
