import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  ArrowLeft,
  Clock, 
  MessageSquare, 
  Send, 
  FileText,
  AlertTriangle,
  FolderOpen,
  ChevronDown,
  Edit
} from 'lucide-react';

const ResponsePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ticketIdParam = searchParams.get('ticketId') || '';

  const [grievance, setGrievance] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  
  // Status change states
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (ticketIdParam) {
      fetchTicketDetails(ticketIdParam);
    } else {
      setLoading(false);
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
        if (res.data.status !== grievance.status) {
          setGrievance(res.data);
          setNewStatus(res.data.status);
        }
      } catch (err) {
        console.error('Error polling updates for officer:', err.message);
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [grievance, comments]);

  const fetchTicketDetails = async (tId) => {
    setError('');
    setLoading(true);

    try {
      const res = await api.get(`/grievances/ticket/${tId}`);
      const gObj = res.data;
      setGrievance(gObj);
      setNewStatus(gObj.status);

      // Fetch comments stream
      const commentRes = await api.get(`/responses/${gObj._id}`);
      setComments(commentRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Grievance ticket not found.');
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

      setComments(prev => [...prev, res.data]);
      setNewComment('');
    } catch (err) {
      setError('Could not post response comment.');
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!grievance || !newStatus) return;
    
    setError('');
    setSuccessMsg('');
    setStatusLoading(true);

    try {
      const res = await api.put(`/grievances/${grievance._id}/status`, {
        status: newStatus,
        note: statusNote || 'Status changed by department officer.'
      });

      setGrievance(prev => ({ ...prev, status: res.data.status }));
      setSuccessMsg(`Status successfully updated to ${newStatus}!`);
      setStatusNote('');

      // Reload comment timeline
      const commentRes = await api.get(`/responses/${grievance._id}`);
      setComments(commentRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update ticket status.');
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '850px', margin: '0 auto' }}>
      
      {/* Return Link */}
      <Link to="/faculty/grievances" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--accent-purple)', marginBottom: '24px', fontSize: '0.9rem' }}>
        <ArrowLeft size={16} />
        Back to Assigned Cases
      </Link>

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

      {successMsg && (
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
          {successMsg}
        </div>
      )}

      {loading && (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading ticket details...</p>
      )}

      {grievance && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Main Info Card */}
          <div className="glass-panel" style={{ padding: '32px', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--accent-purple)', fontWeight: 'bold' }}>
                  {grievance.ticketId}
                </span>
                <h2 style={{ fontSize: '1.5rem', fontFamily: 'Outfit', fontWeight: 'bold', marginTop: '6px', color: '#fff' }}>
                  {grievance.subject}
                </h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Category: {grievance.category} &bull; Priority: {grievance.priority}
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
                <strong style={{ color: 'var(--accent-purple)' }}>🤖 AI Generated Summary: </strong>
                <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{grievance.aiSummary}"</span>
              </div>
            )}

            {/* Student metadata widget */}
            <div style={{
              marginTop: '20px',
              padding: '16px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255,255,255,0.01)',
              border: '1px solid var(--border)',
              fontSize: '0.85rem',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px'
            }}>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Student Name: </span>
                <strong style={{ color: '#fff' }}>{grievance.studentId?.name}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Roll Number: </span>
                <strong style={{ color: '#fff' }}>{grievance.studentId?.rollNumber}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Email: </span>
                <strong style={{ color: '#fff' }}>{grievance.studentId?.email}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Student Course & Branch: </span>
                <strong style={{ color: '#fff' }}>{grievance.studentId?.course} ({grievance.studentId?.department})</strong>
              </div>
            </div>

            {/* Document Attachments */}
            {grievance.attachments && grievance.attachments.length > 0 && (
              <div style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                  ATTACHED FILES:
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

          {/* Action Box: Update status */}
          {grievance.status !== 'Closed' && grievance.status !== 'Rejected' && (
            <div className="glass-panel" style={{ padding: '30px', borderRadius: 'var(--radius-lg)', borderLeft: '4px solid var(--accent-purple)' }}>
              <h3 style={{ fontFamily: 'Outfit', fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit size={18} />
                Update Ticket Status
              </h3>

              <form onSubmit={handleUpdateStatus} style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr auto', gap: '16px', alignItems: 'end' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">New Status</label>
                  <select
                    className="form-control"
                    required
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="Under Review">Under Review</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Log Note / Action Message</label>
                  <input
                    type="text"
                    placeholder="Describe actions taken (e.g. WiFi router replaced)..."
                    className="form-control"
                    required
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                  />
                </div>

                <button type="submit" disabled={statusLoading} className="btn-primary" style={{ padding: '12px 24px', background: 'var(--accent-purple)', boxShadow: '0 4px 12px rgba(139,92,246,0.2)' }}>
                  {statusLoading ? 'Updating...' : 'Update Status'}
                </button>
              </form>
            </div>
          )}

          {/* Timeline Conversations feed */}
          <div className="glass-panel" style={{ padding: '30px', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.15rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={18} />
              Grievance Timeline Conversation logs
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '400px', overflowY: 'auto', paddingRight: '8px', marginBottom: '24px' }}>
              {comments.map((comment) => {
                const isStudent = comment.responderRole === 'Student';
                return (
                  <div key={comment._id} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignSelf: isStudent ? 'flex-start' : 'flex-end',
                    maxWidth: '80%',
                    background: isStudent ? 'rgba(255, 255, 255, 0.02)' : 'rgba(139, 92, 246, 0.04)',
                    border: isStudent ? '1px solid var(--border)' : '1px solid rgba(139, 92, 246, 0.15)',
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

            {/* Conversation reply */}
            {grievance.status !== 'Closed' && grievance.status !== 'Rejected' && (
              <form onSubmit={handlePostComment} style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                <input
                  type="text"
                  placeholder="Post comment to student..."
                  className="form-control"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button type="submit" className="btn-primary" style={{ padding: '0 20px', background: 'var(--accent-purple)', flexShrink: 0 }}>
                  <Send size={16} />
                  Send Reply
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
          <h3 style={{ fontFamily: 'Outfit', marginBottom: '8px' }}>Select Grievance Case</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Choose a grievance from the list to update its status or post message threads.
          </p>
        </div>
      )}

    </div>
  );
};

export default ResponsePage;
