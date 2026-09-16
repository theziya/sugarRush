import React, { useState } from 'react';

export default function CustomCakeBuilder({ onSubmitCustomCake, addToast }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    customer_name: '',
    mobile_number: '',
    email: '',
    cake_theme: '',
    cake_flavour: 'Belgium Chocolate Truffle',
    cake_weight_kg: 1.5,
    egg_type: 'Eggless',
    delivery_date: '',
    address_line_1: '',
    pincode: '',
    special_instructions: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const flavors = [
    'Belgium Chocolate Truffle',
    'Vanilla Buttercream & Berries',
    'Alphonso Mango Cream',
    'Salted Caramel Fudge',
    'Red Velvet Cream Cheese',
    'Biscoff Lotus Crunch'
  ];

  const validateStep = (currentStep) => {
    const errs = {};
    if (currentStep === 1) {
      if (!formData.cake_theme.trim()) errs.cake_theme = "Please describe your cake theme or design idea";
    } else if (currentStep === 2) {
      if (!formData.delivery_date) errs.delivery_date = "Select expected delivery date";
      if (!formData.address_line_1.trim()) errs.address_line_1 = "Address is required for delivery quote";
      if (!formData.pincode.trim() || formData.pincode.length < 6) errs.pincode = "Valid 6-digit pincode required";
    } else if (currentStep === 3) {
      if (!formData.customer_name.trim()) errs.customer_name = "Customer name is required";
      if (!formData.mobile_number.trim() || formData.mobile_number.length < 10) errs.mobile_number = "Valid 10-digit mobile number required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setSubmitting(true);
    try {
      await onSubmitCustomCake(formData);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="srb-custom-form-card animate-fade" style={{ maxWidth: '680px', margin: '0 auto', background: 'white', padding: '2.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
      {/* Wizard Progress Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', position: 'relative' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
            <div style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '999px', 
              background: step >= i ? 'var(--primary)' : '#e2e8f0', 
              color: step >= i ? 'white' : 'var(--text-muted)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontWeight: 800, 
              fontSize: '0.9rem',
              boxShadow: step >= i ? '0 4px 10px rgba(225, 29, 72, 0.3)' : 'none'
            }}>
              {i}
            </div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, marginTop: '0.4rem', color: step >= i ? 'var(--dark)' : 'var(--text-muted)' }}>
              {i === 1 ? 'Design & Flavour' : i === 2 ? 'Schedule & Location' : 'Contact Details'}
            </span>
          </div>
        ))}
      </div>

      {step === 1 && (
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Step 1: Design & Flavor Options</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Customize flavor, theme, dietary preferences, and cake size.</p>

          <div className="srb-form-group">
            <label className="srb-form-label">Cake Theme / Style Description *</label>
            <input 
              className="srb-input" 
              placeholder="e.g. Elegant pastel floral cake with gold foil accents" 
              value={formData.cake_theme}
              onChange={e => setFormData({ ...formData, cake_theme: e.target.value })}
            />
            {errors.cake_theme && <p className="srb-form-error">{errors.cake_theme}</p>}
          </div>

          <div className="srb-form-group">
            <label className="srb-form-label">Flavour Preference *</label>
            <select 
              className="srb-select"
              value={formData.cake_flavour}
              onChange={e => setFormData({ ...formData, cake_flavour: e.target.value })}
            >
              {flavors.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="srb-form-group">
              <label className="srb-form-label">Approx Weight ({formData.cake_weight_kg} Kg)</label>
              <input 
                type="range" 
                min="0.5" 
                max="5" 
                step="0.5"
                value={formData.cake_weight_kg} 
                onChange={e => setFormData({ ...formData, cake_weight_kg: parseFloat(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--primary)', height: '8px' }}
              />
            </div>
            <div className="srb-form-group">
              <label className="srb-form-label">Dietary Preference</label>
              <select 
                className="srb-select"
                value={formData.egg_type}
                onChange={e => setFormData({ ...formData, egg_type: e.target.value })}
              >
                <option value="Eggless">🌱 100% Eggless</option>
                <option value="Egg">🥚 Contains Egg</option>
              </select>
            </div>
          </div>

          <button className="srb-btn srb-btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={handleNext}>
            Next: Schedule & Location →
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Step 2: Delivery Schedule & Address</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Specify delivery date and location for accurate quote computation.</p>

          <div className="srb-form-group">
            <label className="srb-form-label">Required Delivery Date *</label>
            <input 
              type="date" 
              className="srb-input" 
              value={formData.delivery_date}
              onChange={e => setFormData({ ...formData, delivery_date: e.target.value })}
            />
            {errors.delivery_date && <p className="srb-form-error">{errors.delivery_date}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div className="srb-form-group">
              <label className="srb-form-label">Address Line 1 *</label>
              <input 
                className="srb-input" 
                placeholder="House/Flat No, Street, Locality" 
                value={formData.address_line_1}
                onChange={e => setFormData({ ...formData, address_line_1: e.target.value })}
              />
              {errors.address_line_1 && <p className="srb-form-error">{errors.address_line_1}</p>}
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

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button className="srb-btn srb-btn-secondary" onClick={() => setStep(1)}>← Back</button>
            <button className="srb-btn srb-btn-primary" style={{ flexGrow: 1 }} onClick={handleNext}>Next: Contact Info →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Step 3: Contact & Submit</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Provide your contact info so our head baker can reach you with a quote.</p>

          <form onSubmit={handleSubmit}>
            <div className="srb-form-group">
              <label className="srb-form-label">Your Name *</label>
              <input 
                className="srb-input" 
                placeholder="Sarah Jenkins" 
                value={formData.customer_name}
                onChange={e => setFormData({ ...formData, customer_name: e.target.value })}
              />
              {errors.customer_name && <p className="srb-form-error">{errors.customer_name}</p>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="srb-form-group">
                <label className="srb-form-label">WhatsApp Mobile Number *</label>
                <input 
                  className="srb-input" 
                  placeholder="9876543210" 
                  value={formData.mobile_number}
                  onChange={e => setFormData({ ...formData, mobile_number: e.target.value })}
                />
                {errors.mobile_number && <p className="srb-form-error">{errors.mobile_number}</p>}
              </div>
              <div className="srb-form-group">
                <label className="srb-form-label">Email Address</label>
                <input 
                  type="email" 
                  className="srb-input" 
                  placeholder="sarah@example.com" 
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="button" className="srb-btn srb-btn-secondary" onClick={() => setStep(2)}>← Back</button>
              <button type="submit" className="srb-btn srb-btn-primary" style={{ flexGrow: 1 }} disabled={submitting}>
                {submitting ? 'Submitting Inquiry...' : 'Submit Custom Cake Inquiry 🎂'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
