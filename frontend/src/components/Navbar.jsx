import React, { useState } from 'react';

export default function Navbar({ activeTab, setActiveTab, cartCount, favoritesCount, onOpenSearch }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="srb-nav">
      <div className="srb-container srb-nav-inner">
        {/* Mobile Menu Toggle Button (Visible on mobile only) */}
        <button 
          className="srb-icon-btn srb-mobile-toggle" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        <a href="#" className="srb-atelier-logo" onClick={(e) => { e.preventDefault(); setActiveTab('menu'); }}>
          Sugar Rush Bakes
        </a>

        {/* Desktop Navigation Links */}
        <div className={`srb-nav-menu ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <button 
            className={`srb-nav-link ${activeTab === 'menu' ? 'active' : ''}`}
            onClick={() => { setActiveTab('menu'); setMobileMenuOpen(false); }}
          >
            Our Menu
          </button>
          <button 
            className={`srb-nav-link ${activeTab === 'custom' ? 'active' : ''}`}
            onClick={() => { setActiveTab('custom'); setMobileMenuOpen(false); }}
          >
            Custom Cakes
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
            Favorites {favoritesCount > 0 ? `(${favoritesCount})` : ''}
          </button>
        </div>

        {/* Action Controls & Search */}
        <div className="srb-nav-actions">
          <button 
            className="srb-nav-search-btn" 
            onClick={onOpenSearch} 
            title="Search Products (Cmd + K or Ctrl + K)"
            aria-label="Search Menu"
          >
            <span className="srb-search-icon">🔍</span>
            <span className="srb-search-label">Search...</span>
            <kbd className="srb-search-kbd">⌘K</kbd>
          </button>

          <button 
            className="srb-btn srb-btn-atelier-order" 
            onClick={() => setActiveTab('cart')}
            aria-label="View Shopping Cart"
          >
            Order Now {cartCount > 0 && `(${cartCount})`}
          </button>
        </div>
      </div>
    </nav>
  );
}

