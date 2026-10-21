import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { Alert } from '../components/Alert';
import {
  User,
  Mail,
  Calendar,
  Shield,
  Trash2,
  FileText,
  AlertTriangle,
} from 'lucide-react';

export const ProfilePage = () => {
  const { user, deleteAccount } = useAuth();
  const navigate = useNavigate();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setError('');
    try {
      await deleteAccount();
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Failed to delete account.');
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
          Account & Privacy Settings
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Manage your personal details, data retention preferences, and account lifecycle.
        </p>
      </div>

      {error && <Alert type="danger" message={error} onDismiss={() => setError('')} />}

      {/* Profile Card */}
      <div className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={18} color="var(--primary)" /> Profile Details
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
              Full Name
            </span>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
              {user?.full_name || 'Candidate'}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
              Email Address
            </span>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
              {user?.email || '—'}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
              Registration Date
            </span>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active Member'}
            </div>
          </div>
        </div>
      </div>

      {/* Data Retention & Privacy Policy Card */}
      <div className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={18} color="var(--primary)" /> Data Retention & Security Architecture
        </h2>

        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <p>
            <strong>In-Memory Processing:</strong> When you upload a resume, PyMuPDF or python-docx parses the document text in-memory or inside isolated temporary files that are deleted immediately upon extraction.
          </p>
          <p>
            <strong>No Third-Party AI Data Sharing:</strong> CareerAI uses an entirely local, deterministic NLP parsing algorithm. Your resume text, contact details, and career history are never sent to external commercial model APIs.
          </p>
          <p>
            <strong>User Control & Erasure:</strong> You retain complete ownership of your diagnostic records. Deleting individual analyses or your entire account instantly purges all associated records from the database.
          </p>
        </div>
      </div>

      {/* Danger Zone: Account Deletion */}
      <div className="card" style={{ borderColor: 'var(--danger-border)', backgroundColor: '#fffbfb', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--danger)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertTriangle size={18} /> Danger Zone: Delete Account
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '460px', lineHeight: 1.5 }}>
              Permanently delete your user account and all saved resume analyses, extracted keywords, and evaluation scores. This action cannot be reversed.
            </p>
          </div>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="btn btn-danger"
          >
            <Trash2 size={16} /> Delete My Account
          </button>
        </div>
      </div>

      {/* Account Deletion Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Permanently Delete Account?"
        confirmText="Yes, Delete Everything"
        confirmVariant="danger"
        isConfirming={isDeleting}
        onConfirm={handleDeleteAccount}
      >
        Are you certain you wish to permanently delete your CareerAI account? All your past resume scores, extracted data, and diagnostic history will be erased immediately.
      </Modal>
    </div>
  );
};
