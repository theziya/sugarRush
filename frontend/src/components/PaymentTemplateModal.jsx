import React, { useState, useEffect } from 'react';
import { fetchCustomerDetails, createNewCustomer } from '../api';

export default function PaymentTemplateModal({
  isOpen,
  onClose,
  initialData = {},
  onSavePayment
}) {
  // Form State
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerDetails, setCustomerDetails] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustMobile, setNewCustMobile] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustPincode, setNewCustPincode] = useState('');

  // Payment Form State
  const [totalAmount, setTotalAmount] = useState(initialData.totalAmount || 0);
  const [amountPaid, setAmountPaid] = useState(initialData.amountPaid || 0);
  const [paymentMethod, setPaymentMethod] = useState(initialData.paymentMethod || 'UPI');
  const [paymentDate, setPaymentDate] = useState(
    initialData.paymentDate || new Date().toISOString().split('T')[0]
  );
  const [paymentStatus, setPaymentStatus] = useState(initialData.paymentStatus || 'Pending');
  const [transactionRef, setTransactionRef] = useState(initialData.transactionRef || '');
  const [paymentProofImage, setPaymentProofImage] = useState(initialData.paymentProofImage || null);
  const [notes, setNotes] = useState(initialData.notes || '');

  // UI Feedback
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state when initialData or isOpen changes
  useEffect(() => {
    if (isOpen) {
      setTotalAmount(initialData.totalAmount || 0);
      setAmountPaid(initialData.amountPaid || 0);
      setPaymentMethod(initialData.paymentMethod || 'UPI');
      setPaymentDate(initialData.paymentDate || new Date().toISOString().split('T')[0]);
      setPaymentStatus(initialData.paymentStatus || 'Pending');
      setTransactionRef(initialData.transactionRef || '');
      setPaymentProofImage(initialData.paymentProofImage || null);
      setNotes(initialData.notes || '');
      setErrors({});
      setSuccessMessage('');
      
      if (initialData.customer_name) {
        setCustomerSearch(initialData.customer_name);
        setCustomerDetails({
          customer_name: initialData.customer_name,
          mobile_number: initialData.mobile_number || '',
          email: initialData.email || '',
          address: initialData.address || '',
          pincode: initialData.pincode || ''
        });
      } else {
        setCustomerSearch('');
        setCustomerDetails(null);
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  // Real-time calculations
  const parsedTotal = Math.max(0, parseFloat(totalAmount) || 0);
  const parsedPaid = Math.max(0, parseFloat(amountPaid) || 0);
  const balanceDue = Math.max(0, parsedTotal - parsedPaid);

  // Dynamic Customer Search Handler
  const handleCustomerSearchChange = async (e) => {
    const val = e.target.value;
    setCustomerSearch(val);
    setErrors(prev => ({ ...prev, customer: null }));

    // Requirement 1: If user clears/erases customer name, clear customer details immediately
    if (!val || !val.trim()) {
      setCustomerDetails(null);
      setIsSearching(false);
      return;
    }

    // Lookup customer details if name/mobile has at least 2 chars
    if (val.trim().length >= 2) {
      setIsSearching(true);
      try {
        const cust = await fetchCustomerDetails(val.trim());
        if (cust) {
          setCustomerDetails(cust);
        } else {
          // If query doesn't match any customer, clear stale details
          setCustomerDetails(null);
        }
      } catch (err) {
        console.error("Lookup error:", err);
      } finally {
        setIsSearching(false);
      }
    } else {
      setCustomerDetails(null);
    }
  };

  // Requirement 2: New Customer Creation Handler
  const handleSaveNewCustomer = async (e) => {
    e.preventDefault();
    const custErrs = {};
    if (!newCustName.trim()) custErrs.newCustName = "Customer name is required.";
    if (!newCustMobile.trim() || newCustMobile.trim().length < 10) {
      custErrs.newCustMobile = "Valid 10-digit mobile number is required.";
    }

    if (Object.keys(custErrs).length > 0) {
      setErrors(custErrs);
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    try {
      const newCust = await createNewCustomer({
        customer_name: newCustName.trim(),
        mobile_number: newCustMobile.trim(),
        email: newCustEmail.trim(),
        address: newCustAddress.trim(),
        pincode: newCustPincode.trim()
      });

      if (newCust) {
        setCustomerSearch(newCust.customer_name);
        setCustomerDetails({
          customer_name: newCust.customer_name,
          mobile_number: newCust.mobile_number,
          email: newCust.email,
          address: newCust.address,
          pincode: newCust.pincode
        });
        setIsCreatingCustomer(false);
        setNewCustName('');
        setNewCustMobile('');
        setNewCustEmail('');
        setNewCustAddress('');
        setNewCustPincode('');
        setSuccessMessage(`Customer "${newCust.customer_name}" created & selected successfully!`);
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err) {
      setErrors({ newCust: err.message || "Failed to create customer." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validation
  const validateForm = () => {
    const errs = {};
    if (!customerDetails || !customerDetails.customer_name) {
      errs.customer = "Please select or create a valid customer.";
    }

    if (parseFloat(totalAmount) <= 0 || isNaN(parseFloat(totalAmount))) {
      errs.totalAmount = "Total amount must be greater than 0.";
    }

    if (parseFloat(amountPaid) < 0 || isNaN(parseFloat(amountPaid))) {
      errs.amountPaid = "Amount paid cannot be negative.";
    }

    if (!paymentMethod) {
      errs.paymentMethod = "Please select a payment method.";
    }

    if (!paymentDate) {
      errs.paymentDate = "Payment date is required.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSuccessMessage('');
    try {
      const payload = {
        customer_name: customerDetails.customer_name,
        mobile_number: customerDetails.mobile_number,
        email: customerDetails.email,
        address: customerDetails.address,
        pincode: customerDetails.pincode,
        total_amount: parsedTotal,
        amount_paid: parsedPaid,
        balance_due: balanceDue,
        payment_method: paymentMethod,
        payment_date: paymentDate,
        payment_status: paymentStatus,
        transaction_ref: transactionRef,
        payment_proof_image: paymentProofImage,
        notes: notes
      };

      if (onSavePayment) {
        await onSavePayment(payload);
      }
      setSuccessMessage("Payment recorded successfully!");
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 1500);
    } catch (err) {
      setErrors({ submit: err.message || "Failed to save payment." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="srb-drawer-overlay" onClick={onClose} />
      <div className="srb-modal animate-fade" style={{ maxWidth: '640px', padding: '2rem', borderRadius: '24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--dark)' }}>
              💳 Payment & Checkout Portal
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Manage customer details, payment amounts, and transaction verification.
            </p>
          </div>
          <button onClick={onClose} className="srb-icon-btn" aria-label="Close Portal">✕</button>
        </div>

        {/* Global Feedback Banners */}
        {successMessage && (
          <div style={{ padding: '0.8rem 1rem', background: 'var(--success-soft)', color: 'var(--success)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontWeight: 700, border: '1px solid #a7f3d0' }}>
            ✅ {successMessage}
          </div>
        )}

        {errors.submit && (
          <div style={{ padding: '0.8rem 1rem', background: 'var(--error-soft)', color: 'var(--error)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontWeight: 700, border: '1px solid #fecaca' }}>
            ⚠️ {errors.submit}
          </div>
        )}

        {/* SECTION 1: CUSTOMER SELECTION & DETAILS */}
        <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--dark)' }}>1. Customer Details</h3>
            <button 
              type="button" 
              className="srb-btn srb-btn-outline" 
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
              onClick={() => setIsCreatingCustomer(!isCreatingCustomer)}
            >
              {isCreatingCustomer ? '← Back to Search' : '+ New Customer'}
            </button>
          </div>

          {isCreatingCustomer ? (
            <form onSubmit={handleSaveNewCustomer} style={{ borderTop: '1px dashed var(--border)', paddingTop: '0.8rem', marginTop: '0.4rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label className="srb-form-label">Customer Name *</label>
                  <input 
                    className="srb-input" 
                    placeholder="e.g. Rachel Green" 
                    value={newCustName}
                    onChange={e => setNewCustName(e.target.value)}
                  />
                  {errors.newCustName && <p className="srb-form-error">{errors.newCustName}</p>}
                </div>
                <div>
                  <label className="srb-form-label">Mobile Number *</label>
                  <input 
                    className="srb-input" 
                    placeholder="9876543210" 
                    value={newCustMobile}
                    onChange={e => setNewCustMobile(e.target.value)}
                  />
                  {errors.newCustMobile && <p className="srb-form-error">{errors.newCustMobile}</p>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label className="srb-form-label">Email</label>
                  <input 
                    className="srb-input" 
                    type="email"
                    placeholder="rachel@example.com" 
                    value={newCustEmail}
                    onChange={e => setNewCustEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="srb-form-label">Pincode</label>
                  <input 
                    className="srb-input" 
                    placeholder="600001" 
                    value={newCustPincode}
                    onChange={e => setNewCustPincode(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label className="srb-form-label">Address</label>
                <input 
                  className="srb-input" 
                  placeholder="Street, Locality, Flat No" 
                  value={newCustAddress}
                  onChange={e => setNewCustAddress(e.target.value)}
                />
              </div>

              {errors.newCust && <p className="srb-form-error" style={{ marginBottom: '0.5rem' }}>{errors.newCust}</p>}

              <button type="submit" className="srb-btn srb-btn-primary" style={{ width: '100%', fontSize: '0.85rem' }} disabled={isSubmitting}>
                {isSubmitting ? 'Saving Customer...' : 'Save & Select New Customer'}
              </button>
            </form>
          ) : (
            <>
              <div className="srb-form-group" style={{ marginBottom: '0.75rem' }}>
                <label className="srb-form-label">Search Customer by Name or Mobile *</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    className="srb-input" 
                    placeholder="Type name or 10-digit mobile number..."
                    value={customerSearch}
                    onChange={handleCustomerSearchChange}
                    style={{ paddingRight: customerSearch ? '2.5rem' : '1rem' }}
                  />
                  {customerSearch && (
                    <button
                      type="button"
                      onClick={() => handleCustomerSearchChange({ target: { value: '' } })}
                      title="Clear Customer & Reset Details"
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: '#e2e8f0',
                        border: 'none',
                        borderRadius: '999px',
                        width: '20px',
                        height: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#475569'
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
                {isSearching && <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Searching database...</span>}
                {errors.customer && <p className="srb-form-error">{errors.customer}</p>}
              </div>

              {/* Dynamic Customer Details Display */}
              {customerDetails ? (
                <div style={{ background: 'white', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>Name:</span>
                    <strong style={{ color: 'var(--dark)' }}>{customerDetails.customer_name}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>Mobile:</span>
                    <strong style={{ color: 'var(--dark)' }}>{customerDetails.mobile_number || 'N/A'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>Email:</span>
                    <span style={{ color: 'var(--dark)' }}>{customerDetails.email || 'None'}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>Address & Pincode:</span>
                    <span style={{ color: 'var(--dark)' }}>{customerDetails.address ? `${customerDetails.address} (${customerDetails.pincode || ''})` : 'No address saved'}</span>
                  </div>
                </div>
              ) : (
                customerSearch.trim().length > 0 && !isSearching && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    No customer found with "{customerSearch}". Click "+ New Customer" above to create one.
                  </p>
                )
              )}
            </>
          )}
        </div>

        {/* SECTION 2: PAYMENT & CALCULATIONS */}
        <form onSubmit={handleSubmit}>
          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--dark)', marginBottom: '0.8rem' }}>2. Payment Breakdown</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="srb-form-label">Total Invoice Amount (₹) *</label>
                <input 
                  type="number"
                  min="0"
                  step="0.01"
                  className="srb-input" 
                  value={totalAmount}
                  onChange={e => {
                    setTotalAmount(e.target.value);
                    setErrors(prev => ({ ...prev, totalAmount: null }));
                  }}
                />
                {errors.totalAmount && <p className="srb-form-error">{errors.totalAmount}</p>}
              </div>

              <div>
                <label className="srb-form-label">Amount Paid (₹) *</label>
                <input 
                  type="number"
                  min="0"
                  step="0.01"
                  className="srb-input" 
                  value={amountPaid}
                  onChange={e => {
                    const val = e.target.value;
                    setAmountPaid(val);
                    setErrors(prev => ({ ...prev, amountPaid: null }));
                    const paidVal = parseFloat(val) || 0;
                    const totVal = parseFloat(totalAmount) || 0;
                    if (paidVal >= totVal && totVal > 0) {
                      setPaymentStatus('Paid');
                    } else if (paidVal > 0) {
                      setPaymentStatus('Partially Paid');
                    } else {
                      setPaymentStatus('Pending');
                    }
                  }}
                />
                {errors.amountPaid && <p className="srb-form-error">{errors.amountPaid}</p>}
              </div>
            </div>

            {/* Dynamic Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ background: 'white', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Total Amount</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--dark)' }}>₹{parsedTotal.toFixed(2)}</span>
              </div>
              <div style={{ background: 'white', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Amount Paid</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--success)' }}>₹{parsedPaid.toFixed(2)}</span>
              </div>
              <div style={{ background: balanceDue > 0 ? '#fff1f2' : '#f0fdf4', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: `1px solid ${balanceDue > 0 ? '#fecaca' : '#bbf7d0'}`, textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Balance Due</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 900, color: balanceDue > 0 ? 'var(--primary)' : 'var(--success)' }}>₹{balanceDue.toFixed(2)}</span>
              </div>
            </div>

            {/* SECTION 3: PAYMENT METHOD & DETAILS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="srb-form-label">Payment Method *</label>
                <select 
                  className="srb-select"
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                >
                  <option value="UPI">📲 UPI / QR Code</option>
                  <option value="COD">💵 Cash on Delivery (COD)</option>
                  <option value="Razorpay">💳 Razorpay Online</option>
                  <option value="Bank">🏦 Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="srb-form-label">Payment Status *</label>
                <select 
                  className="srb-select"
                  value={paymentStatus}
                  onChange={e => setPaymentStatus(e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Partially Paid">Partially Paid</option>
                  <option value="Paid">Paid</option>
                  <option value="Needs Verification">Needs Verification</option>
                </select>
              </div>
            </div>

            {/* Owner UPI Scanner & ID Display Block */}
            {paymentMethod === 'UPI' && (
              <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-soft)', marginBottom: '1rem', textAlign: 'center' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--dark)', marginBottom: '0.4rem' }}>
                  📲 Scan & Pay to Bakery Owner UPI
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>
                  Scan using Google Pay, PhonePe, Paytm or any UPI app to transfer ₹{parsedPaid || parsedTotal}
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.8rem' }}>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=ziyafazal1@oksbi&pn=ZIYA%20FAZAL%20B&am=${parsedPaid || parsedTotal}&cu=INR&tn=Sugar%20Rush%20Payment`)}&color=000000&bgcolor=ffffff`}
                    alt="Owner UPI QR Code Scanner"
                    style={{ width: '180px', height: '180px', borderRadius: '12px', border: '2px solid var(--border)', padding: '6px', background: 'white' }}
                  />
                </div>

                <div style={{ background: '#f1f5f9', padding: '0.6rem 1rem', borderRadius: 'var(--radius-sm)', display: 'inline-flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', fontWeight: 800 }}>
                  <span>UPI ID: <strong style={{ color: 'var(--primary)' }}>ziyafazal1@oksbi</strong></span>
                  <button 
                    type="button" 
                    className="srb-btn srb-btn-secondary" 
                    style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
                    onClick={() => {
                      navigator.clipboard.writeText("ziyafazal1@oksbi");
                      alert("Copied UPI ID: ziyafazal1@oksbi");
                    }}
                  >
                    Copy UPI ID 📋
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="srb-form-label">Payment Date *</label>
                <input 
                  type="date"
                  className="srb-input"
                  value={paymentDate}
                  onChange={e => setPaymentDate(e.target.value)}
                />
              </div>

              <div>
                <label className="srb-form-label">Transaction / UTR Ref</label>
                <input 
                  className="srb-input"
                  placeholder="e.g. 12-digit UTR or Razorpay ID"
                  value={transactionRef}
                  onChange={e => setTransactionRef(e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <label className="srb-form-label">Upload Payment Proof Screenshot (Image Attachment)</label>
              <input 
                type="file" 
                accept="image/*"
                className="srb-input"
                onChange={e => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (evt) => setPaymentProofImage(evt.target.result);
                    reader.readAsDataURL(file);
                  }
                }}
              />
              {paymentProofImage && (
                <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img src={paymentProofImage} alt="Payment Proof Preview" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border)' }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 'bold' }}>✓ Image proof attached!</span>
                  <button type="button" onClick={() => setPaymentProofImage(null)} style={{ border: 'none', background: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}>Remove</button>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              className="srb-btn srb-btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="srb-btn srb-btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing Payment...' : 'Save & Confirm Payment 💳'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
