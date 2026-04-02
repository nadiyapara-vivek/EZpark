import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { getSlot, createBooking, validatePromo } from '../services/api';
import { getUser } from '../utils/auth';
import MapView from '../components/MapView';

const Booking = () => {
  const { slotId } = useParams();
  const navigate = useNavigate();
  const user = getUser();
  const [slot, setSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const now = new Date();
  const minDate = now.toISOString().slice(0, 16);
  const defaultEnd = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16);

  const [form, setForm] = useState({
    vehicleNumber: user?.vehicleNumber || '',
    startTime: minDate,
    endTime: defaultEnd,
  });

  // Promo state
  const [promoInput, setPromoInput] = useState('');
  const [promoApplied, setPromoApplied] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);

  useEffect(() => {
    getSlot(slotId)
      .then(({ data }) => setSlot(data.slot))
      .catch(() => { toast.error('Slot not found'); navigate('/slots'); })
      .finally(() => setLoading(false));
  }, [slotId, navigate]);

  const duration = form.startTime && form.endTime
    ? Math.max(1, Math.ceil((new Date(form.endTime) - new Date(form.startTime)) / 3600000))
    : 0;
  const totalAmount = slot ? duration * slot.pricePerHour : 0;
  const discountAmount = promoApplied?.discountAmount || 0;
  const finalAmount = Math.max(0, totalAmount - discountAmount);

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    try {
      const { data } = await validatePromo({ code: promoInput.trim(), amount: totalAmount });
      // Recalculate discount based on current totalAmount
      setPromoApplied({ ...data.promo, discountAmount: data.promo.discountAmount });
      toast.success(`✅ Promo applied! You save ₹${data.promo.discountAmount}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid promo code');
      setPromoApplied(null);
    } finally {
      setPromoLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(form.endTime) <= new Date(form.startTime)) {
      toast.error('End time must be after start time');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await createBooking({
        slotId,
        ...form,
        promoCode: promoApplied?.code || undefined
      });
      toast.success('Booking created! Complete payment within 10 minutes.');
      navigate(`/checkout/${data.booking._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-ezp mx-auto" /></div>;

  return (
    <div className="page-wrapper">
      <Container>
        <div className="mb-4">
          <h2 className="section-title">Book a Slot</h2>
          <div className="section-divider" />
        </div>
        <Row className="g-4">
          {/* Booking Form */}
          <Col lg={7}>
            <div className="ezp-card p-4 mb-4">
              <h5 className="mb-4" style={{ color: '#00d4aa' }}>Booking Details</h5>
              <form onSubmit={handleSubmit}>
                {/* Vehicle number */}
                <div className="mb-3">
                  <label className="ezp-label">Vehicle Number</label>
                  <input
                    type="text" className="form-control ezp-input"
                    placeholder="e.g. GJ03AB1234"
                    value={form.vehicleNumber}
                    onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value.toUpperCase() })}
                    required
                  />
                </div>

                {/* Date/time */}
                <Row className="g-3 mb-3">
                  <Col xs={12} sm={6}>
                    <label className="ezp-label">Start Date & Time</label>
                    <input type="datetime-local" className="form-control ezp-input"
                      min={minDate} value={form.startTime}
                      onChange={(e) => setForm({ ...form, startTime: e.target.value })} required />
                  </Col>
                  <Col xs={12} sm={6}>
                    <label className="ezp-label">End Date & Time</label>
                    <input type="datetime-local" className="form-control ezp-input"
                      min={form.startTime} value={form.endTime}
                      onChange={(e) => setForm({ ...form, endTime: e.target.value })} required />
                  </Col>
                </Row>

                {/* Promo code */}
                <div className="mb-3">
                  <label className="ezp-label">Promo Code (optional)</label>
                  {!promoApplied ? (
                    <div className="d-flex gap-2">
                      <input
                        className="form-control ezp-input"
                        placeholder="e.g. SAVE20"
                        value={promoInput}
                        onChange={e => setPromoInput(e.target.value.toUpperCase())}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleApplyPromo())}
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-ezp"
                        onClick={handleApplyPromo}
                        disabled={promoLoading || !promoInput.trim() || totalAmount === 0}
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        {promoLoading ? <span className="spinner-border spinner-border-sm" /> : 'Apply'}
                      </button>
                    </div>
                  ) : (
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: 'rgba(34,197,94,0.08)', border: '1px solid #22c55e',
                      borderRadius: 10, padding: '0.6rem 1rem'
                    }}>
                      <span style={{ color: '#22c55e', fontWeight: 700 }}>✅ {promoApplied.code} — saving ₹{promoApplied.discountAmount}</span>
                      <button type="button" onClick={() => { setPromoApplied(null); setPromoInput(''); }}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
                    </div>
                  )}
                </div>

                {/* Price summary */}
                <div className="p-3 rounded mb-4" style={{ background: '#0f172a', border: '1px solid #334155' }}>
                  <div className="d-flex justify-content-between mb-1" style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                    <span>Duration</span>
                    <span style={{ color: '#e2e8f0' }}>{duration} hour{duration !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-1" style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                    <span>Rate</span>
                    <span style={{ color: '#e2e8f0' }}>₹{slot?.pricePerHour}/hr</span>
                  </div>
                  <div className="d-flex justify-content-between mb-1" style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                    <span>Subtotal</span>
                    <span style={{ color: '#e2e8f0' }}>₹{totalAmount}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.9rem' }}>
                      <span style={{ color: '#22c55e' }}>Discount</span>
                      <span style={{ color: '#22c55e', fontWeight: 700 }}>-₹{discountAmount}</span>
                    </div>
                  )}
                  <hr style={{ borderColor: '#334155' }} />
                  <div className="d-flex justify-content-between">
                    <span style={{ fontWeight: 700 }}>Total</span>
                    <span className="price-tag">₹{finalAmount}</span>
                  </div>
                </div>

                {/* Timer notice */}
                <div className="mb-3 p-3 rounded" style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.3)', fontSize: '0.82rem', color: '#f59e0b' }}>
                  ⏱️ <strong>10-minute payment window:</strong> After booking, you have 10 minutes to complete payment or your slot will be released automatically.
                </div>

                <button type="submit" className="btn btn-primary-ezp w-100" disabled={submitting}>
                  {submitting ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                  {submitting ? 'Confirming...' : 'Confirm Booking →'}
                </button>
              </form>
            </div>
          </Col>

          {/* Slot info + map */}
          <Col lg={5}>
            <div className="ezp-card p-4 mb-4">
              <h5 className="mb-3" style={{ color: '#00d4aa' }}>Slot Information</h5>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.8rem' }}>{slot?.slotNumber}</span>
                <span className={`status-badge badge-${slot?.type}`}>{slot?.type}</span>
              </div>
              {[
                ['Location', slot?.location],
                ['Floor', slot?.floor],
                ['Price', `₹${slot?.pricePerHour}/hour`],
                ['Status', slot?.isAvailable ? '✅ Available' : '❌ Occupied']
              ].map(([k, v]) => (
                <div key={k} className="d-flex justify-content-between py-2" style={{ borderBottom: '1px solid #334155', fontSize: '0.9rem' }}>
                  <span style={{ color: '#94a3b8' }}>{k}</span>
                  <span style={{ color: '#e2e8f0' }}>{v}</span>
                </div>
              ))}
              {slot?.features?.length > 0 && (
                <div className="mt-3">
                  <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: '0.5rem' }}>Features</div>
                  <div className="d-flex flex-wrap gap-2">
                    {slot.features.map((f, i) => (
                      <span key={i} style={{ background: 'rgba(0,212,170,0.1)', color: '#00d4aa', fontSize: '0.78rem', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>{f}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Map */}
            <div className="ezp-card p-4">
              <h5 className="mb-3" style={{ color: '#00d4aa' }}>Location</h5>
              <MapView height={220} locationName={slot?.location || 'Main Parking Complex'} />
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Booking;