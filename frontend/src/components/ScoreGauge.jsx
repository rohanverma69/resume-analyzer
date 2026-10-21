import React from 'react';

export const ScoreGauge = ({ score = 0, size = 180, showLabel = true, subtitle = "ATS Match Score" }) => {
  const safeScore = Math.max(0, Math.min(100, Math.round(score)));

  // Gauge colors
  let color = '#ef4444'; // Red
  let label = 'Needs Improvement';
  let bgBadge = '#fee2e2';
  let textBadge = '#b91c1c';

  if (safeScore >= 80) {
    color = '#10b981'; // Emerald
    label = 'Strong ATS Fit';
    bgBadge = '#d1fae5';
    textBadge = '#065f46';
  } else if (safeScore >= 65) {
    color = '#2563eb'; // Blue
    label = 'Good Potential';
    bgBadge = '#dbeafe';
    textBadge = '#1e40af';
  } else if (safeScore >= 50) {
    color = '#f59e0b'; // Amber
    label = 'Moderate Alignment';
    bgBadge = '#fef3c7';
    textBadge = '#92400e';
  }

  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>

        {/* Center score text */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{ fontSize: size > 150 ? '2.5rem' : '1.75rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>
            {safeScore}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>
            OUT OF 100
          </span>
        </div>
      </div>

      {showLabel && (
        <div style={{ marginTop: '0.875rem' }}>
          <span style={{
            display: 'inline-block',
            backgroundColor: bgBadge,
            color: textBadge,
            fontSize: '0.8rem',
            fontWeight: 700,
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            marginBottom: '0.25rem',
          }}>
            {label}
          </span>
          <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            {subtitle}
          </div>
        </div>
      )}
    </div>
  );
};
