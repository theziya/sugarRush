import React from 'react';

export default function Footer({ setActiveTab }) {
  return (
    <footer style={{ background: '#231b17', color: '#b5a79e', padding: '4.5rem 0 2.5rem', marginTop: '5rem', borderTop: '1px solid #362c26' }}>
      <div className="srb-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontStyle: 'italic', fontWeight: 500, color: '#f5eee6', marginBottom: '1rem' }}>
            Ovenly Atelier
          </div>
          <p style={{ fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.5rem', color: '#a3958b' }}>
            Artisan bakery crafting warm butter croissants, slow-fermented sourdoughs, and celebration cakes daily with passion & love.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <span style={{ background: '#362c26', padding: '0.4rem 0.8rem', borderRadius: '999px', color: '#e6ded3', fontSize: '0.8rem', fontWeight: 600 }}>📍 Main Bakehouse</span>
          </div>
        </div>

        <div>
          <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#d4a373', fontWeight: 700, marginBottom: '1.25rem' }}>Navigation</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.92rem' }}>
            <li><button onClick={() => setActiveTab('menu')} style={{ background: 'none', border: 'none', color: '#b5a79e', cursor: 'pointer', fontFamily: 'inherit' }}>Our Menu</button></li>
            <li><button onClick={() => setActiveTab('custom')} style={{ background: 'none', border: 'none', color: '#b5a79e', cursor: 'pointer', fontFamily: 'inherit' }}>Custom Cake Atelier</button></li>
            <li><button onClick={() => setActiveTab('track')} style={{ background: 'none', border: 'none', color: '#b5a79e', cursor: 'pointer', fontFamily: 'inherit' }}>Track Order Status</button></li>
            <li><button onClick={() => setActiveTab('favorites')} style={{ background: 'none', border: 'none', color: '#b5a79e', cursor: 'pointer', fontFamily: 'inherit' }}>Saved Favorites</button></li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#d4a373', fontWeight: 700, marginBottom: '1.25rem' }}>Bakehouse Hours</h4>
          <p style={{ fontSize: '0.9rem', marginBottom: '0.4rem', color: '#e6ded3' }}>🕒 Monday – Sunday: 7:00 AM – 9:00 PM</p>
          <p style={{ fontSize: '0.88rem', color: '#a3958b' }}>⚡ Fresh bakes coming out of the oven every morning at sunrise.</p>
        </div>

        <div>
          <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#d4a373', fontWeight: 700, marginBottom: '1.25rem' }}>Atelier Contact</h4>
          <p style={{ fontSize: '0.9rem', marginBottom: '0.4rem', color: '#e6ded3' }}>📞 Phone: +91 98765 43210</p>
          <p style={{ fontSize: '0.9rem', marginBottom: '0.4rem', color: '#e6ded3' }}>✉️ Email: atelier@sugarrushbakes.co</p>
        </div>
      </div>

      <div className="srb-container" style={{ borderTop: '1px solid #362c26', paddingTop: '2rem', textAlign: 'center', fontSize: '0.85rem', color: '#82746b' }}>
        <p>© 2026 Ovenly Atelier by Sugar Rush Bakes. Crafted with warmth & butter.</p>
      </div>
    </footer>
  );
}
