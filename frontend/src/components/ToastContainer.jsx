import React from 'react';

export default function ToastContainer({ toasts, removeToast }) {
  if (!toasts || !toasts.length) return null;

  return (
    <div className="srb-toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`srb-toast ${t.type || 'info'}`}>
          <span style={{ fontSize: '1.2rem' }}>
            {t.type === 'success' ? '✅' : t.type === 'error' ? '⚠️' : 'ℹ️'}
          </span>
          <div style={{ flexGrow: 1 }}>{t.message}</div>
          <button 
            onClick={() => removeToast(t.id)} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem' }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
