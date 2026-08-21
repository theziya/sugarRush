import React from 'react';

export function SkeletonCard() {
  return (
    <div className="srb-product-card">
      <div className="srb-skeleton" style={{ height: '220px', width: '100%' }} />
      <div className="srb-card-body" style={{ gap: '0.5rem' }}>
        <div className="srb-skeleton" style={{ height: '16px', width: '30%' }} />
        <div className="srb-skeleton" style={{ height: '22px', width: '80%' }} />
        <div className="srb-skeleton" style={{ height: '14px', width: '100%' }} />
        <div className="srb-skeleton" style={{ height: '14px', width: '60%' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', alignItems: 'center' }}>
          <div className="srb-skeleton" style={{ height: '24px', width: '40%' }} />
          <div className="srb-skeleton" style={{ height: '36px', width: '30%', borderRadius: '8px' }} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="srb-product-grid">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
