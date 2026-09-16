import React from 'react';

const FALLBACK_IMAGE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300" fill="%23f1f5f9"><rect width="400" height="300"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="40">🎂</text><text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" fill="%2394a3b8">Sugar Rush Bakes</text></svg>`;

export default function ProductCard({ product, onAddToCart, cartQty = 0, onUpdateQty, isFavorite, onToggleFavorite, onSelectProduct }) {
  const basePrice = parseFloat(product.starting_price) || 0;
  const rawOfferPrice = parseFloat(product.offer_price) || 0;
  const hasValidOffer = rawOfferPrice > 0 && rawOfferPrice !== basePrice;
  const activePrice = hasValidOffer ? rawOfferPrice : basePrice;

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = FALLBACK_IMAGE_SVG;
  };

  const handleCardClick = (e) => {
    if (e.target.closest('.srb-fav-btn') || e.target.closest('.srb-card-action-btn')) return;
    if (onSelectProduct) {
      onSelectProduct(product);
    }
  };

  return (
    <div 
      className="srb-product-card animate-fade" 
      onClick={handleCardClick}
    >
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
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(product.name);
          }}
          title={isFavorite ? "Remove from Favorites" : "Save to Favorites"}
          aria-label="Toggle Favorite"
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
      </div>

      <div className="srb-card-body">
        <h3 className="srb-card-serif-title">{product.product_name}</h3>
        <p className="srb-card-serif-desc">{product.short_description}</p>

        <div className="srb-card-foot" onClick={e => e.stopPropagation()}>
          <div className="srb-price-box">
            <span className="srb-price-main">₹{activePrice}</span>
            {hasValidOffer && <span className="srb-price-original">₹{basePrice}</span>}
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
              className="srb-btn srb-btn-serif-small srb-card-action-btn" 
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
            >
              Add to Cart 🛒
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
