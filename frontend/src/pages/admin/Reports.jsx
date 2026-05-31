import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { FileDown, Building2, Star, CheckCircle, Clock } from 'lucide-react';

const Reports = () => {
  const [deptReport, setDeptReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [csvLoading, setCsvLoading] = useState(false);

  useEffect(() => {
    fetchReportDetails();
  }, []);

  const fetchReportDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/department');
      setDeptReport(res.data);
    } catch (err) {
      setError('Could not load department summaries.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setCsvLoading(true);
    setError('');

    try {
      // Fetch CSV content using custom client instance
      const res = await api.get('/reports/export', {
        responseType: 'blob' // critical to handle raw csv blob downloads correctly
      });

      // Create browser-level download URL trigger
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `CGS_Grievance_Report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up DOM references
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Error exporting grievance logs.');
    } finally {
      setCsvLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      
      {/* Title block */}
      <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'Outfit', fontWeight: 'bold' }}>Reports & Analytics</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Review department performance metrics, resolution scorecards, and download CSV data.</p>
        </div>

        <button 
          onClick={handleExportCSV} 
          disabled={csvLoading}
          className="btn-primary"
          style={{ background: 'var(--accent-emerald)', boxShadow: '0 4px 12px rgba(16,185,129,0.2)' }}
        >
          <FileDown size={18} />
          {csvLoading ? 'Preparing Data...' : 'Export Grievance Registry (CSV)'}
        </button>
      </div>

      {error && (
        <div style={{ background: 'rgba(244,63,94,0.1)', color: 'var(--accent-rose)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '24px', border: '1px solid rgba(244,63,94,0.25)' }}>
          {error}
        </div>
      )}

      {/* Grid of Department Summaries */}
      <h3 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', marginBottom: '20px', color: '#fff' }}>
        Division Performance Scorecards
      </h3>

      {loading ? (
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px' }}>Compiling report scorecards...</p>
      ) : deptReport.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>No division records found.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginBottom: '40px' }}>
          {deptReport.map((dept) => (
            <div key={dept.id} className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)', display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', gap: '20px', alignItems: 'center' }}>
              
              {/* Dept branding */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: 'var(--primary)' }}>
                  <Building2 size={18} style={{ margin: 'auto' }} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontFamily: 'Outfit', fontWeight: 'bold', color: '#fff' }}>{dept.departmentName}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Head: {dept.departmentHead}</span>
                </div>
              </div>

              {/* Total Cases */}
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'bold', display: 'block' }}>TOTAL TICKETS</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fff', fontFamily: 'Outfit' }}>{dept.totalGrievances}</span>
              </div>

              {/* Pending Review */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} style={{ color: 'var(--accent-amber)' }} />
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'bold', display: 'block' }}>PENDING</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--accent-amber)', fontFamily: 'Outfit' }}>{dept.pendingGrievances}</span>
                </div>
              </div>

              {/* Resolved / Closed */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={16} style={{ color: 'var(--accent-emerald)' }} />
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'bold', display: 'block' }}>RESOLVED</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--accent-emerald)', fontFamily: 'Outfit' }}>{dept.resolvedOrClosed}</span>
                </div>
              </div>

              {/* Average Student Rating */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Star size={16} style={{ color: 'var(--accent-amber)' }} />
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'bold', display: 'block' }}>STUDENT RATING</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--accent-amber)', fontFamily: 'Outfit' }}>
                    {dept.averageRating === 'N/A' ? 'N/A' : `${dept.averageRating} / 5`}
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Reports;
