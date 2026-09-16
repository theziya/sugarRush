import React, { useState, useEffect, useRef } from 'react';

export default function QuickSearchModal({ isOpen, onClose, products, onSelectProduct, onAddToCart, cart = [], onUpdateQty }) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedCategory('All');
      setPriceFilter('all');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickTags = ['Chocolate', 'Bento', 'Brownies', 'Mango', 'Eggless', 'Caramel', 'Truffle'];

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category || p.category_name).filter(Boolean)))];

  // Filtering logic
  let filtered = products.filter(p => {
    const q = query.toLowerCase().trim();
    const matchesQuery = !q || 
      (p.product_name && p.product_name.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.short_description && p.short_description.toLowerCase().includes(q)) ||
      (p.default_egg_type && p.default_egg_type.toLowerCase().includes(q)) ||
      (p.serves && p.serves.toLowerCase().includes(q));

    const matchesCategory = selectedCategory === 'All' || 
      (selectedCategory === 'Eggless' ? p.default_egg_type === 'Eggless' : (p.category === selectedCategory || p.category_name === selectedCategory));

    const price = parseFloat(p.offer_price) || parseFloat(p.starting_price) || 0;
    let matchesPrice = true;
    if (priceFilter === 'under300') matchesPrice = price < 300;
    else if (priceFilter === '300to500') matchesPrice = price >= 300 && price <= 500;
    else if (priceFilter === 'above500') matchesPrice = price > 500;

    return matchesQuery && matchesCategory && matchesPrice;
  });

  // Sorting logic
  if (sortBy === 'price-low') {
    filtered.sort((a, b) => (parseFloat(a.starting_price) || 0) - (parseFloat(b.starting_price) || 0));
  } else if (sortBy === 'price-high') {
    filtered.sort((a, b) => (parseFloat(b.starting_price) || 0) - (parseFloat(a.starting_price) || 0));
  }

  // Highlight helper
  const highlightMatch = (text, term) => {
    if (!term.trim() || !text) return text;
    const parts = text.split(new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === term.toLowerCase() 
        ? <mark key={i} className="srb-search-highlight">{part}</mark> 
        : part
    );
  };

  return (
    <>
      <div className="srb-drawer-overlay animate-fade" onClick={onClose} />
      <div className="srb-search-modal animate-fade" role="dialog" aria-modal="true" aria-label="Search Gourmet Bakes">
        {/* Header Search Input */}
        <div className="srb-search-header">
          <div className="srb-search-input-wrapper">
            <span className="srb-search-modal-icon">🔍</span>
            <input 
              ref={inputRef}
              className="srb-search-input" 
              placeholder="Search gourmet cakes, bento, brownies, tubs..." 
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {query && (
              <button 
                className="srb-search-clear-btn" 
                onClick={() => setQuery('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          <button onClick={onClose} className="srb-search-close-btn" title="Close (Esc)">
            ✕
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="srb-search-chips-row">
          <span className="srb-search-chips-label">Popular:</span>
          {quickTags.map(tag => (
            <button 
              key={tag}
              className={`srb-search-chip ${query.toLowerCase() === tag.toLowerCase() ? 'active' : ''}`}
              onClick={() => setQuery(tag)}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Category & Filters Bar */}
        <div className="srb-search-filter-row">
          <div className="srb-search-cats">
            {categories.map(cat => (
              <button
                key={cat}
                className={`srb-search-cat-pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="srb-search-controls">
            <select 
              className="srb-search-select" 
              value={priceFilter}
              onChange={e => setPriceFilter(e.target.value)}
            >
              <option value="all">All Prices</option>
              <option value="under300">Under ₹300</option>
              <option value="300to500">₹300 - ₹500</option>
              <option value="above500">Above ₹500</option>
            </select>

            <select 
              className="srb-search-select" 
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="default">Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Results Counter */}
        <div className="srb-search-meta">
          <span>{filtered.length} {filtered.length === 1 ? 'bake' : 'bakes'} found</span>
          {query && <span style={{ color: 'var(--text-muted)' }}>for "{query}"</span>}
        </div>

        {/* Results Container */}
        <div className="srb-search-results-list">
          {filtered.length === 0 ? (
            <div className="srb-search-empty">
              <div className="srb-search-empty-icon">🍰</div>
              <h3>No bakes matching your search</h3>
              <p>Try searching for "Chocolate", "Brownie", "Bento", or browse our categories above.</p>
              <button 
                className="srb-btn srb-btn-outline" 
                onClick={() => { setQuery(''); setSelectedCategory('All'); setPriceFilter('all'); }}
                style={{ marginTop: '1rem', borderRadius: 'var(--radius-full)' }}
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            filtered.map(p => {
              const price = parseFloat(p.offer_price) || parseFloat(p.starting_price) || 0;
              const cartItem = cart.find(i => i.name === p.name);
              const cartQty = cartItem ? cartItem.qty : 0;

              return (
                <div 
                  key={p.name || p.product_name} 
                  className="srb-search-item-card"
                  onClick={() => { onSelectProduct(p); onClose(); }}
                >
                  <img 
                    src={p.thumbnail_image || p.main_image || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600'} 
                    alt={p.product_name} 
                    className="srb-search-item-img"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600'; }}
                  />
                  
                  <div className="srb-search-item-details">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <span className="srb-search-item-cat">{p.category || 'Bakes'}</span>
                      {p.default_egg_type === 'Eggless' && (
                        <span className="srb-search-eggless-badge">🌱 Eggless</span>
                      )}
                    </div>
                    
                    <h4 className="srb-search-item-title">
                      {highlightMatch(p.product_name, query)}
                    </h4>
                    
                    <p className="srb-search-item-desc">
                      {highlightMatch(p.short_description || '', query)}
                    </p>
                  </div>

                  <div className="srb-search-item-action">
                    <span className="srb-search-item-price">₹{price}</span>
                    {cartQty > 0 ? (
                      <div 
                        style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--primary-soft)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-md)' }} 
                        onClick={e => e.stopPropagation()}
                      >
                        <button 
                          onClick={() => onUpdateQty(p.name, -1)}
                          style={{ border: 'none', background: 'white', color: 'var(--primary)', width: '22px', height: '22px', borderRadius: '50%', cursor: 'pointer', fontWeight: 900, boxShadow: 'var(--shadow-sm)' }}
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--primary)', minWidth: '16px', textAlign: 'center' }}>{cartQty}</span>
                        <button 
                          onClick={() => onUpdateQty(p.name, 1)}
                          style={{ border: 'none', background: 'white', color: 'var(--primary)', width: '22px', height: '22px', borderRadius: '50%', cursor: 'pointer', fontWeight: 900, boxShadow: 'var(--shadow-sm)' }}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button 
                        className="srb-btn srb-btn-primary srb-search-add-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onAddToCart) {
                            onAddToCart(p);
                          } else {
                            onSelectProduct(p);
                            onClose();
                          }
                        }}
                      >
                        + Add
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Hint */}
        <div className="srb-search-footer-hint">
          <span>Press <kbd>ESC</kbd> to exit search</span>
        </div>
      </div>
    </>
  );
}

