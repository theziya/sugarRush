import React, { useState } from 'react';

export default function Navbar({ activeTab, setActiveTab, cartCount, favoritesCount, onOpenSearch, onOpenPaymentPortal }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="srb-nav">
      <div className="srb-container srb-nav-inner">
        <a href="#" className="srb-logo" onClick={() => setActiveTab('menu')}>
          🍰 Sugar Rush Bakes
        </a>

        <div className={`srb-nav-menu ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <button 
            className={`srb-nav-link ${activeTab === 'menu' ? 'active' : ''}`}
            onClick={() => { setActiveTab('menu'); setMobileMenuOpen(false); }}
          >
            Menu & Bakes
          </button>
          <button 
            className={`srb-nav-link ${activeTab === 'custom' ? 'active' : ''}`}
            onClick={() => { setActiveTab('custom'); setMobileMenuOpen(false); }}
          >
            Custom Cakes Wizard
          </button>
          <button 
            className={`srb-nav-link ${activeTab === 'track' ? 'active' : ''}`}
            onClick={() => { setActiveTab('track'); setMobileMenuOpen(false); }}
          >
            Track Order
          </button>
          <button 
            className={`srb-nav-link ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => { setActiveTab('favorites'); setMobileMenuOpen(false); }}
          >
            Saved ❤️ ({favoritesCount})
          </button>
        </div>

        <div className="srb-nav-actions">
          <a 
            href="/desk" 
            className="srb-btn srb-btn-secondary" 
            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
            title="Admin Login & Desk Dashboard"
          >
            🔐 Admin Login
          </a>

          <button 
            className="srb-icon-btn" 
            onClick={onOpenSearch} 
            title="Search Products (Cmd + K)"
            aria-label="Search Menu"
          >
            🔍
          </button>

          <button 
            className="srb-btn srb-btn-primary" 
            onClick={() => setActiveTab('cart')}
            aria-label="View Shopping Cart"
          >
            🛒 Cart
            {cartCount > 0 && <span style={{ background: 'white', color: 'var(--primary)', borderRadius: '999px', padding: '0.1rem 0.5rem', fontSize: '0.8rem', fontWeight: 800 }}>{cartCount}</span>}
          </button>

          <button 
            className="srb-icon-btn" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ display: 'none' }}
            className="srb-mobile-toggle srb-icon-btn"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>
    </nav>
  );
}
