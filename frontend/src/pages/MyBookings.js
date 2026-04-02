import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { getMyBookings, cancelBooking, deleteBooking, extendBooking, logEntryExit } from '../services/api';
import { Link } from 'react-router-dom';
import BookingTimer from '../components/Timer';
import QRCodeDisplay from '../components/QRCodeDisplay';

// Statuses the user is allowed to permanently delete
const DELETABLE_STATUSES = ['cancelled', 'completed'];

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [cancelling, setCancelling] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  // Extend state
  const [extendingId, setExtendingId] = useState(null);
  const [extendHours, setExtendHours] = useState(1);
  const [extendLoading, setExtendLoading] = useState(false);

  // Delete state
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const { data } = await getMyBookings();
      setBookings(data.bookings);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    setCancelling(id);
    try {
      await cancelBooking(id);
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    } finally {
      setCancelling(null);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteBooking(id);
      toast.success('Booking deleted');
      setBookings(prev => prev.filter(b => b._id !== id));
      setDeleteConfirmId(null);
      if (expandedId === id) setExpandedId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  const handleExtend = async (bookingId) => {
    setExtendLoading(true);
    try {
      const { data } = await extendBooking(bookingId, { additionalHours: extendHours, method: 'card' });
      toast.success(`Extended by ${extendHours}h! Additional ₹${data.extension.additionalAmount} charged.`);
      setExtendingId(null);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Extension failed');
    } finally {
      setExtendLoading(false);
    }
  };

  const handleLog = async (bookingMongoId, type) => {
    try {
      const { data } = await logEntryExit(bookingMongoId, { type });
      toast.success(`${type === 'entry' ? 'Entry' : 'Exit'} logged`);
      setBookings(prev => prev.map(b => b._id === bookingMongoId ? { ...b, ...data.booking } : b));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Log failed');
    }
  };

  const STATUSES = ['all', 'pending', 'confirmed', 'active', 'completed', 'cancelled'];
  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div className="page-wrapper">
      <Container>
        <div className="mb-4">
          <h2 className="section-title">My Bookings</h2>
          <div className="section-divider" />
          <p style={{ color: '#94a3b8' }}>Manage and track all your parking bookings.</p>
        </div>

        {/* Status filter */}
        <div className="d-flex flex-wrap gap-2 mb-4">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '0.3rem 0.9rem', borderRadius: '20px', textTransform: 'capitalize',
              fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
              border: filter === s ? '1.5px solid #00d4aa' : '1px solid #334155',
              background: filter === s ? 'rgba(0,212,170,0.1)' : 'transparent',
              color: filter === s ? '#00d4aa' : '#94a3b8',
            }}>
              {s === 'all' ? `All (${bookings.length})` : s}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-5"><div className="spinner-ezp mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-5">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
            <p style={{ color: '#94a3b8' }}>No bookings found.</p>
            <Link to="/slots" className="btn btn-primary-ezp mt-2">Book a Parking Slot</Link>
          </div>
        ) : (
          <Row className="g-3">
            {filtered.map((b) => (
              <Col xs={12} md={6} xl={4} key={b._id}>
                <div className="ezp-card p-4 h-100">

                  {/* Header */}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.2rem' }}>{b.slot?.slotNumber}</div>
                      <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '2px' }}>{b.bookingId}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                      <span className={`status-badge status-${b.status}`}>{b.status}</span>
                      {/* Delete icon — only for cancelled / completed */}
                      {DELETABLE_STATUSES.includes(b.status) && (
                        <button
                          title="Delete this booking"
                          onClick={() => setDeleteConfirmId(deleteConfirmId === b._id ? null : b._id)}
                          style={{
                            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
                            color: '#ef4444', borderRadius: 6, padding: '2px 7px',
                            fontSize: '0.75rem', cursor: 'pointer', lineHeight: 1.6,
                          }}
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Inline delete confirmation */}
                  {deleteConfirmId === b._id && (
                    <div style={{
                      background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.3)',
                      borderRadius: 10, padding: '10px 12px', marginBottom: 12,
                    }}>
                      <div style={{ fontSize: '0.8rem', color: '#fca5a5', fontWeight: 600, marginBottom: 4 }}>
                        Permanently delete this booking?
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginBottom: 10 }}>
                        This cannot be undone.
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => handleDelete(b._id)}
                          disabled={deletingId === b._id}
                          style={{
                            flex: 1, background: '#ef4444', color: '#fff', border: 'none',
                            borderRadius: 8, padding: '0.3rem 0', fontSize: '0.8rem',
                            fontWeight: 700, cursor: 'pointer',
                            opacity: deletingId === b._id ? 0.6 : 1,
                          }}
                        >
                          {deletingId === b._id ? 'Deleting…' : 'Yes, Delete'}
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          style={{
                            flex: 1, background: 'transparent', color: '#94a3b8',
                            border: '1px solid #334155', borderRadius: 8,
                            padding: '0.3rem 0', fontSize: '0.8rem', cursor: 'pointer',
                          }}
                        >
                          Keep It
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Timer for pending bookings */}
                  {b.status === 'pending' && b.secondsRemaining > 0 && (
                    <div className="mb-3">
                      <BookingTimer
                        secondsRemaining={b.secondsRemaining}
                        bookingId={b._id}
                        onExpired={fetchBookings}
                      />
                    </div>
                  )}

                  {/* Details */}
                  {[
                    ['📍', b.slot?.location],
                    ['🚗', b.vehicleNumber],
                    ['🕐', new Date(b.startTime).toLocaleString()],
                    ['🕑', new Date(b.endTime).toLocaleString()],
                    ['⏱', `${b.duration} hour(s)`],
                  ].map(([icon, val], i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '0.4rem', color: '#94a3b8' }}>
                      <span>{icon}</span><span style={{ color: '#e2e8f0' }}>{val}</span>
                    </div>
                  ))}

                  {/* Amount */}
                  <div className="d-flex justify-content-between align-items-center mt-3 pt-3" style={{ borderTop: '1px solid #1e293b' }}>
                    <div>
                      <div className="price-tag" style={{ fontSize: '1.1rem' }}>₹{b.finalAmount || b.totalAmount}</div>
                      {b.discountAmount > 0 && (
                        <div style={{ fontSize: '0.72rem', color: '#22c55e' }}>-₹{b.discountAmount} discount</div>
                      )}
                    </div>
                    <div className="d-flex gap-2 flex-wrap justify-content-end">
                      {b.paymentStatus === 'unpaid' && b.status !== 'cancelled' && (
                        <Link to={`/checkout/${b._id}`} className="btn btn-primary-ezp btn-sm">Pay Now</Link>
                      )}
                      {['pending', 'confirmed'].includes(b.status) && (
                        <button className="btn btn-sm" onClick={() => handleCancel(b._id)} disabled={cancelling === b._id}
                          style={{ border: '1px solid #ef4444', color: '#ef4444', background: 'transparent', borderRadius: '8px', padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}>
                          {cancelling === b._id ? '...' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expand button */}
                  <button onClick={() => setExpandedId(expandedId === b._id ? null : b._id)}
                    style={{ width: '100%', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.78rem', marginTop: 8, padding: '4px' }}>
                    {expandedId === b._id ? '▲ Less' : '▼ More options'}
                  </button>

                  {/* Expanded section */}
                  {expandedId === b._id && (
                    <div style={{ marginTop: 8, borderTop: '1px solid #1e293b', paddingTop: 12 }}>
                      {/* QR Code */}
                      {b.qrCode && b.status !== 'cancelled' && (
                        <div className="text-center mb-3">
                          <QRCodeDisplay qrCode={b.qrCode} bookingId={b.bookingId} size={130} />
                        </div>
                      )}

                      {/* Entry/Exit log */}
                      {['confirmed', 'active'].includes(b.status) && (
                        <div className="d-flex gap-2 mb-3">
                          {b.status === 'confirmed' && (
                            <button className="btn btn-sm w-50" onClick={() => handleLog(b._id, 'entry')}
                              style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid #22c55e', borderRadius: 8, fontSize: '0.8rem' }}>
                              🟢 Log Entry
                            </button>
                          )}
                          {b.status === 'active' && (
                            <button className="btn btn-sm w-50" onClick={() => handleLog(b._id, 'exit')}
                              style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid #ef4444', borderRadius: 8, fontSize: '0.8rem' }}>
                              🔴 Log Exit
                            </button>
                          )}
                        </div>
                      )}

                      {/* Extend booking */}
                      {['confirmed', 'active'].includes(b.status) && b.paymentStatus === 'paid' && (
                        extendingId === b._id ? (
                          <div style={{ background: '#0f172a', borderRadius: 10, padding: 12 }}>
                            <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: 8 }}>Extend by how many hours?</div>
                            <div className="d-flex gap-2 align-items-center">
                              <input type="number" min={1} max={24} value={extendHours}
                                onChange={e => setExtendHours(Math.max(1, Number(e.target.value)))}
                                className="form-control ezp-input" style={{ width: 80 }} />
                              <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>
                                +₹{extendHours * (b.slot?.pricePerHour || 0)}
                              </span>
                              <button className="btn btn-primary-ezp btn-sm" onClick={() => handleExtend(b._id)} disabled={extendLoading}>
                                {extendLoading ? '...' : 'Confirm'}
                              </button>
                              <button className="btn btn-sm" onClick={() => setExtendingId(null)}
                                style={{ color: '#64748b', background: 'none', border: 'none' }}>✕</button>
                            </div>
                          </div>
                        ) : (
                          <button className="btn btn-outline-ezp btn-sm w-100" onClick={() => setExtendingId(b._id)}
                            style={{ fontSize: '0.82rem' }}>
                            ⏰ Extend Booking
                          </button>
                        )
                      )}

                      {/* Extension history */}
                      {b.extensions?.length > 0 && (
                        <div style={{ marginTop: 10 }}>
                          <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: 6 }}>Extensions:</div>
                          {b.extensions.map((ext, i) => (
                            <div key={i} style={{ fontSize: '0.75rem', color: '#94a3b8', padding: '3px 0' }}>
                              +{ext.additionalHours}h · ₹{ext.additionalAmount} · {new Date(ext.extendedAt).toLocaleDateString()}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
};

export default MyBookings;