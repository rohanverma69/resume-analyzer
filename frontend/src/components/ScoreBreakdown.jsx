import React from 'react';
import { CheckCircle2, AlertCircle, Award, Briefcase, GraduationCap, FolderGit2, Layout } from 'lucide-react';

export const ScoreBreakdown = ({ breakdown = {} }) => {
  const pillars = [
    {
      key: 'skills',
      title: 'Skills Match',
      max: 40,
      icon: <Award size={18} color="var(--primary)" />,
    },
    {
      key: 'experience',
      title: 'Relevant Experience',
      max: 20,
      icon: <Briefcase size={18} color="#059669" />,
    },
    {
      key: 'education',
      title: 'Education Alignment',
      max: 15,
      icon: <GraduationCap size={18} color="#7c3aed" />,
    },
    {
      key: 'projects',
      title: 'Projects & Practical Depth',
      max: 15,
      icon: <FolderGit2 size={18} color="#d97706" />,
    },
    {
      key: 'formatting_and_completeness',
      title: 'Completeness & ATS Formatting',
      max: 10,
      icon: <Layout size={18} color="#0891b2" />,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {pillars.map((pillar) => {
        const item = breakdown[pillar.key] || { score: 0, max: pillar.max, explanation: '' };
        const score = item.score ?? 0;
        const max = item.max || pillar.max;
        const percentage = Math.round((score / max) * 100);
        const isGood = percentage >= 70;

        return (
          <div
            key={pillar.key}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '1.125rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {pillar.icon}
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                  {pillar.title}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {score} <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.85rem' }}>/ {max} pts</span>
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '9999px',
                    backgroundColor: isGood ? 'var(--success-bg)' : 'var(--warning-bg)',
                    color: isGood ? 'var(--success)' : 'var(--warning)',
                    border: `1px solid ${isGood ? 'var(--success-border)' : 'var(--warning-border)'}`,
                  }}
                >
                  {isGood ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                  {isGood ? 'Strong' : 'Review'}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div
              style={{
                width: '100%',
                height: '8px',
                backgroundColor: '#f1f5f9',
                borderRadius: '9999px',
                overflow: 'hidden',
                marginBottom: '0.625rem',
              }}
            >
              <div
                style={{
                  width: `${percentage}%`,
                  height: '100%',
                  backgroundColor: isGood ? 'var(--primary)' : 'var(--warning)',
                  borderRadius: '9999px',
                  transition: 'width 0.8s ease-in-out',
                }}
              />
            </div>

            {/* Explanation */}
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {item.explanation || 'Score computed based on parsed section keywords and structural density.'}
            </p>
          </div>
        );
      })}
    </div>
  );
};
