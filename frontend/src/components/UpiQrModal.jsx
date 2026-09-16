import React, { useState } from 'react';
import { extractUtrFromScreenshot } from '../api';

export default function UpiQrModal({ isOpen, onClose, amount, orderId, onConfirmPayment }) {
  const [copied, setCopied] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [utrError, setUtrError] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [ocrCandidates, setOcrCandidates] = useState([]);
  const [ocrSuccessMsg, setOcrSuccessMsg] = useState('');
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const accountName = "ZIYA FAZAL B";
  const upiId = "ziyafazal1@oksbi";
  
  // Real dynamic UPI deep link & QR code generation matching Google Pay format
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(accountName)}&am=${amount}&cu=INR&tn=Sugar%20Rush%20Order%20${orderId || 'Bakes'}`;
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(upiUrl)}&color=000000&bgcolor=ffffff`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleUtrChange = (val) => {
    // Only allow numeric input
    const cleaned = val.replace(/\D/g, '').slice(0, 12);
    setUtrNumber(cleaned);
    
    if (cleaned.length === 0) {
      setUtrError('12-Digit UTR / Transaction ID is mandatory.');
    } else if (cleaned.length < 12) {
      setUtrError(`UTR must be exactly 12 digits (currently ${cleaned.length}/12).`);
    } else {
      setUtrError('');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setExtracting(true);
    setOcrSuccessMsg('');
    setOcrCandidates([]);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target.result;
      setScreenshotPreview(base64Data);

      // Perform OCR extraction via backend endpoint
      const result = await extractUtrFromScreenshot(base64Data);

      if (result && result.utrs && result.utrs.length > 0) {
        if (result.utrs.length === 1) {
          const found = result.utrs[0];
          setUtrNumber(found);
          setUtrError('');
          setOcrSuccessMsg(`✅ Extracted UTR: ${found} from screenshot! Please confirm.`);
        } else {
          setOcrCandidates(result.utrs);
          setUtrNumber(result.utrs[0]);
          setUtrError('');
          setOcrSuccessMsg(`Multiple 12-digit numbers detected. Please select the correct UTR.`);
        }
      } else {
        setOcrSuccessMsg('Could not detect 12-digit UTR automatically. Please enter the 12-digit UTR manually.');
      }
      setExtracting(false);
    };

    reader.readAsDataURL(file);
  };

  const handleConfirmSubmit = (e) => {
    e.preventDefault();
    if (!utrNumber || utrNumber.length !== 12) {
      setUtrError('12-Digit UTR / Transaction ID is mandatory and must be exactly 12 digits.');
      return;
    }

    setSubmitted(true);
    if (onConfirmPayment) {
      onConfirmPayment({ utrNumber, screenshotPreview });
    }
  };

  return (
    <>
      <div className="srb-drawer-overlay" onClick={onClose} />
      <div className="srb-modal animate-fade" style={{ maxWidth: '520px', padding: '2rem 1.5rem', textAlign: 'center', background: '#f8fafc', borderRadius: '24px' }}>
        
        {/* Header Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', boxShadow: '0 2px 8px rgba(16,185,129,0.3)' }}>
              Z
            </div>
            <div style={{ textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>{accountName}</h3>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Verified Bakery Merchant</span>
            </div>
          </div>
          <button onClick={onClose} className="srb-icon-btn" style={{ width: '36px', height: '36px' }}>✕</button>
        </div>

        {!submitted ? (
          <div>
            {/* Step 1: Frappe UI QR Code Payment Card */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '1.25rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px dashed #e2e8f0' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>Step 1: Scan & Pay</span>
                <span style={{ background: '#d1fae5', color: '#065f46', fontSize: '0.78rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '999px' }}>
                  Amount: ₹{amount}
                </span>
              </div>

              <div style={{ position: 'relative', display: 'inline-block', margin: '0 auto 0.8rem' }}>
                <img 
                  src={qrCodeImageUrl} 
                  alt="Ziya Fazal B UPI QR Code" 
                  style={{ width: '200px', height: '200px', display: 'block', borderRadius: '12px' }}
                />
                
                {/* Google Pay Center Badge */}
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 10px rgba(0,0,0,0.15)', border: '2px solid white' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12z" fill="#fff"/>
                    <path d="M17.3 10.3h-4.8v3.4h2.8c-.2 1.1-.9 2-2 2.6v2.1h3.2c1.9-1.7 3-4.3 3-7.4 0-.3 0-.5-.1-.7z" fill="#4285F4"/>
                    <path d="M12.5 15.2c-2.3 0-4.3-1.6-5-3.8H4.3v2.2c1.7 3.3 5.1 5.6 9 5.6 2.7 0 5-1 6.7-2.6l-3.2-2.1c-.9.6-2.1.9-3.4.9z" fill="#34A853"/>
                    <path d="M7.5 11.4c-.2-.6-.3-1.3-.3-2 0-.7.1-1.4.3-2V5.2H4.3C3.5 6.8 3 8.6 3 10.5c0 1.9.5 3.7 1.3 5.3l3.2-2.4z" fill="#FBBC05"/>
                    <path d="M12.5 5.7c1.5 0 2.8.5 3.8 1.5l2.9-2.9C17.5 2.6 15.2 1.7 12.5 1.7 8.6 1.7 5.2 4 3.5 7.3l3.2 2.4c.7-2.2 2.7-4 5-4z" fill="#EA4335"/>
                  </svg>
                </div>
              </div>

              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                UPI ID: <span style={{ color: '#0f172a', fontWeight: 900 }}>{upiId}</span>
              </div>

              <button 
                onClick={handleCopyUpi}
                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.35rem 0.9rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
              >
                {copied ? 'Copied to Clipboard ✓' : '📋 Copy UPI ID'}
              </button>
            </div>

            {/* Step 2: Upload Screenshot & OCR Automatic UTR Extraction */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '1.25rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: '1.25rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>Step 2: Payment Proof & Auto UTR Extraction</span>
                <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 700 }}>🔍 Smart OCR</span>
              </div>

              <label 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  border: '2px dashed #cbd5e1', 
                  borderRadius: '12px', 
                  padding: '1rem', 
                  cursor: 'pointer', 
                  background: '#f8fafc',
                  transition: 'all 0.2s' 
                }}
              >
                <span style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>📸</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>
                  {extracting ? '🔍 Extracting UTR via OCR...' : 'Upload Payment Screenshot'}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>PNG, JPG, or GPay / PhonePe receipt</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              </label>

              {ocrSuccessMsg && (
                <div style={{ marginTop: '0.6rem', padding: '0.6rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', fontSize: '0.8rem', color: '#1e40af', fontWeight: 700 }}>
                  {ocrSuccessMsg}
                </div>
              )}

              {/* Multiple Candidate Selection if extracted */}
              {ocrCandidates.length > 1 && (
                <div style={{ marginTop: '0.6rem' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>Select Extracted UTR Candidate:</label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
                    {ocrCandidates.map(cand => (
                      <button 
                        key={cand}
                        type="button"
                        onClick={() => { setUtrNumber(cand); setUtrError(''); }}
                        style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', border: utrNumber === cand ? '2px solid #2563eb' : '1px solid #cbd5e1', background: utrNumber === cand ? '#eff6ff' : 'white', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer' }}
                      >
                        {cand} {utrNumber === cand ? '✓' : ''}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Mandatory 12-Digit UTR Form Input */}
            <form onSubmit={handleConfirmSubmit} style={{ background: 'white', borderRadius: '20px', padding: '1.25rem', border: '1px solid #e2e8f0', textAlign: 'left' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="srb-form-label" style={{ fontSize: '0.85rem', color: '#0f172a' }}>
                  12-Digit UTR / Transaction ID <span style={{ color: '#ef4444' }}>* (Mandatory)</span>
                </label>
                <input 
                  className="srb-input" 
                  placeholder="Enter 12-digit UTR (e.g. 423456789012)" 
                  value={utrNumber}
                  onChange={e => handleUtrChange(e.target.value)}
                  maxLength={12}
                  style={{ 
                    fontSize: '1rem', 
                    fontWeight: 800, 
                    letterSpacing: '0.08em', 
                    borderColor: utrError ? '#ef4444' : utrNumber.length === 12 ? '#10b981' : '#cbd5e1' 
                  }}
                />
                {utrError && (
                  <p style={{ color: '#ef4444', fontSize: '0.78rem', fontWeight: 800, marginTop: '0.4rem' }}>
                    ⚠️ {utrError}
                  </p>
                )}
                {utrNumber.length === 12 && !utrError && (
                  <p style={{ color: '#10b981', fontSize: '0.78rem', fontWeight: 800, marginTop: '0.4rem' }}>
                    ✓ Valid 12-digit UTR entered
                  </p>
                )}
              </div>

              <button 
                type="submit" 
                className="srb-btn srb-btn-primary" 
                style={{ width: '100%', fontSize: '0.92rem', padding: '0.75rem' }}
                disabled={utrNumber.length !== 12}
              >
                Confirm & Submit Payment ₹{amount} ✓
              </button>
            </form>
          </div>
        ) : (
          <div style={{ padding: '2rem 1rem', background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '0.8rem' }}>✅</div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 900, marginBottom: '0.4rem', color: '#0f172a' }}>Payment Verification Submitted!</h3>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              Transaction UTR: <strong style={{ color: '#0f172a', fontSize: '1rem' }}>{utrNumber}</strong>
            </p>
            <div style={{ background: '#f8fafc', padding: '0.8rem', borderRadius: '12px', fontSize: '0.82rem', color: '#475569', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
              Status: <strong style={{ color: '#d97706' }}>Needs Verification / Pending</strong> in Frappe Desk
            </div>
            <button className="srb-btn srb-btn-primary" onClick={onClose} style={{ width: '100%' }}>
              Done & Return to Menu
            </button>
          </div>
        )}
      </div>
    </>
  );
}
