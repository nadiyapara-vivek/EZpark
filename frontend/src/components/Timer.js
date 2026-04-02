import React, { useState, useEffect, useCallback } from 'react';

/**
 * BookingTimer - Countdown timer for pending payment deadline
 * Shows 10-minute countdown, calls onExpired when time runs out
 */
const BookingTimer = ({ secondsRemaining: initialSeconds, onExpired, bookingId }) => {
  const [seconds, setSeconds] = useState(initialSeconds || 0);
  const [expired, setExpired] = useState(initialSeconds <= 0);

  useEffect(() => {
    setSeconds(initialSeconds || 0);
    setExpired(initialSeconds <= 0);
  }, [initialSeconds, bookingId]);

  const tick = useCallback(() => {
    setSeconds(prev => {
      if (prev <= 1) {
        setExpired(true);
        if (onExpired) onExpired();
        return 0;
      }
      return prev - 1;
    });
  }, [onExpired]);

  useEffect(() => {
    if (expired || seconds <= 0) return;
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expired, seconds, tick]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const progress = Math.min(100, (seconds / 600) * 100); // 600 = 10 min
  const isUrgent = seconds < 120; // < 2 minutes = urgent

  if (expired) {
    return (
      <div style={{
        background: 'rgba(239,68,68,0.1)',
        border: '1px solid #ef4444',
        borderRadius: 12,
        padding: '0.8rem 1.2rem',
        display: 'flex', alignItems: 'center', gap: 10,
        color: '#ef4444'
      }}>
        <span style={{ fontSize: '1.2rem' }}>⏰</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Payment deadline expired</div>
          <div style={{ fontSize: '0.78rem', opacity: 0.8 }}>This booking may have been auto-cancelled</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: isUrgent ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)',
      border: `1px solid ${isUrgent ? '#ef4444' : '#f59e0b'}`,
      borderRadius: 12,
      padding: '0.8rem 1.2rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '1.1rem', animation: isUrgent ? 'pulse 1s infinite' : 'none' }}>⏱️</span>
          <span style={{ fontWeight: 700, fontSize: '0.88rem', color: isUrgent ? '#ef4444' : '#f59e0b' }}>
            Complete payment before timeout
          </span>
        </div>
        <div style={{
          fontFamily: 'Syne, monospace',
          fontWeight: 800,
          fontSize: '1.4rem',
          color: isUrgent ? '#ef4444' : '#f59e0b',
          letterSpacing: 2
        }}>
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: '#334155', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: isUrgent ? '#ef4444' : '#f59e0b',
          borderRadius: 4,
          transition: 'width 1s linear'
        }} />
      </div>

      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 6 }}>
        Booking will be auto-cancelled if payment is not completed in time
      </div>
    </div>
  );
};

export default BookingTimer;