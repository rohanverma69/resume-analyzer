import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { ScoreGauge } from '../components/ScoreGauge';
import { ScoreBreakdown } from '../components/ScoreBreakdown';
import { SkillBadges } from '../components/SkillBadges';
import { JobCard } from '../components/JobCard';
import { Alert } from '../components/Alert';
import { Modal } from '../components/Modal';
import {
  FileText,
  Download,
  Trash2,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  User,
  Briefcase,
  GraduationCap,
  FolderGit2,
  ExternalLink,
  Shield,
  Loader2,
} from 'lucide-react';

export const AnalysisDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchAnalysisData = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.analyses.get(id);
        setAnalysis(data.analysis);

        // Fetch matched jobs tailored to this analysis
        try {
          const recsData = await api.jobs.getRecommendations({ analysis_id: id, limit: 3 });
          setRecommendations(recsData.recommendations || []);
        } catch {
          // Non-blocking
        }
      } catch (err) {
        setError(err.message || 'Failed to load analysis details.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysisData();
  }, [id]);

  const handleDownloadReport = async () => {
    setDownloading(true);
    try {
      const blob = await api.analyses.downloadBlob(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CareerAI_Report_${analysis?.id || id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      setError('Failed to download PDF report. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.analyses.delete(id);
      navigate('/history');
    } catch (err) {
      setError(err.message || 'Failed to delete analysis.');
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
        <Loader2 size={36} color="var(--primary)" className="spin" />
        <span style={{ color: 'var(--text-muted)' }}>Retrieving ATS evaluation report...</span>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center' }}>
        <Alert type="danger" message={error || 'Analysis record not found.'} />
        <Link to="/history" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          <ArrowLeft size={16} /> Return to History
        </Link>
      </div>
    );
  }

  const extracted = analysis.extracted_data || {};
  const contact = extracted.contact_info || {};
  const education = extracted.education || [];
  const experience = extracted.experience || {};
  const projects = extracted.projects || {};
  const suggestions = analysis.improvement_suggestions || [];
  const matchedSkills = analysis.matched_skills || [];
  const missingSkills = analysis.missing_skills || [];

  return (
    <div>
      {/* Top Navigation & Actions Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        <Link to="/history" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Back to Analysis Archive
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={handleDownloadReport}
            className="btn btn-primary btn-sm"
            disabled={downloading}
          >
            <Download size={14} /> {downloading ? 'Generating PDF...' : 'Download PDF Report'}
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="btn btn-outline-danger btn-sm"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="card" style={{
        marginBottom: '2rem',
        padding: '2rem',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        gap: '2rem',
        alignItems: 'center',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span className="badge badge-primary">
              {analysis.has_job_description ? 'Job-Specific Match' : 'General Completeness'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <Calendar size={13} /> {new Date(analysis.created_at).toLocaleDateString()}
            </span>
          </div>

          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
            {analysis.filename}
          </h1>

          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Target Role: <strong>{analysis.target_role || 'General Candidate Completeness'}</strong>
          </p>

          {/* Quick contact tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            {contact.email && <span>Email: <strong>{contact.email}</strong></span>}
            {contact.phone && <span>Phone: <strong>{contact.phone}</strong></span>}
            {contact.linkedin && (
              <a href={contact.linkedin.startsWith('http') ? contact.linkedin : `https://${contact.linkedin}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                LinkedIn <ExternalLink size={12} />
              </a>
            )}
            {contact.github && (
              <a href={contact.github.startsWith('http') ? contact.github : `https://${contact.github}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                GitHub <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>

        {/* Big Score Gauge */}
        <div style={{ padding: '0.5rem 1rem' }}>
          <ScoreGauge score={analysis.overall_score} size={160} subtitle="ATS Match Score" />
        </div>
      </div>

      {/* Main Grid: Breakdown + Skills */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem', marginBottom: '2.5rem' }}>
        {/* Left: 5 Pillars */}
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem' }}>
            Component-Level ATS Breakdown
          </h2>
          <ScoreBreakdown breakdown={analysis.score_breakdown} />
        </div>

        {/* Right: Skills & Suggestions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Matched Skills */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#065f46', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={18} /> Identified Skills ({matchedSkills.length})
            </h3>
            <SkillBadges skills={matchedSkills} variant="matched" emptyMessage="No standard skills detected." />
          </div>

          {/* Missing Skills */}
          {missingSkills.length > 0 && (
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#9f1239', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertTriangle size={18} /> Missing Target Keywords ({missingSkills.length})
              </h3>
              <SkillBadges skills={missingSkills} variant="missing" />
            </div>
          )}

          {/* Actionable Improvement Suggestions */}
          {suggestions.length > 0 && (
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Lightbulb size={18} color="#d97706" /> Tailored Optimization Steps
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {suggestions.map((sugg, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    <span style={{
                      backgroundColor: '#fef3c7',
                      color: '#b45309',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}>
                      {idx + 1}
                    </span>
                    <span style={{ lineHeight: 1.45 }}>{sugg}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Extracted Structured Sections */}
      <section className="card" style={{ marginBottom: '2.5rem', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.25rem' }}>
          Extracted Candidate Profile Data
        </h2>

        <div className="grid grid-cols-3">
          {/* Education */}
          <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: '#7c3aed', marginBottom: '0.75rem' }}>
              <GraduationCap size={18} /> Education Entries
            </div>
            {education.length > 0 ? (
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {education.map((edu, idx) => (
                  <li key={idx} style={{ fontSize: '0.85rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{edu.degree}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{edu.details}</div>
                    {edu.year && <div style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>Year: {edu.year}</div>}
                  </li>
                ))}
              </ul>
            ) : (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No structured degree explicitly detected.
              </span>
            )}
          </div>

          {/* Experience */}
          <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: '#059669', marginBottom: '0.75rem' }}>
              <Briefcase size={18} /> Work Experience
            </div>
            <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              Estimated Duration: <strong>~{experience.estimated_years || 0} years</strong>
            </div>
            {experience.roles_detected && experience.roles_detected.length > 0 && (
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                Identified Roles: {experience.roles_detected.join(', ')}
              </div>
            )}
          </div>

          {/* Projects */}
          <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: '#d97706', marginBottom: '0.75rem' }}>
              <FolderGit2 size={18} /> Projects Depth
            </div>
            <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              Project Section: <strong>{projects.has_projects_section ? 'Present' : 'Not Detected'}</strong>
            </div>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Estimated Count: ~{projects.project_count_estimate || 0} technical project entries
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Benchmark Jobs for this Resume */}
      {recommendations.length > 0 && (
        <section style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Matched Benchmark Tech Jobs
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Jobs ranked by technical compatibility with the skills found on this resume.
              </p>
            </div>
            <Link to="/jobs" className="btn btn-secondary btn-sm">
              Explore All Jobs
            </Link>
          </div>

          <div className="grid grid-cols-3">
            {recommendations.map((rec, idx) => (
              <JobCard
                key={rec.job.id || idx}
                job={rec.job}
                relevanceScore={rec.relevance_score}
                matchedSkills={rec.matched_required_skills}
                missingSkills={rec.missing_required_skills}
                showGapAnalysis={true}
              />
            ))}
          </div>
        </section>
      )}

      {/* Transparent Disclaimer Box */}
      <div style={{
        backgroundColor: '#f8fafc',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem',
        fontSize: '0.825rem',
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.65rem',
      }}>
        <Shield size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Transparent Scoring Notice:</strong> CareerAI calculates scores using an auditable, deterministic algorithm based on keyword taxonomy, experience duration, and section completeness. It is not an official endorsement from any specific employer ATS vendor or a guarantee of employment.
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Resume Analysis"
        confirmText="Permanently Delete"
        confirmVariant="danger"
        isConfirming={isDeleting}
        onConfirm={handleDelete}
      >
        Are you sure you want to permanently delete this resume analysis for{' '}
        <strong>{analysis.filename}</strong>? All associated extracted data and score records will be permanently removed.
      </Modal>
    </div>
  );
};
