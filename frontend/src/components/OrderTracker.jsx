import React, { useState } from 'react';

export default function OrderTracker({ onTrackOrder, loading }) {
  const [orderId, setOrderId] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    setErrorMsg(null);

    const res = await onTrackOrder(orderId.trim());
    if (res && res.error) {
      setErrorMsg(res.error);
      setOrderData(null);
    } else if (res) {
      setOrderData(res);
    }
  };

  const getStepActive = (status, target) => {
    const statuses = ['Placed', 'Confirmed', 'In Preparation', 'Ready for Pickup', 'Out for Delivery', 'Delivered'];
    const currentIdx = statuses.indexOf(status);
    const targetIdx = statuses.indexOf(target);
    return currentIdx >= targetIdx;
  };

  return (
    <div className="srb-container animate-fade" style={{ padding: '4rem 1.5rem', maxWidth: '680px', margin: '0 auto' }}>
      <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '2.5rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 900, textAlign: 'center', marginBottom: '0.4rem' }}>Real-time Order Status Tracker</h2>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '2rem', fontSize: '0.92rem' }}>Enter your Order ID (e.g. SRB-ORD-2026-00001) to view baking progress and delivery tracking.</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
          <input 
            className="srb-input" 
            placeholder="Enter Order ID..." 
            value={orderId}
            onChange={e => setOrderId(e.target.value)}
          />
          <button type="submit" className="srb-btn srb-btn-primary" disabled={loading}>
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>

        {errorMsg && (
          <div style={{ padding: '1rem', background: 'var(--error-soft)', color: 'var(--error)', borderRadius: 'var(--radius-md)', textAlign: 'center', fontWeight: 700, border: '1px solid #fecaca' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {orderData && !errorMsg && (
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Order #{orderData.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Customer: {orderData.customer_name || 'Valued Guest'}</p>
              </div>
              <div style={{ background: 'var(--primary-soft)', color: 'var(--primary)', padding: '0.4rem 1rem', borderRadius: '999px', fontWeight: 800, fontSize: '0.85rem' }}>
                {orderData.order_status || 'In Preparation'}
              </div>
            </div>

            {/* Timeline Progress */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingLeft: '1rem', borderLeft: '3px solid var(--primary-soft)' }}>
              {['Placed', 'In Preparation', 'Ready for Pickup', 'Delivered'].map((st, idx) => {
                const isActive = getStepActive(orderData.order_status || 'In Preparation', st);
                return (
                  <div key={st} style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: isActive ? 1 : 0.4 }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '999px', background: isActive ? 'var(--primary)' : 'var(--border)', margin: '0 -1.45rem 0 0' }} />
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{st}</span>
                    {isActive && <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 800 }}>✓ Done</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
