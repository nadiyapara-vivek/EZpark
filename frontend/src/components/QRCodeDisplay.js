import React, { useState } from 'react';

/**
 * QRCodeDisplay - Renders a booking QR code from a base64 data URL
 * The QR encodes booking details for scanner-based entry/exit
 */
const QRCodeDisplay = ({ qrCode, bookingId, size = 200 }) => {
  const [enlarged, setEnlarged] = useState(false);

  if (!qrCode) {
    return (
      <div style={{
        width: size, height: size,
        background: '#0f172a',
        border: '1px solid #334155',
        borderRadius: 12,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        color: '#475569', fontSize: '0.8rem', gap: 8
      }}>
        <span style={{ fontSize: '2rem' }}>🔲</span>
        <span>QR not available</span>
      </div>
    );
  }

  return (
    <>
      <div
        onClick={() => setEnlarged(true)}
        style={{
          width: size, height: size,
          background: '#ffffff',
          borderRadius: 12,
          padding: 8,
          cursor: 'pointer',
          border: '2px solid #00d4aa',
          transition: 'transform 0.2s',
          display: 'inline-block'
        }}
        title="Click to enlarge"
      >
        <img
          src={qrCode}
          alt={`QR Code for ${bookingId}`}
          style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
        />
      </div>
      <div style={{ textAlign: 'center', marginTop: 6, fontSize: '0.75rem', color: '#64748b' }}>
        Tap to enlarge · Show at entry/exit
      </div>

      {/* Enlarged modal */}
      {enlarged && (
        <div
          onClick={() => setEnlarged(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <div style={{
            background: '#fff',
            padding: 24, borderRadius: 16,
            boxShadow: '0 25px 80px rgba(0,0,0,0.5)'
          }} onClick={e => e.stopPropagation()}>
            <img src={qrCode} alt="QR Code" style={{ width: 280, height: 280, display: 'block' }} />
            <div style={{ textAlign: 'center', marginTop: 12, color: '#334155', fontWeight: 700, fontSize: '0.9rem' }}>
              {bookingId}
            </div>
            <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.78rem', marginTop: 4 }}>
              Show this QR code at parking entry/exit
            </div>
          </div>
          <div style={{ color: '#94a3b8', marginTop: 16, fontSize: '0.85rem' }}>
            Tap anywhere to close
          </div>
        </div>
      )}
    </>
  );
};

export default QRCodeDisplay;