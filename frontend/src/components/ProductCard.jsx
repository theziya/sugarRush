import React from 'react';

const FALLBACK_IMAGE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300" fill="%23f1f5f9"><rect width="400" height="300"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="40">🎂</text><text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" fill="%2394a3b8">Sugar Rush Bakes</text></svg>`;

export default function ProductCard({ product, onAddToCart, cartQty = 0, onUpdateQty, isFavorite, onToggleFavorite }) {
  const price = product.starting_price || product.offer_price || 500;
  const isBestSeller = product.is_featured || product.is_best_seller;

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = FALLBACK_IMAGE_SVG;
  };

  return (
    <div className="srb-product-card animate-fade">
      <div className="srb-card-img-wrapper">
        <img 
          src={product.thumbnail_image || product.main_image || FALLBACK_IMAGE_SVG} 
          alt={product.product_name} 
          className="srb-card-img"
          onError={handleImageError}
          loading="lazy"
        />
        <button 
          className={`srb-fav-btn ${isFavorite ? 'active' : ''}`}
          onClick={() => onToggleFavorite(product.name)}
          title={isFavorite ? "Remove from Favorites" : "Save to Favorites"}
          aria-label="Toggle Favorite"
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
      </div>

      <div className="srb-card-body">
        <div className="srb-card-tag">
          {product.category || product.category_name || 'Artisan Bake'} {isBestSeller && '• 🔥 Bestseller'}
        </div>
        <h3 className="srb-card-title">{product.product_name}</h3>
        <p className="srb-card-desc">{product.short_description}</p>
        
        <div className="srb-card-foot">
          <div className="srb-price-box">
            <span className="srb-price-main">₹{price}</span>
            {product.offer_price && <span className="srb-price-original">₹{product.starting_price}</span>}
          </div>

          {cartQty > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--primary-soft)', padding: '0.35rem 0.6rem', borderRadius: 'var(--radius-md)' }}>
              <button 
                onClick={() => onUpdateQty(product.name, -1)}
                style={{ border: 'none', background: 'white', color: 'var(--primary)', width: '26px', height: '26px', borderRadius: '999px', cursor: 'pointer', fontWeight: 900, boxShadow: 'var(--shadow-sm)' }}
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--primary)', padding: '0 0.2rem' }}>{cartQty}</span>
              <button 
                onClick={() => onUpdateQty(product.name, 1)}
                style={{ border: 'none', background: 'white', color: 'var(--primary)', width: '26px', height: '26px', borderRadius: '999px', cursor: 'pointer', fontWeight: 900, boxShadow: 'var(--shadow-sm)' }}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          ) : (
            <button 
              className="srb-btn srb-btn-primary" 
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              onClick={() => onAddToCart(product)}
            >
              + Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
