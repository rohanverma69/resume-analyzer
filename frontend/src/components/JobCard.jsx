import React from 'react';
import { MapPin, DollarSign, Briefcase, Award, AlertTriangle, ShieldCheck } from 'lucide-react';
import { SkillBadges } from './SkillBadges';

export const JobCard = ({
  job = {},
  relevanceScore = null,
  matchedSkills = [],
  missingSkills = [],
  showGapAnalysis = false,
}) => {
  const isSample = job.is_sample ?? true;

  return (
    <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {job.company}
            </span>
            {isSample && (
              <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                Benchmark Profile
              </span>
            )}
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.3 }}>
            {job.title}
          </h3>
        </div>

        {/* Relevance score pill if provided */}
        {relevanceScore !== null && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: relevanceScore >= 70 ? '#ecfdf5' : relevanceScore >= 50 ? '#eff6ff' : '#fef3c7',
            border: `1px solid ${relevanceScore >= 70 ? '#a7f3d0' : relevanceScore >= 50 ? '#bfdbfe' : '#fde68a'}`,
            padding: '0.4rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            minWidth: '70px',
          }}>
            <span style={{
              fontSize: '1.15rem',
              fontWeight: 800,
              color: relevanceScore >= 70 ? '#065f46' : relevanceScore >= 50 ? '#1e40af' : '#92400e',
              lineHeight: 1,
            }}>
              {relevanceScore}%
            </span>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Match
            </span>
          </div>
        )}
      </div>

      {/* Meta tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <MapPin size={14} /> {job.location}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Briefcase size={14} /> {job.job_type} • {job.experience_level}
        </div>
        {job.salary_range && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#047857', fontWeight: 600 }}>
            <DollarSign size={14} /> {job.salary_range}
          </div>
        )}
      </div>

      {/* Description */}
      <p style={{
        fontSize: '0.875rem',
        color: 'var(--text-muted)',
        lineHeight: 1.5,
        marginBottom: '1.25rem',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        flex: 1,
      }}>
        {job.description}
      </p>

      {/* Skills or Gap Analysis */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.85rem', marginTop: 'auto' }}>
        {showGapAnalysis ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {matchedSkills.length > 0 && (
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#065f46', display: 'block', marginBottom: '0.25rem' }}>
                  Matched Skills ({matchedSkills.length}):
                </span>
                <SkillBadges skills={matchedSkills} variant="matched" />
              </div>
            )}
            {missingSkills.length > 0 && (
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9f1239', display: 'block', marginBottom: '0.25rem' }}>
                  Missing / Recommended Keywords ({missingSkills.length}):
                </span>
                <SkillBadges skills={missingSkills} variant="missing" />
              </div>
            )}
          </div>
        ) : (
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              Required Competencies:
            </span>
            <SkillBadges skills={job.required_skills || []} variant="default" />
          </div>
        )}
      </div>

      {/* Benchmark Disclaimer Footer on Card */}
      <div style={{
        marginTop: '0.75rem',
        paddingTop: '0.5rem',
        borderTop: '1px dashed var(--border)',
        fontSize: '0.7rem',
        color: 'var(--text-light)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.3rem',
      }}>
        <ShieldCheck size={12} /> Curated benchmark job profile for comparative ATS alignment.
      </div>
    </div>
  );
};
