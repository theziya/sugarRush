import React, { useState, useEffect } from 'react';
import { fetchProductDetails } from '../api';

const FALLBACK_IMAGE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450" fill="%23f1f5f9"><rect width="600" height="450"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="60">🎂</text><text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" fill="%2394a3b8">Sugar Rush Bakes</text></svg>`;

export default function ProductDetailModal({
  productName,
  isOpen,
  onClose,
  initialProduct = null,
  onAddToCart,
  cartQty = 0,
  onUpdateQty
}) {
  const [productData, setProductData] = useState(initialProduct);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [qty, setQty] = useState(1);

  // Synchronize and fetch full Product DocType data when modal opens
  useEffect(() => {
    if (!isOpen || !productName) return;

    // Reset local selections
    setSelectedAddons([]);
    setQty(1);

    // If initialProduct already has child tables loaded (gallery, variants, addons), reuse it!
    const hasChildTables = initialProduct && (
      Array.isArray(initialProduct.gallery) ||
      Array.isArray(initialProduct.variants) ||
      Array.isArray(initialProduct.addons)
    );

    if (hasChildTables) {
      setupProductDetails(initialProduct);
    } else {
      // Fetch complete Product DocType with child tables from Frappe REST API
      let isMounted = true;
      setLoading(true);
      fetchProductDetails(productName).then((doc) => {
        if (!isMounted) return;
        if (doc) {
          setupProductDetails(doc);
        } else if (initialProduct) {
          setupProductDetails(initialProduct);
        }
        setLoading(false);
      }).catch((err) => {
        console.error("Error fetching product modal data:", err);
        if (isMounted) {
          if (initialProduct) setupProductDetails(initialProduct);
          setLoading(false);
        }
      });

      return () => {
        isMounted = false;
      };
    }
  }, [isOpen, productName, initialProduct]);

  const setupProductDetails = (doc) => {
    setProductData(doc);
    
    // Setup Main Image
    const mainImg = doc.main_image || doc.thumbnail_image || FALLBACK_IMAGE_SVG;
    setSelectedImage(mainImg);

    // Setup Default Variant if available
    const activeVariants = (doc.variants || []).filter(v => v.is_active !== 0);
    if (activeVariants.length > 0) {
      const defaultVar = activeVariants.find(v => v.is_default === 1) || activeVariants[0];
      setSelectedVariant(defaultVar);
    } else {
      setSelectedVariant(null);
    }
  };

  if (!isOpen || !productName) return null;

  const currentDoc = productData || initialProduct || {};

  // Gallery images logic
  const mainImg = currentDoc.main_image || currentDoc.thumbnail_image || FALLBACK_IMAGE_SVG;
  const galleryItems = (currentDoc.gallery || [])
    .filter(g => g.image)
    .map(g => g.image);

  const allImages = Array.from(new Set([mainImg, ...galleryItems].filter(Boolean)));

  // Pricing calculations
  const baseStartingPrice = parseFloat(currentDoc.starting_price) || 0;
  const rawOfferPrice = parseFloat(currentDoc.offer_price) || 0;
  const hasValidOffer = rawOfferPrice > 0 && rawOfferPrice !== baseStartingPrice;
  const effectiveBasePrice = hasValidOffer ? rawOfferPrice : baseStartingPrice;

  // Variant adjustment
  const variantAdjustment = selectedVariant ? (parseFloat(selectedVariant.price_adjustment) || 0) : 0;

  // Add-ons total
  const addonsTotal = selectedAddons.reduce((sum, addon) => sum + (parseFloat(addon.price) || 0), 0);

  // Unit final price
  const finalUnitPrice = Math.max(0, effectiveBasePrice + variantAdjustment + addonsTotal);
  const totalItemPrice = finalUnitPrice * qty;

  const handleToggleAddon = (addon) => {
    setSelectedAddons(prev => {
      const exists = prev.some(a => a.name === addon.name || a.addon_name === addon.addon_name);
      if (exists) {
        return prev.filter(a => (a.name || a.addon_name) !== (addon.name || addon.addon_name));
      } else {
        return [...prev, addon];
      }
    });
  };

  const handleAddToCartClick = () => {
    const itemToAdd = {
      ...currentDoc,
      selected_variant: selectedVariant ? selectedVariant.variant_label : null,
      selected_addons: selectedAddons.map(a => a.addon_name),
      starting_price: finalUnitPrice,
      qty: qty
    };
    if (onAddToCart) {
      onAddToCart(itemToAdd);
    }
    onClose();
  };

  const activeVariants = (currentDoc.variants || []).filter(v => v.is_active !== 0);
  const activeAddons = (currentDoc.addons || []).filter(a => a.is_active !== 0);

  return (
    <>
      <div className="srb-drawer-overlay animate-fade" onClick={onClose} style={{ zIndex: 1000 }} />
      <div 
        className="srb-modal animate-scale" 
        style={{ 
          maxWidth: '820px', 
          width: '92%', 
          maxHeight: '90vh', 
          overflowY: 'auto', 
          padding: '0', 
          borderRadius: '24px', 
          zIndex: 1001,
          background: 'white'
        }}
      >
        {loading && !productData ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <span style={{ fontSize: '2rem' }}>🍰</span>
            <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Loading bake details...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }} className="srb-product-modal-grid">
            {/* Left Image & Gallery Section */}
            <div style={{ background: '#f8fafc', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderRight: '1px solid var(--border)' }}>
              <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', borderRadius: '16px', overflow: 'hidden', background: '#e2e8f0' }}>
                <img 
                  src={selectedImage || mainImg} 
                  alt={currentDoc.product_name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE_SVG; }}
                />
                {currentDoc.category && (
                  <span style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(4px)', padding: '0.25rem 0.65rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--dark)' }}>
                    {currentDoc.category}
                  </span>
                )}
              </div>

              {/* Gallery Carousel Thumbnails */}
              {allImages.length > 1 && (
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                  {allImages.map((imgUrl, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedImage(imgUrl)}
                      style={{
                        border: selectedImage === imgUrl ? '2px solid var(--primary)' : '2px solid transparent',
                        borderRadius: '10px',
                        padding: '0',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        width: '56px',
                        height: '56px',
                        flexShrink: 0,
                        background: '#e2e8f0'
                      }}
                    >
                      <img src={imgUrl} alt={`Gallery ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              )}

              {/* Product Specifications Pills */}
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: 'auto', paddingTop: '0.5rem' }}>
                {currentDoc.product_weight_label && (
                  <span style={{ fontSize: '0.78rem', background: 'white', border: '1px solid var(--border)', color: '#475569', padding: '0.3rem 0.6rem', borderRadius: '8px', fontWeight: 600 }}>
                    ⚖️ {currentDoc.product_weight_label}
                  </span>
                )}
                {currentDoc.default_egg_type && (
                  <span style={{ fontSize: '0.78rem', background: currentDoc.default_egg_type === 'Eggless' ? '#d1fae5' : '#fef3c7', color: currentDoc.default_egg_type === 'Eggless' ? '#065f46' : '#92400e', padding: '0.3rem 0.6rem', borderRadius: '8px', fontWeight: 700 }}>
                    {currentDoc.default_egg_type === 'Eggless' ? '🌱 Eggless' : '🥚 Contains Egg'}
                  </span>
                )}
                {currentDoc.serves && (
                  <span style={{ fontSize: '0.78rem', background: '#f3e8ff', color: '#6b21a8', padding: '0.3rem 0.6rem', borderRadius: '8px', fontWeight: 600 }}>
                    👥 {currentDoc.serves}
                  </span>
                )}
              </div>
            </div>

            {/* Right Information & Options Section */}
            <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative' }}>
              <button 
                onClick={onClose} 
                className="srb-icon-btn" 
                style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', zIndex: 2 }}
                aria-label="Close"
              >
                ✕
              </button>

              <div>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--dark)', paddingRight: '2rem', marginBottom: '0.35rem' }}>
                  {currentDoc.product_name}
                </h2>
                
                {/* Dynamic Pricing Display */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginTop: '0.2rem' }}>
                  <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary)' }}>
                    ₹{finalUnitPrice.toFixed(2)}
                  </span>

                  {hasValidOffer ? (
                    <span style={{ fontSize: '1rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                      ₹{baseStartingPrice.toFixed(2)}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Product Description */}
              {(currentDoc.short_description || currentDoc.description) && (
                <div style={{ fontSize: '0.88rem', color: '#475569', lineHeight: '1.5', background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                  {currentDoc.short_description || currentDoc.description.replace(/<[^>]*>?/gm, '')}
                </div>
              )}

              {/* Variants Child Table Options */}
              {activeVariants.length > 0 && (
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--dark)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Select Option / Size:
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {activeVariants.map((v, idx) => {
                      const isSelected = selectedVariant && (selectedVariant.name === v.name || selectedVariant.variant_label === v.variant_label);
                      const adj = parseFloat(v.price_adjustment) || 0;
                      return (
                        <button
                          key={v.name || idx}
                          type="button"
                          onClick={() => setSelectedVariant(v)}
                          style={{
                            padding: '0.5rem 0.85rem',
                            borderRadius: '10px',
                            border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                            background: isSelected ? 'var(--primary-soft)' : 'white',
                            color: isSelected ? 'var(--primary)' : 'var(--dark)',
                            fontWeight: isSelected ? 800 : 600,
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {v.variant_label} {adj !== 0 && `(${adj > 0 ? '+' : ''}₹${adj})`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add-ons Child Table Options */}
              {activeAddons.length > 0 && (
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--dark)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Optional Add-ons:
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {activeAddons.map((addon, idx) => {
                      const isChecked = selectedAddons.some(a => (a.name || a.addon_name) === (addon.name || addon.addon_name));
                      return (
                        <label
                          key={addon.name || idx}
                          style={{
                            display: 'flex',
                            justify: 'space-between',
                            alignItems: 'center',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '10px',
                            border: isChecked ? '1px solid var(--primary)' : '1px solid var(--border)',
                            background: isChecked ? '#fff5f5' : 'white',
                            cursor: 'pointer',
                            fontSize: '0.82rem'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input 
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleAddon(addon)}
                              style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
                            />
                            <span style={{ fontWeight: 700, color: 'var(--dark)' }}>{addon.addon_name}</span>
                          </div>
                          <span style={{ fontWeight: 800, color: 'var(--primary)' }}>+₹{addon.price}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Selector & Add to Cart Footer */}
              <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#f1f5f9', padding: '0.35rem 0.6rem', borderRadius: '12px' }}>
                  <button 
                    type="button"
                    onClick={() => setQty(prev => Math.max(1, prev - 1))}
                    style={{ border: 'none', background: 'white', color: 'var(--dark)', width: '30px', height: '30px', borderRadius: '8px', cursor: 'pointer', fontWeight: 900, boxShadow: 'var(--shadow-sm)' }}
                  >
                    -
                  </button>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', padding: '0 0.4rem', color: 'var(--dark)' }}>{qty}</span>
                  <button 
                    type="button"
                    onClick={() => setQty(prev => prev + 1)}
                    style={{ border: 'none', background: 'white', color: 'var(--dark)', width: '30px', height: '30px', borderRadius: '8px', cursor: 'pointer', fontWeight: 900, boxShadow: 'var(--shadow-sm)' }}
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  className="srb-btn srb-btn-primary"
                  style={{ flex: 1, padding: '0.8rem 1.25rem', fontSize: '0.95rem', fontWeight: 800 }}
                  onClick={handleAddToCartClick}
                >
                  Add {qty} to Order • ₹{totalItemPrice.toFixed(2)}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
