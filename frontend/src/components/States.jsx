import React from 'react';

export function EmptyState({ icon = "🍰", title, description, actionText, onAction }) {
  return (
    <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{icon}</div>
      <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.4rem', color: 'var(--dark)' }}>{title}</h3>
      <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 1.5rem', fontSize: '0.92rem' }}>{description}</p>
      {actionText && onAction && (
        <button className="srb-btn srb-btn-primary" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div style={{ textAlign: 'center', padding: '3rem 1.5rem', background: 'var(--error-soft)', borderRadius: 'var(--radius-lg)', border: '1px solid #fca5a5' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>⚠️</div>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#991b1b', marginBottom: '0.4rem' }}>Connection Error</h3>
      <p style={{ color: '#b91c1c', maxWidth: '420px', margin: '0 auto 1.25rem', fontSize: '0.9rem' }}>{message || 'Unable to load menu data. Please check your connection and try again.'}</p>
      {onRetry && (
        <button className="srb-btn srb-btn-secondary" onClick={onRetry}>
          🔄 Retry Loading
        </button>
      )}
    </div>
  );
}
