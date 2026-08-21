import React from 'react';

export default function Footer({ setActiveTab }) {
  return (
    <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '4rem 0 2rem', marginTop: '5rem', borderTop: '1px solid #1e293b' }}>
      <div className="srb-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
        <div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🍰 Sugar Rush Bakes
          </div>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Boutique cloud bakery crafting gourmet celebration cakes, bento boxes, brownies, and dessert tubs daily.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <span style={{ background: '#1e293b', padding: '0.5rem 0.8rem', borderRadius: '8px', color: 'white', fontSize: '0.85rem' }}>📍 Main Kitchen</span>
          </div>
        </div>

        <div>
          <h4 style={{ color: 'white', fontWeight: 800, marginBottom: '1rem' }}>Quick Links</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
            <li><button onClick={() => setActiveTab('menu')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>Menu & Bakes</button></li>
            <li><button onClick={() => setActiveTab('custom')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>Custom Cake Wizard</button></li>
            <li><button onClick={() => setActiveTab('track')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>Track Order Status</button></li>
            <li><button onClick={() => setActiveTab('favorites')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>Saved Favorites</button></li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: 'white', fontWeight: 800, marginBottom: '1rem' }}>Bakery Timings</h4>
          <p style={{ fontSize: '0.88rem', marginBottom: '0.4rem' }}>🕒 Monday – Sunday: 9:00 AM – 10:00 PM</p>
          <p style={{ fontSize: '0.88rem', marginBottom: '0.4rem' }}>⚡ Minimum 24-48 Hours Advance Order for Custom Designs</p>
        </div>

        <div>
          <h4 style={{ color: 'white', fontWeight: 800, marginBottom: '1rem' }}>Contact & Support</h4>
          <p style={{ fontSize: '0.88rem', marginBottom: '0.4rem' }}>📞 Phone / WhatsApp: +91 98765 43210</p>
          <p style={{ fontSize: '0.88rem', marginBottom: '0.4rem' }}>✉️ Email: hello@sugarrushbakes.co</p>
        </div>
      </div>

      <div className="srb-container" style={{ borderTop: '1px solid #1e293b', paddingTop: '2rem', textAlign: 'center', fontSize: '0.85rem' }}>
        <p>© 2026 Sugar Rush Bakes. All rights reserved. Powered by Frappe Framework.</p>
      </div>
    </footer>
  );
}
