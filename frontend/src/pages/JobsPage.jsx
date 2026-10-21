import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { JobCard } from '../components/JobCard';
import { Alert } from '../components/Alert';
import {
  Search,
  Filter,
  Briefcase,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Loader2,
} from 'lucide-react';

export const JobsPage = () => {
  const { isAuthenticated } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'matched'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [jobType, setJobType] = useState('');
  const [pagination, setPagination] = useState({ page: 1, per_page: 9, total_count: 0, total_pages: 1 });

  const fetchAllJobs = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const data = await api.jobs.list({
        page,
        per_page: 9,
        search,
        experience_level: experienceLevel,
        job_type: jobType,
      });
      setJobs(data.jobs || []);
      setPagination(data.pagination || { page: 1, per_page: 9, total_count: 0, total_pages: 1 });
    } catch (err) {
      setError(err.message || 'Failed to fetch jobs directory.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.jobs.getRecommendations({
        search,
        experience_level: experienceLevel,
        job_type: jobType,
      });
      setRecommendations(data.recommendations || []);
    } catch (err) {
      setError(err.message || 'Could not load personalized job recommendations. Ensure you have analyzed at least one resume.');
      setViewMode('all');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'all') {
      fetchAllJobs(1);
    } else {
      fetchRecommendations();
    }
  }, [viewMode, experienceLevel, jobType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (viewMode === 'all') {
      fetchAllJobs(1);
    } else {
      fetchRecommendations();
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.825rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
          <Briefcase size={16} /> Benchmark Jobs Directory
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          Explore Industry Benchmark Roles
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '700px' }}>
          Benchmark your skills against 20+ realistic software engineering and technology role specifications.
        </p>
      </div>

      {/* Honest Transparency Notice Banner */}
      <div style={{
        backgroundColor: '#f8fafc',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '1rem 1.25rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
      }}>
        <ShieldCheck size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
        <div>
          <strong>Benchmark Transparency:</strong> All listings in this directory are curated sample benchmark profiles for ATS scoring and skill gap evaluation. CareerAI never fabricates live vacancies or claims external companies are actively recruiting.
        </div>
      </div>

      {error && <Alert type="danger" message={error} onDismiss={() => setError('')} />}

      {/* Filter and Mode Toggle Bar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          {/* Mode Toggles */}
          {isAuthenticated && (
            <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
              <button
                type="button"
                onClick={() => setViewMode('all')}
                style={{
                  border: 'none',
                  background: viewMode === 'all' ? '#ffffff' : 'transparent',
                  color: viewMode === 'all' ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: viewMode === 'all' ? 700 : 500,
                  padding: '0.45rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  boxShadow: viewMode === 'all' ? 'var(--shadow-sm)' : 'none',
                }}
              >
                All Benchmark Jobs
              </button>
              <button
                type="button"
                onClick={() => setViewMode('matched')}
                style={{
                  border: 'none',
                  background: viewMode === 'matched' ? '#ffffff' : 'transparent',
                  color: viewMode === 'matched' ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: viewMode === 'matched' ? 700 : 500,
                  padding: '0.45rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  boxShadow: viewMode === 'matched' ? 'var(--shadow-sm)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <Sparkles size={14} /> Ranked for My Resume
              </button>
            </div>
          )}

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 1, maxWidth: '420px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search by role, company, or skill..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '2.3rem', fontSize: '0.875rem' }}
              />
              <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            </div>
            <button type="submit" className="btn btn-secondary btn-sm">
              Search
            </button>
          </form>
        </div>

        {/* Dropdown Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <Filter size={14} /> Filters:
          </div>

          <select
            className="form-select"
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
            style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.825rem' }}
          >
            <option value="">All Experience Levels</option>
            <option value="Entry">Entry-Level</option>
            <option value="Mid">Mid-Level</option>
            <option value="Senior">Senior</option>
            <option value="Lead">Lead</option>
          </select>

          <select
            className="form-select"
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.825rem' }}
          >
            <option value="">All Job Types</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Full-time">Full-time</option>
          </select>

          {(search || experienceLevel || jobType) && (
            <button
              onClick={() => { setSearch(''); setExperienceLevel(''); setJobType(''); }}
              style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Grid of Job Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <Loader2 size={36} color="var(--primary)" className="spin" style={{ margin: '0 auto 0.75rem auto' }} />
          <span style={{ color: 'var(--text-muted)' }}>Filtering benchmark roles...</span>
        </div>
      ) : viewMode === 'matched' ? (
        recommendations.length > 0 ? (
          <div className="grid grid-cols-3" style={{ marginBottom: '2rem' }}>
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
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Matched Roles Found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Try adjusting your filter criteria or upload a new resume.
            </p>
          </div>
        )
      ) : jobs.length > 0 ? (
        <>
          <div className="grid grid-cols-3" style={{ marginBottom: '2rem' }}>
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} showGapAnalysis={false} />
            ))}
          </div>

          {/* Pagination */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem',
            backgroundColor: '#ffffff',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
          }}>
            <span style={{ color: 'var(--text-muted)' }}>
              Showing {jobs.length} of {pagination.total_count} benchmark roles
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn btn-secondary btn-sm"
                disabled={pagination.page <= 1}
                onClick={() => fetchAllJobs(pagination.page - 1)}
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <span style={{ display: 'flex', alignItems: 'center', padding: '0 0.5rem', fontWeight: 600 }}>
                {pagination.page} / {pagination.total_pages}
              </span>
              <button
                className="btn btn-secondary btn-sm"
                disabled={pagination.page >= pagination.total_pages}
                onClick={() => fetchAllJobs(pagination.page + 1)}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Jobs Matched</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Try broadening your search term or clearing active filters.
          </p>
        </div>
      )}
    </div>
  );
};
