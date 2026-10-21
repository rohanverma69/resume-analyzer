import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export const Alert = ({ type = 'info', message = '', onDismiss = null }) => {
  if (!message) return null;

  const icons = {
    info: <Info size={18} />,
    success: <CheckCircle2 size={18} />,
    warning: <AlertTriangle size={18} />,
    danger: <AlertCircle size={18} />,
  };

  return (
    <div className={`alert alert-${type}`} role="alert">
      <div style={{ flexShrink: 0, marginTop: '2px' }}>
        {icons[type] || icons.info}
      </div>
      <div style={{ flex: 1, lineHeight: 1.4 }}>
        {message}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            padding: '2px',
            opacity: 0.7,
          }}
          aria-label="Dismiss alert"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
