import React from 'react';
import { Check, Plus, Tag } from 'lucide-react';

export const SkillBadges = ({ skills = [], variant = 'default', emptyMessage = 'No skills specified' }) => {
  if (!skills || skills.length === 0) {
    return (
      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
        {emptyMessage}
      </span>
    );
  }

  const getStyle = (type) => {
    switch (type) {
      case 'matched':
        return {
          bg: '#ecfdf5',
          text: '#065f46',
          border: '#a7f3d0',
          icon: <Check size={12} strokeWidth={2.5} />,
        };
      case 'missing':
        return {
          bg: '#fff1f2',
          text: '#9f1239',
          border: '#fecdd3',
          icon: <Plus size={12} strokeWidth={2.5} />,
        };
      case 'preferred':
        return {
          bg: '#f5f3ff',
          text: '#5b21b6',
          border: '#ddd6fe',
          icon: <Tag size={12} />,
        };
      default:
        return {
          bg: '#eff6ff',
          text: '#1e40af',
          border: '#bfdbfe',
          icon: null,
        };
    }
  };

  const style = getStyle(variant);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
      {skills.map((skill, idx) => (
        <span
          key={`${skill}-${idx}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            backgroundColor: style.bg,
            color: style.text,
            border: `1px solid ${style.border}`,
            padding: '0.25rem 0.65rem',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 600,
            lineHeight: 1.2,
          }}
        >
          {style.icon}
          {skill}
        </span>
      ))}
    </div>
  );
};
