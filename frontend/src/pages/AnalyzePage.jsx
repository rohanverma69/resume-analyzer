import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Alert } from '../components/Alert';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Loader2,
  X
} from 'lucide-react';

export const AnalyzePage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [targetRole, setTargetRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [error, setError] = useState('');

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

  const validateAndSetFile = (selectedFile) => {
    setError('');
    if (!selectedFile) return;

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError(`File is too large (${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 5 MB.`);
      return;
    }

    const ext = selectedFile.name.split('.').pop().toLowerCase();
    if (ext !== 'pdf' && ext !== 'docx') {
      setError(`Unsupported file format (.${ext}). Only PDF and DOCX files are supported.`);
      return;
    }

    setFile(selectedFile);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!file) {
      setError('Please select a resume file (PDF or DOCX) to analyze.');
      return;
    }

    setLoading(true);
    setProgressStep(1);

    const formData = new FormData();
    formData.append('file', file);
    if (targetRole.trim()) formData.append('target_role', targetRole.trim());
    if (jobDescription.trim()) formData.append('job_description', jobDescription.trim());

    // Step indicators
    const stepInterval = setInterval(() => {
      setProgressStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 700);

    try {
      const data = await api.resume.analyze(formData);
      clearInterval(stepInterval);
      setProgressStep(4);
      setTimeout(() => {
        navigate(`/analyses/${data.analysis.id}`);
      }, 500);
    } catch (err) {
      clearInterval(stepInterval);
      setError(err.message || 'Failed to process resume. Please verify the document format.');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          Analyze Your Resume
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
          Upload your resume in PDF or DOCX format to receive an explainable ATS score, keyword breakdown, and tailored suggestions.
        </p>
      </div>

      {error && <Alert type="danger" message={error} onDismiss={() => setError('')} />}

      {/* Two Modes Info Box */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <div style={{
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          fontSize: '0.85rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: '#1e40af', marginBottom: '0.25rem' }}>
            <Sparkles size={16} /> Mode 1: General Completeness
          </div>
          <p style={{ color: '#1e3a8a', lineHeight: 1.4 }}>
            Leave the Job Description blank to measure overall resume health, formatting density, technical breadth, and project quality.
          </p>
        </div>

        <div style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          fontSize: '0.85rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: '#15803d', marginBottom: '0.25rem' }}>
            <CheckCircle2 size={16} /> Mode 2: Job-Specific Alignment
          </div>
          <p style={{ color: '#166534', lineHeight: 1.4 }}>
            Paste a target Job Description to evaluate exact keyword overlap, missing skills, and role experience requirements.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Upload Zone */}
        <div className="card" style={{ marginBottom: '1.75rem', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem' }}>
            1. Select Resume Document
          </h2>

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragActive ? 'var(--primary)' : file ? 'var(--success)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-lg)',
              backgroundColor: dragActive ? 'var(--primary-light)' : file ? 'var(--success-bg)' : '#f8fafc',
              padding: '3rem 1.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            {file ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  backgroundColor: '#d1fae5',
                  color: 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <FileText size={28} />
                </div>
                <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1.05rem' }}>
                  {file.name}
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  {(file.size / 1024).toFixed(0)} KB • Click or drop another file to change
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  backgroundColor: '#eff6ff',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Upload size={28} />
                </div>
                <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1.05rem' }}>
                  Click to browse or drag and drop your resume
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  Supported formats: PDF or DOCX (Max 5 MB)
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Optional Job Match Details */}
        <div className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
              2. Target Role & Job Description <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>(Optional)</span>
            </h2>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="targetRole">Target Job Title</label>
            <input
              id="targetRole"
              type="text"
              className="form-input"
              placeholder="e.g. Senior Full Stack Engineer, Data Scientist, Product Manager"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="jobDescription">Target Job Description</label>
            <textarea
              id="jobDescription"
              className="form-textarea"
              rows={6}
              placeholder="Paste the full job description or requirements here to enable precise keyword matching and skill gap identification..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
            <div className="form-help">
              If left blank, CareerAI will evaluate general candidate completeness and technical breadth.
            </div>
          </div>
        </div>

        {/* Submit Button & Progress Indicator */}
        {loading ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <Loader2 size={36} color="var(--primary)" className="spin" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              {progressStep === 1 && 'Extracting text and validating document structure...'}
              {progressStep === 2 && 'Parsing technical skills and candidate history...'}
              {progressStep === 3 && 'Computing 5-pillar ATS score and matching jobs...'}
              {progressStep >= 4 && 'Finalizing analysis report...'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Processed securely in-memory. Resumes are not stored permanently on unencrypted public endpoints.
            </p>
          </div>
        ) : (
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', fontSize: '1.1rem', padding: '1rem' }}
            disabled={!file}
          >
            Start ATS Analysis <ArrowRight size={20} />
          </button>
        )}
      </form>
    </div>
  );
};
