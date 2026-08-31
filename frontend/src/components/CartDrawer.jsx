import React, { useState } from 'react';

export default function CartDrawer({ isOpen, onClose, cart, updateQty, removeItem, onCheckout, subtotal }) {
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  if (!isOpen) return null;

  const deliveryCharge = subtotal > 1000 ? 0 : 50;
  const grandTotal = Math.max(0, subtotal - discount + deliveryCharge);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'WELCOME10') {
      setDiscount(Math.round(subtotal * 0.1));
      setCouponApplied(true);
    } else {
      alert("Invalid Coupon Code. Try 'WELCOME10' for 10% off.");
    }
  };

  return (
    <>
      <div className="srb-drawer-overlay" onClick={onClose} />
      <aside className="srb-drawer">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Your Cart ({cart.reduce((a, b) => a + b.qty, 0)})</h2>
          <button onClick={onClose} className="srb-icon-btn" aria-label="Close Cart">✕</button>
        </div>

        {cart.length === 0 ? (
          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
            <h3 style={{ fontWeight: 800, marginBottom: '0.4rem' }}>Your cart is empty</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Explore our fresh gourmet bakes and add items to your cart.</p>
            <button className="srb-btn srb-btn-primary" onClick={onClose}>Explore Menu</button>
          </div>
        ) : (
          <>
            <div style={{ flexGrow: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
              {cart.map(item => (
                <div key={item.name} style={{ display: 'flex', gap: '1rem', padding: '1rem 0', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                  <img src={item.thumbnail_image || item.main_image || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600'} alt={item.product_name} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                  <div style={{ flexGrow: 1 }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{item.product_name}</h4>
                    <p style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.9rem' }}>₹{item.unit_price || item.starting_price || 500}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '8px' }}>
                    <button onClick={() => updateQty(item.name, -1)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontWeight: 800 }}>-</button>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.name, 1)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontWeight: 800 }}>+</button>
                  </div>
                  <button onClick={() => removeItem(item.name)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--error)' }}>🗑️</button>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', marginTop: '1rem' }}>
              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <input 
                  className="srb-input" 
                  placeholder="Promo Code (try WELCOME10)" 
                  value={couponCode} 
                  onChange={e => setCouponCode(e.target.value)}
                  disabled={couponApplied}
                  style={{ padding: '0.6rem 0.8rem', fontSize: '0.85rem' }}
                />
                <button type="submit" className="srb-btn srb-btn-secondary" style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }} disabled={couponApplied}>
                  {couponApplied ? 'Applied ✓' : 'Apply'}
                </button>
              </form>

              <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Subtotal:</span>
                  <span>₹{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}>
                    <span>Coupon Discount:</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Delivery Charge:</span>
                  <span>{deliveryCharge === 0 ? <strong style={{ color: 'var(--success)' }}>FREE</strong> : `₹${deliveryCharge}`}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 900, color: 'var(--dark)', marginTop: '0.4rem', paddingTop: '0.4rem', borderTop: '1px dashed var(--border)' }}>
                  <span>Grand Total:</span>
                  <span style={{ color: 'var(--primary)' }}>₹{grandTotal}</span>
                </div>
              </div>

              <button className="srb-btn srb-btn-primary" style={{ width: '100%' }} onClick={() => onCheckout({ subtotal, discount, deliveryCharge, grandTotal })}>
                Proceed to Checkout →
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
