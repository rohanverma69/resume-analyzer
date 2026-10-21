import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ScoreGauge } from '../components/ScoreGauge';
import { JobCard } from '../components/JobCard';
import { SkillBadges } from '../components/SkillBadges';
import { Alert } from '../components/Alert';
import {
  FileText,
  Briefcase,
  Upload,
  ArrowRight,
  TrendingUp,
  Clock,
  Award,
  Sparkles,
  ExternalLink,
  Loader2,
} from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [error, setError] = useState('');

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch analyses history
      const analysesData = await api.analyses.list({ per_page: 5 });
      setRecentAnalyses(analysesData.analyses || []);

      // If there is at least one analysis, fetch recommendations
      if (analysesData.analyses && analysesData.analyses.length > 0) {
        try {
          const recsData = await api.jobs.getRecommendations({
            analysis_id: analysesData.analyses[0].id,
            limit: 3,
          });
          setRecommendedJobs(recsData.recommendations || []);
        } catch {
          // If recommendations fail, jobs still work
        }
      }
    } catch (err) {
      setError('Unable to load recent dashboard metrics. ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const latestAnalysis = recentAnalyses[0];

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '1rem' }}>
        <Loader2 size={36} color="var(--primary)" className="spin" />
        <span style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>Loading your candidate dashboard...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.25rem',
        marginBottom: '2rem',
        padding: '1.75rem',
        backgroundColor: '#ffffff',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
              Candidate Dashboard
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
            Welcome back, {user?.full_name || 'Candidate'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Review your recent ATS evaluations, track keyword alignment, and explore benchmark job matches.
          </p>
        </div>

        <Link to="/analyze" className="btn btn-primary btn-lg" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Upload size={18} /> Analyze New Resume
        </Link>
      </div>

      {error && <Alert type="danger" message={error} onDismiss={() => setError('')} />}

      {/* Metrics Row */}
      <div className="grid grid-cols-4" style={{ marginBottom: '2.5rem' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Audited Resumes</span>
            <FileText size={18} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {recentAnalyses.length}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Tracked in your account</span>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)' }}>Latest ATS Score</span>
            <Award size={18} color="#059669" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: latestAnalysis ? 'var(--text-main)' : 'var(--text-light)' }}>
            {latestAnalysis ? `${latestAnalysis.overall_score}/100` : '—'}
          </div>
          <span style={{ fontSize: '0.75rem', color: latestAnalysis ? 'var(--success)' : 'var(--text-light)' }}>
            {latestAnalysis ? (latestAnalysis.target_role || 'General Profile') : 'No resume uploaded yet'}
          </span>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)' }}>Top Detected Skills</span>
            <Sparkles size={18} color="#d97706" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {latestAnalysis?.matched_skills?.length || 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Extracted from latest resume</span>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)' }}>Benchmark Jobs</span>
            <Briefcase size={18} color="#7c3aed" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
            22
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Ready for comparison</span>
        </div>
      </div>

      {/* Main Content Layout */}
      {latestAnalysis ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 360px)', gap: '2rem', marginBottom: '3rem' }}>
          {/* Left Column: Recent Analysis Summary */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <span className="badge badge-primary" style={{ marginBottom: '0.25rem' }}>Latest Evaluation</span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {latestAnalysis.filename}
                </h2>
                <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  Target Role: <strong>{latestAnalysis.target_role || 'General Candidate Completeness'}</strong>
                </span>
              </div>
              <Link to={`/analyses/${latestAnalysis.id}`} className="btn btn-secondary btn-sm">
                View Full Diagnostic <ArrowRight size={14} />
              </Link>
            </div>

            {/* Matched skills preview */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                Extracted Skills Profile ({latestAnalysis.matched_skills?.length || 0})
              </h4>
              <SkillBadges skills={(latestAnalysis.matched_skills || []).slice(0, 12)} variant="matched" />
            </div>

            {/* Missing keywords preview */}
            {latestAnalysis.missing_skills && latestAnalysis.missing_skills.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9f1239', marginBottom: '0.5rem' }}>
                  Target Missing Keywords ({latestAnalysis.missing_skills.length})
                </h4>
                <SkillBadges skills={latestAnalysis.missing_skills.slice(0, 8)} variant="missing" />
              </div>
            )}

            {/* Actionable Suggestions preview */}
            {latestAnalysis.improvement_suggestions && latestAnalysis.improvement_suggestions.length > 0 && (
              <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  Top Priority Improvement:
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {latestAnalysis.improvement_suggestions[0]}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Score Gauge Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
            <ScoreGauge score={latestAnalysis.overall_score} size={190} subtitle="ATS Compatibility Score" />
            <Link
              to={`/analyses/${latestAnalysis.id}`}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1.5rem' }}
            >
              Examine Full Breakdown
            </Link>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', marginBottom: '3rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#eff6ff',
            color: 'var(--primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem',
          }}>
            <FileText size={32} />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            No Resume Analyzed Yet
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 1.75rem auto', fontSize: '0.925rem' }}>
            Upload your resume in PDF or DOCX format to receive an instant, explainable ATS evaluation and personalized benchmark job recommendations.
          </p>
          <Link to="/analyze" className="btn btn-primary btn-lg">
            <Upload size={18} /> Upload Your First Resume
          </Link>
        </div>
      )}

      {/* Recommended Jobs Section */}
      {recommendedJobs.length > 0 && (
        <section style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Recommended Benchmark Jobs
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Ranked according to skills and experience extracted from your latest resume.
              </p>
            </div>
            <Link to="/jobs" className="btn btn-secondary btn-sm">
              View All 22 Benchmark Roles <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-3">
            {recommendedJobs.map((rec, idx) => (
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
    </div>
  );
};
