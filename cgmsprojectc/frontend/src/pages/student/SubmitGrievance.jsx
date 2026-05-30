import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  PlusCircle, 
  Paperclip, 
  AlertCircle, 
  Sparkles, 
  Check, 
  X,
  FileCheck,
  Loader2
} from 'lucide-react';

const SubmitGrievance = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    category: '',
    subject: '',
    description: '',
    departmentId: '',
    priority: 'Medium',
    aiSummary: ''
  });

  const [departments, setDepartments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // AI states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [showAiCard, setShowAiCard] = useState(false);

  const categories = [
    'Attendance Issues',
    'Examination Issues',
    'Marks / Re-evaluation',
    'Fee Related Issues',
    'Scholarship Issues',
    'Hostel Complaints',
    'Library Complaints',
    'Infrastructure Problems',
    'Faculty Related Issues',
    'Technical / Lab Issues',
    'Other'
  ];

  // Fetch departments list
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get('/departments');
        setDepartments(res.data);
      } catch (err) {
        console.error('Error fetching departments:', err.message);
      }
    };
    fetchDepartments();
  }, []);

  // Trigger AI Analysis
  const handleAiAnalyze = async () => {
    if (!formData.description || formData.description.trim().length < 20) {
      return setError('Please enter a description (at least 20 characters) for the AI to analyze.');
    }
    setError('');
    setAiLoading(true);
    setAiResult(null);

    try {
      const res = await api.post('/grievances/analyze', { description: formData.description });
      setAiResult(res.data);
      setShowAiCard(true);
    } catch (err) {
      setError(err.response?.data?.message || 'AI analysis failed. You can fill out fields manually.');
    } finally {
      setAiLoading(false);
    }
  };

  const applyAiSuggestions = () => {
    if (!aiResult) return;

    setFormData(prev => ({
      ...prev,
      category: aiResult.category,
      priority: aiResult.priority,
      departmentId: aiResult.departmentId || prev.departmentId,
      aiSummary: aiResult.summary
    }));

    setShowAiCard(false);
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // File validation: count limit
    if (files.length + attachments.length > 5) {
      return setError('You can attach a maximum of 5 files per grievance.');
    }

    // File validation: type & size
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    for (let file of files) {
      if (!allowedTypes.includes(file.type)) {
        return setError(`File "${file.name}" has an invalid type. Only PDF, JPG, JPEG, and PNG are allowed.`);
      }
      if (file.size > maxSize) {
        return setError(`File "${file.name}" exceeds the 10MB size limit.`);
      }
    }

    setError('');
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.category || !formData.subject || !formData.description || !formData.departmentId) {
      return setError('Please fill in all required fields.');
    }

    setLoading(true);

    try {
      // Use FormData for file uploading multipart content
      const submitData = new FormData();
      submitData.append('category', formData.category);
      submitData.append('subject', formData.subject);
      submitData.append('description', formData.description);
      submitData.append('departmentId', formData.departmentId);
      submitData.append('priority', formData.priority);
      submitData.append('aiSummary', formData.aiSummary);

      attachments.forEach((file) => {
        submitData.append('attachments', file);
      });

      await api.post('/grievances', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/student/grievances');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting grievance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }} className="animate-fade-in">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2rem', fontFamily: 'Outfit', fontWeight: 'bold' }}>Submit a Grievance</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Create a ticket to report an issue. You can optionally use our AI tool to categorize it.
        </p>
      </div>

      {success && (
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
          <FileCheck size={20} />
          Grievance submitted successfully! Redirecting to history...
        </div>
      )}

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
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: showAiCard ? '1.5fr 1fr' : '1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Main Grievance Form */}
        <div className="glass-panel" style={{ padding: '32px', borderRadius: 'var(--radius-lg)' }}>
          <form onSubmit={handleSubmit}>
            
            <div className="form-group">
              <label className="form-label">Subject / Title</label>
              <input
                type="text"
                placeholder="e.g. WiFi connection drops in Block B room 203"
                className="form-control"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="form-label" style={{ margin: 0 }}>Detailed Description</label>
                <button
                  type="button"
                  onClick={handleAiAnalyze}
                  disabled={aiLoading}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--primary)',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  {aiLoading ? 'Analyzing...' : 'AI Analyze description'}
                </button>
              </div>
              <textarea
                placeholder="Please describe your grievance in detail. Mention dates, locations, and any previous attempts to resolve it."
                className="form-control"
                rows="6"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              ></textarea>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-control"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Assign Department</label>
                <select
                  className="form-control"
                  required
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept._id}>{dept.departmentName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Priority Level</label>
              <div style={{ display: 'flex', gap: '16px' }}>
                {['Low', 'Medium', 'High'].map(p => (
                  <label key={p} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input
                      type="radio"
                      name="priority"
                      checked={formData.priority === p}
                      onChange={() => setFormData({ ...formData, priority: p })}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    {p}
                  </label>
                ))}
              </div>
            </div>

            {/* Document Attachments */}
            <div className="form-group" style={{ marginBottom: '32px' }}>
              <label className="form-label">Supporting Attachments (PDF, JPG, PNG — Max 10MB each)</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label className="btn-secondary" style={{ width: 'fit-content', cursor: 'pointer', padding: '8px 16px', fontSize: '0.85rem' }}>
                  <Paperclip size={16} />
                  Choose Files
                  <input
                    type="file"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </label>

                {/* Selected Files List */}
                {attachments.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {attachments.map((file, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem'
                      }}>
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '300px' }}>
                          {file.name}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                          <button
                            type="button"
                            onClick={() => removeAttachment(idx)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer' }}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
            >
              <PlusCircle size={18} />
              {loading ? 'Submitting ticket...' : 'Submit Grievance'}
            </button>
          </form>
        </div>

        {/* AI Suggestion Panel (renders on the side) */}
        {showAiCard && aiResult && (
          <div className="glass-panel" style={{
            padding: '24px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
            boxShadow: '0 8px 32px 0 rgba(99, 102, 241, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                <Sparkles size={18} />
                <h4 style={{ fontFamily: 'Outfit', fontWeight: 'bold' }}>AI Recommendations</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowAiCard(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '16px' }}>
              We analyzed your complaint description and suggest applying these settings:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem', marginBottom: '20px' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>SUGGESTED CATEGORY</span>
                <span style={{ fontWeight: '500' }}>{aiResult.category}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>SUGGESTED DEPARTMENT</span>
                <span style={{ fontWeight: '500' }}>{aiResult.suggestedDepartment}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>PRIORITY LEVEL</span>
                <span style={{ fontWeight: '500', color: aiResult.priority === 'High' ? 'var(--accent-rose)' : 'inherit' }}>
                  {aiResult.priority}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>AI TICKET SUMMARY</span>
                <span style={{ color: 'var(--text-primary)', fontStyle: 'italic' }}>"{aiResult.summary}"</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={applyAiSuggestions}
                className="btn-primary"
                style={{ flex: 1, fontSize: '0.8rem', padding: '8px', justifyContent: 'center' }}
              >
                <Check size={14} />
                Accept & Apply
              </button>
              <button
                type="button"
                onClick={() => setShowAiCard(false)}
                className="btn-secondary"
                style={{ flex: 1, fontSize: '0.8rem', padding: '8px', justifyContent: 'center' }}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SubmitGrievance;
