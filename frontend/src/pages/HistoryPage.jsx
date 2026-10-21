import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Alert } from '../components/Alert';
import { Modal } from '../components/Modal';
import {
  FileText,
  Search,
  Download,
  Trash2,
  Calendar,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Upload,
  Loader2,
  ShieldAlert,
} from 'lucide-react';

export const HistoryPage = () => {
  const [analyses, setAnalyses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, per_page: 10, total_count: 0, total_pages: 1 });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const fetchHistory = async (page = 1, search = '') => {
    setLoading(true);
    setError('');
    try {
      const data = await api.analyses.list({ page, per_page: 10, search });
      setAnalyses(data.analyses || []);
      setPagination(data.pagination || { page: 1, per_page: 10, total_count: 0, total_pages: 1 });
    } catch (err) {
      setError(err.message || 'Failed to fetch analysis history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(1, searchTerm);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHistory(1, searchTerm);
  };

  const handleDownload = async (id, filename) => {
    setDownloadingId(id);
    try {
      const blob = await api.analyses.downloadBlob(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CareerAI_Report_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      setError('Failed to download PDF report.');
    } finally {
      setDownloadingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await api.analyses.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetchHistory(pagination.page, searchTerm);
    } catch (err) {
      setError(err.message || 'Failed to delete analysis record.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
            Resume Analysis History
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Browse past resume diagnostic results, download PDF reports, and manage saved records.
          </p>
        </div>

        <Link to="/analyze" className="btn btn-primary">
          <Upload size={16} /> Analyze New Resume
        </Link>
      </div>

      {error && <Alert type="danger" message={error} onDismiss={() => setError('')} />}

      {/* Search Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by resume filename or target job role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          </div>
          <button type="submit" className="btn btn-secondary">
            Search
          </button>
        </form>
      </div>

      {/* History Table / List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <Loader2 size={36} color="var(--primary)" className="spin" style={{ margin: '0 auto 0.75rem auto' }} />
          <span style={{ color: 'var(--text-muted)' }}>Loading analysis archive...</span>
        </div>
      ) : analyses.length > 0 ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '1.5rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontWeight: 600 }}>File & Date</th>
                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontWeight: 600 }}>Target Role</th>
                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>ATS Score</th>
                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {analyses.map((item) => {
                const score = item.overall_score;
                const scoreColor = score >= 80 ? '#10b981' : score >= 65 ? '#2563eb' : score >= 50 ? '#f59e0b' : '#ef4444';

                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.15s' }}>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <FileText size={16} color="var(--primary)" />
                        {item.filename}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '2px' }}>
                        <Calendar size={12} /> {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </td>

                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{ color: item.target_role ? 'var(--text-main)' : 'var(--text-light)', fontWeight: item.target_role ? 500 : 400 }}>
                        {item.target_role || 'General Evaluation'}
                      </span>
                    </td>

                    <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          fontWeight: 800,
                          fontSize: '0.95rem',
                          color: scoreColor,
                          backgroundColor: `${scoreColor}15`,
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        {score} / 100
                      </span>
                    </td>

                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Link to={`/analyses/${item.id}`} className="btn btn-secondary btn-sm" title="View Full Report">
                          View
                        </Link>
                        <button
                          onClick={() => handleDownload(item.id, item.filename)}
                          className="btn btn-secondary btn-sm"
                          title="Download PDF"
                          disabled={downloadingId === item.id}
                        >
                          <Download size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="btn btn-outline-danger btn-sm"
                          title="Delete Analysis"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.25rem',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid var(--border)',
            fontSize: '0.85rem',
          }}>
            <span style={{ color: 'var(--text-muted)' }}>
              Showing {analyses.length} of {pagination.total_count} records
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn btn-secondary btn-sm"
                disabled={pagination.page <= 1}
                onClick={() => fetchHistory(pagination.page - 1, searchTerm)}
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <span style={{ display: 'flex', alignItems: 'center', padding: '0 0.5rem', fontWeight: 600 }}>
                {pagination.page} / {pagination.total_pages}
              </span>
              <button
                className="btn btn-secondary btn-sm"
                disabled={pagination.page >= pagination.total_pages}
                onClick={() => fetchHistory(pagination.page + 1, searchTerm)}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#eff6ff',
            color: 'var(--primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
          }}>
            <FileText size={28} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            No analyses found
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
            {searchTerm ? 'No results matched your search keyword.' : 'You have not uploaded any resumes yet.'}
          </p>
          <Link to="/analyze" className="btn btn-primary">
            Upload a Resume
          </Link>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Resume Analysis"
        confirmText="Delete Record"
        confirmVariant="danger"
        isConfirming={isDeleting}
        onConfirm={confirmDelete}
      >
        Are you sure you want to permanently delete the analysis for{' '}
        <strong>{deleteTarget?.filename}</strong>? This action cannot be undone.
      </Modal>
    </div>
  );
};
