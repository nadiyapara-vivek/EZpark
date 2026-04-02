import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { getBooking, processPayment, validatePromo } from '../services/api';
import BookingTimer from '../components/Timer';

const METHODS = [
  { id: 'card', label: '💳 Credit / Debit Card' },
  { id: 'upi', label: '📱 UPI' },
  { id: 'netbanking', label: '🏦 Net Banking' },
  { id: 'wallet', label: '👛 Wallet' },
];

const Checkout = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState('card');
  const [paying, setPaying] = useState(false);

  // Promo state
  const [promoInput, setPromoInput] = useState('');
  const [promoApplied, setPromoApplied] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);

  // Timer
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  const fetchBooking = useCallback(() => {
    getBooking(bookingId)
      .then(({ data }) => {
        setBooking(data.booking);
        setSecondsRemaining(data.booking.secondsRemaining || 0);
        // Pre-fill promo if already applied on booking
        if (data.booking.promoCode) {
          setPromoApplied({
            code: data.booking.promoCode,
            discountAmount: data.booking.discountAmount
          });
        }
      })
      .catch(() => { toast.error('Booking not found'); navigate('/my-bookings'); })
      .finally(() => setLoading(false));
  }, [bookingId, navigate]);

  useEffect(() => { fetchBooking(); }, [fetchBooking]);

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    try {
      const { data } = await validatePromo({ code: promoInput.trim(), amount: booking?.totalAmount });
      setPromoApplied(data.promo);
      toast.success(`Promo applied! You save ₹${data.promo.discountAmount}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid promo code');
      setPromoApplied(null);
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoApplied(null);
    setPromoInput('');
  };

  const handlePay = async () => {
    setPaying(true);
    try {
      await processPayment(bookingId, {
        method,
        promoCode: promoApplied?.code || null
      });
      toast.success('Payment successful! 🎉');
      navigate(`/booking-success/${bookingId}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Payment failed';
      toast.error(msg);
      if (msg.toLowerCase().includes('cancel')) fetchBooking();
    } finally {
      setPaying(false);
    }
  };

  const finalAmount = promoApplied
    ? Math.max(0, (booking?.totalAmount || 0) - (promoApplied.discountAmount || 0))
    : booking?.finalAmount || booking?.totalAmount || 0;

  if (loading) return <div className="text-center py-5"><div className="spinner-ezp mx-auto" /></div>;

  return (
    <div className="page-wrapper">
      <Container>
        <div className="mb-4">
          <h2 className="section-title">Checkout</h2>
          <div className="section-divider" />
        </div>

        {/* Payment timer */}
        {booking?.status === 'pending' && secondsRemaining > 0 && (
          <div className="mb-4">
            <BookingTimer
              secondsRemaining={secondsRemaining}
              bookingId={bookingId}
              onExpired={() => {
                toast.error('Payment deadline expired. Booking auto-cancelled.');
                navigate('/my-bookings');
              }}
            />
          </div>
        )}

        {booking?.status === 'cancelled' && (
          <div className="mb-4 p-3 rounded" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: 10 }}>
            ⏰ This booking was auto-cancelled due to payment timeout.
          </div>
        )}

        <Row className="g-4 justify-content-center">
          {/* Order summary */}
          <Col lg={5}>
            <div className="ezp-card p-4 mb-4">
              <h5 className="mb-3" style={{ color: '#00d4aa' }}>Order Summary</h5>
              {[
                ['Booking ID', booking?.bookingId],
                ['Slot', booking?.slot?.slotNumber],
                ['Location', booking?.slot?.location],
                ['Vehicle', booking?.vehicleNumber],
                ['Start', new Date(booking?.startTime).toLocaleString()],
                ['End', new Date(booking?.endTime).toLocaleString()],
                ['Duration', `${booking?.duration} hour(s)`],
              ].map(([k, v]) => (
                <div key={k} className="d-flex justify-content-between py-2" style={{ borderBottom: '1px solid #1e293b', fontSize: '0.88rem' }}>
                  <span style={{ color: '#64748b' }}>{k}</span>
                  <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{v}</span>
                </div>
              ))}

              {/* Price breakdown */}
              <div className="mt-3 pt-2">
                <div className="d-flex justify-content-between" style={{ fontSize: '0.88rem', marginBottom: 6 }}>
                  <span style={{ color: '#94a3b8' }}>Subtotal</span>
                  <span style={{ color: '#e2e8f0' }}>₹{booking?.totalAmount}</span>
                </div>
                {promoApplied && (
                  <div className="d-flex justify-content-between" style={{ fontSize: '0.88rem', marginBottom: 6 }}>
                    <span style={{ color: '#22c55e' }}>Discount ({promoApplied.code})</span>
                    <span style={{ color: '#22c55e', fontWeight: 700 }}>-₹{promoApplied.discountAmount}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between pt-2" style={{ borderTop: '1px solid #334155' }}>
                  <span style={{ fontWeight: 700, fontSize: '1rem' }}>Total</span>
                  <span className="price-tag">₹{finalAmount}</span>
                </div>
              </div>
            </div>
          </Col>

          {/* Payment section */}
          <Col lg={5}>
            {/* Promo code input */}
            {!promoApplied ? (
              <div className="ezp-card p-4 mb-4">
                <h6 style={{ color: '#94a3b8', marginBottom: 10 }}>🏷️ Promo Code</h6>
                <div className="d-flex gap-2">
                  <input
                    className="form-control ezp-input"
                    placeholder="Enter promo code"
                    value={promoInput}
                    onChange={e => setPromoInput(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
                    style={{ flex: 1 }}
                  />
                  <button
                    className="btn btn-outline-ezp"
                    onClick={handleApplyPromo}
                    disabled={promoLoading || !promoInput.trim()}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {promoLoading ? <span className="spinner-border spinner-border-sm" /> : 'Apply'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="ezp-card p-3 mb-4" style={{ border: '1px solid #22c55e' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span style={{ color: '#22c55e', fontWeight: 700, fontSize: '0.9rem' }}>✅ {promoApplied.code}</span>
                    <span style={{ color: '#94a3b8', fontSize: '0.82rem', marginLeft: 8 }}>
                      {promoApplied.description || `Saving ₹${promoApplied.discountAmount}`}
                    </span>
                  </div>
                  <button onClick={handleRemovePromo} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
                </div>
              </div>
            )}

            {/* Payment method */}
            <div className="ezp-card p-4">
              <h5 className="mb-4" style={{ color: '#00d4aa' }}>Payment Method</h5>
              <div className="d-flex flex-column gap-3 mb-4">
                {METHODS.map((m) => (
                  <label key={m.id} style={{
                    display: 'flex', alignItems: 'center', gap: '0.8rem',
                    padding: '0.9rem 1rem', borderRadius: '10px', cursor: 'pointer',
                    border: method === m.id ? '1.5px solid #00d4aa' : '1px solid #334155',
                    background: method === m.id ? 'rgba(0,212,170,0.05)' : 'transparent',
                    transition: 'all 0.2s',
                  }}>
                    <input type="radio" name="method" value={m.id} checked={method === m.id} onChange={() => setMethod(m.id)} style={{ accentColor: '#00d4aa' }} />
                    <span style={{ fontSize: '0.92rem', fontWeight: 500 }}>{m.label}</span>
                  </label>
                ))}
              </div>

              {method === 'card' && (
                <div className="mb-4">
                  <div className="mb-3">
                    <label className="ezp-label">Card Number</label>
                    <input className="form-control ezp-input" readOnly defaultValue="4242 4242 4242 4242" />
                  </div>
                  <Row className="g-2">
                    <Col xs={6}><label className="ezp-label">Expiry</label><input className="form-control ezp-input" readOnly defaultValue="12/27" /></Col>
                    <Col xs={6}><label className="ezp-label">CVV</label><input className="form-control ezp-input" readOnly defaultValue="123" /></Col>
                  </Row>
                </div>
              )}
              {method === 'upi' && (
                <div className="mb-4">
                  <label className="ezp-label">UPI ID</label>
                  <input className="form-control ezp-input" defaultValue="demo@upi" readOnly />
                </div>
              )}

              <button
                className="btn btn-primary-ezp w-100"
                onClick={handlePay}
                disabled={paying || booking?.status === 'cancelled'}
              >
                {paying ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                {paying ? 'Processing...' : `Pay ₹${finalAmount}`}
              </button>
              <p style={{ color: '#475569', fontSize: '0.75rem', textAlign: 'center', marginTop: '0.8rem' }}>
                🔒 Secured with 256-bit SSL encryption
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Checkout;