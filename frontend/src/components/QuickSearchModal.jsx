import React, { useState } from 'react';

export default function QuickSearchModal({ isOpen, onClose, products, onSelectProduct }) {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const results = query.trim() === '' 
    ? [] 
    : products.filter(p => 
        p.product_name.toLowerCase().includes(query.toLowerCase()) || 
        (p.category && p.category.toLowerCase().includes(query.toLowerCase())) ||
        (p.short_description && p.short_description.toLowerCase().includes(query.toLowerCase()))
      );

  return (
    <>
      <div className="srb-drawer-overlay" onClick={onClose} />
      <div className="srb-modal" style={{ maxWidth: '540px' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '1.2rem' }}>🔍</span>
          <input 
            className="srb-input" 
            placeholder="Type to search cakes, brownies, tubs..." 
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
            style={{ fontSize: '1.05rem', padding: '0.8rem' }}
          />
          <button onClick={onClose} className="srb-icon-btn">✕</button>
        </div>

        <div>
          {query.trim() === '' ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0', fontSize: '0.9rem' }}>Type keywords to search our gourmet bake menu.</p>
          ) : results.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0', fontSize: '0.9rem' }}>No products matching "{query}".</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto' }}>
              {results.map(p => (
                <div 
                  key={p.name} 
                  onClick={() => { onSelectProduct(p); onClose(); }}
                  style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.75rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', background: '#f8fafc', transition: 'background 0.2s' }}
                >
                  <img src={p.thumbnail_image || p.main_image || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600'} alt={p.product_name} style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} />
                  <div style={{ flexGrow: 1 }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>{p.product_name}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.category || 'Bakes'}</span>
                  </div>
                  <span style={{ fontWeight: 900, color: 'var(--primary)' }}>₹{p.starting_price || 500}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
