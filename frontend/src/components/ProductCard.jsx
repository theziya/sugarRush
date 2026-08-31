import React from 'react';

const FALLBACK_IMAGE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300" fill="%23f1f5f9"><rect width="400" height="300"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="40">🎂</text><text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" fill="%2394a3b8">Sugar Rush Bakes</text></svg>`;

export default function ProductCard({ product, onAddToCart, cartQty = 0, onUpdateQty, isFavorite, onToggleFavorite, onSelectProduct }) {
  const basePrice = parseFloat(product.starting_price) || 0;
  const rawOfferPrice = parseFloat(product.offer_price) || 0;
  const hasValidOffer = rawOfferPrice > 0 && rawOfferPrice !== basePrice;
  const activePrice = hasValidOffer ? rawOfferPrice : basePrice;

  const isBestSeller = product.is_featured || product.is_best_seller;

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = FALLBACK_IMAGE_SVG;
  };

  const handleCardClick = (e) => {
    // If user clicked fav button or add/update buttons, don't trigger modal
    if (e.target.closest('.srb-fav-btn') || e.target.closest('.srb-card-foot')) return;
    if (onSelectProduct) {
      onSelectProduct(product);
    }
  };

  return (
    <div 
      className="srb-product-card animate-fade" 
      onClick={handleCardClick}
      style={{ cursor: onSelectProduct ? 'pointer' : 'default' }}
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
        <div className="srb-card-tag">
          {product.category || product.category_name || 'Artisan Bake'} {isBestSeller && '• 🔥 Bestseller'}
        </div>
        <h3 className="srb-card-title">{product.product_name}</h3>
        <p className="srb-card-desc">{product.short_description}</p>
        
        {/* Product Details Meta Pills */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', margin: '0.5rem 0 0.75rem 0' }}>
          {product.product_weight_label && (
            <span style={{ fontSize: '0.72rem', background: '#f1f5f9', color: '#475569', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
              ⚖️ {product.product_weight_label}
            </span>
          )}
          {product.default_egg_type && (
            <span style={{ fontSize: '0.72rem', background: product.default_egg_type === 'Eggless' ? '#d1fae5' : '#fef3c7', color: product.default_egg_type === 'Eggless' ? '#065f46' : '#92400e', padding: '0.15rem 0.5rem', borderRadius: '74px', fontWeight: 700 }}>
              {product.default_egg_type === 'Eggless' ? '🌱 Eggless' : '🥚 Contains Egg'}
            </span>
          )}
          {product.serves && (
            <span style={{ fontSize: '0.72rem', background: '#f3e8ff', color: '#6b21a8', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
              👥 {product.serves}
            </span>
          )}
        </div>

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
