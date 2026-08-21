import React, { useState } from 'react';
import { fetchCustomerDetails } from '../api';
import UpiQrModal from './UpiQrModal';

export default function CheckoutModal({ isOpen, onClose, cartTotals, onSubmitOrder }) {
  const [formData, setFormData] = useState({
    customer_name: '',
    mobile_number: '',
    email: '',
    address: '',
    pincode: '',
    delivery_date: '',
    payment_method: 'UPI',
    special_notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [autoFetched, setAutoFetched] = useState(false);
  const [errors, setErrors] = useState({});
  const [showQrModal, setShowQrModal] = useState(false);

  if (!isOpen) return null;

  const handleLookup = async (queryVal) => {
    if (!queryVal || queryVal.length < 3) return;
    const cust = await fetchCustomerDetails(queryVal);
    if (cust) {
      setFormData(prev => ({
        ...prev,
        customer_name: cust.customer_name || prev.customer_name,
        mobile_number: cust.mobile_number || prev.mobile_number,
        email: cust.email || prev.email,
        address: cust.address || prev.address,
        pincode: cust.pincode || prev.pincode
      }));
      setAutoFetched(true);
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.customer_name.trim()) errs.customer_name = "Full name is required";
    if (!formData.mobile_number.trim() || formData.mobile_number.length < 10) errs.mobile_number = "Valid 10-digit mobile number required";
    if (!formData.address.trim()) errs.address = "Delivery address is required";
    if (!formData.pincode.trim() || formData.pincode.length < 6) errs.pincode = "6-digit Pincode required";
    if (!formData.delivery_date) errs.delivery_date = "Delivery date is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (formData.payment_method === 'UPI') {
      setShowQrModal(true);
      return;
    }

    proceedWithSubmission();
  };

  const proceedWithSubmission = async (paymentDetails = {}) => {
    setSubmitting(true);
    try {
      await onSubmitOrder({
        ...formData,
        address_line_1: formData.address,
        grand_total: cartTotals.grandTotal,
        subtotal: cartTotals.subtotal,
        discount_amount: cartTotals.discount,
        delivery_charge: cartTotals.deliveryCharge,
        upi_transaction_id: paymentDetails.utrNumber || '',
        payment_proof_image: paymentDetails.screenshotPreview || '',
        customer_notes: paymentDetails.utrNumber ? `UPI UTR / Ref: ${paymentDetails.utrNumber}` : ''
      });
      setShowQrModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="srb-drawer-overlay" onClick={onClose} />
      <div className="srb-modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Complete Your Delivery & Payment Details</h2>
            {autoFetched && <span style={{ color: 'var(--success)', fontSize: '0.8rem', fontWeight: 800 }}>✨ Existing customer details auto-filled!</span>}
          </div>
          <button onClick={onClose} className="srb-icon-btn">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="srb-form-group">
            <label className="srb-form-label">Full Name (Auto-detects returning customers) *</label>
            <input 
              className="srb-input" 
              placeholder="e.g. Eleanor Vance" 
              value={formData.customer_name}
              onChange={e => {
                const val = e.target.value;
                setFormData({ ...formData, customer_name: val });
                handleLookup(val);
              }}
            />
            {errors.customer_name && <p className="srb-form-error">{errors.customer_name}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="srb-form-group">
              <label className="srb-form-label">Mobile Number *</label>
              <input 
                className="srb-input" 
                placeholder="9876543210" 
                value={formData.mobile_number}
                onChange={e => {
                  const val = e.target.value;
                  setFormData({ ...formData, mobile_number: val });
                  if (val.length >= 10) handleLookup(val);
                }}
              />
              {errors.mobile_number && <p className="srb-form-error">{errors.mobile_number}</p>}
            </div>
            <div className="srb-form-group">
              <label className="srb-form-label">Email Address</label>
              <input 
                className="srb-input" 
                type="email"
                placeholder="eleanor@example.com" 
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div className="srb-form-group">
              <label className="srb-form-label">Delivery Address *</label>
              <input 
                className="srb-input" 
                placeholder="Flat / House No, Street, Locality" 
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
              />
              {errors.address && <p className="srb-form-error">{errors.address}</p>}
            </div>
            <div className="srb-form-group">
              <label className="srb-form-label">Pincode *</label>
              <input 
                className="srb-input" 
                placeholder="600001" 
                value={formData.pincode}
                onChange={e => setFormData({ ...formData, pincode: e.target.value })}
              />
              {errors.pincode && <p className="srb-form-error">{errors.pincode}</p>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="srb-form-group">
              <label className="srb-form-label">Preferred Delivery Date *</label>
              <input 
                className="srb-input" 
                type="date"
                value={formData.delivery_date}
                onChange={e => setFormData({ ...formData, delivery_date: e.target.value })}
              />
              {errors.delivery_date && <p className="srb-form-error">{errors.delivery_date}</p>}
            </div>

            <div className="srb-form-group">
              <label className="srb-form-label">Payment Method *</label>
              <select 
                className="srb-select"
                value={formData.payment_method}
                onChange={e => setFormData({ ...formData, payment_method: e.target.value })}
              >
                <option value="UPI">📲 Instant UPI QR Code</option>
                <option value="COD">💵 Cash on Delivery (COD)</option>
              </select>
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem' }}>
              <span>Total Payable Amount:</span>
              <span style={{ color: 'var(--primary)' }}>₹{cartTotals.grandTotal}</span>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Selected method: {formData.payment_method === 'UPI' ? 'Instant UPI QR Code' : 'Cash on Delivery (COD)'}</span>
          </div>

          <button type="submit" className="srb-btn srb-btn-primary" style={{ width: '100%' }} disabled={submitting}>
            {submitting ? 'Processing Order...' : formData.payment_method === 'UPI' ? 'Pay via UPI QR Code 📲' : 'Confirm & Place Order 🎉'}
          </button>
        </form>

        {/* Instant UPI QR Code Modal */}
        <UpiQrModal 
          isOpen={showQrModal}
          onClose={() => setShowQrModal(false)}
          amount={cartTotals.grandTotal}
          orderId="NEW"
          onConfirmPayment={(paymentDetails) => proceedWithSubmission(paymentDetails)}
        />
      </div>
    </>
  );
}
