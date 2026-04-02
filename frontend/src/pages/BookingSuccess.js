import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { getBooking, logEntryExit } from '../services/api';
import QRCodeDisplay from '../components/QRCodeDisplay';
import MapView from '../components/MapView';

const BookingSuccess = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loggingEntry, setLoggingEntry] = useState(false);

  useEffect(() => {
    getBooking(bookingId)
      .then(({ data }) => setBooking(data.booking))
      .catch(() => {});
  }, [bookingId]);

  const handleEntryLog = async () => {
    if (!booking) return;
    setLoggingEntry(true);
    try {
      const { data } = await logEntryExit(booking._id, { type: 'entry', note: 'Manual check-in from app' });
      setBooking(data.booking);
      toast.success('Entry logged! Booking is now active.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log entry');
    } finally {
      setLoggingEntry(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Container>
        <div className="text-center py-4 fade-in-up">
          <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🎉</div>
          <div style={{
            width: 70, height: 70, borderRadius: '50%',
            background: 'rgba(0,212,170,0.15)', border: '2px solid #00d4aa',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem', fontSize: '1.8rem'
          }}>✓</div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, marginBottom: '0.5rem' }}>Booking Confirmed!</h2>
          <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
            Your parking spot has been reserved. Show the QR code at entry/exit.
          </p>
        </div>

        {booking && (
          <Row className="g-4 justify-content-center">
            {/* Booking details + QR */}
            <Col lg={5}>
              <div className="ezp-card p-4 mb-4">
                <div className="text-center mb-4">
                  <span style={{
                    background: 'rgba(0,212,170,0.1)', color: '#00d4aa',
                    padding: '0.4rem 1rem', borderRadius: '20px',
                    fontSize: '0.85rem', fontWeight: 700
                  }}>
                    {booking.bookingId}
                  </span>
                </div>

                {/* QR Code */}
                <div className="text-center mb-4">
                  <QRCodeDisplay qrCode={booking.qrCode} bookingId={booking.bookingId} size={180} />
                </div>

                {/* Details */}
                {[
                  ['Slot', booking.slot?.slotNumber],
                  ['Location', booking.slot?.location],
                  ['Vehicle', booking.vehicleNumber],
                  ['Check-in', new Date(booking.startTime).toLocaleString()],
                  ['Check-out', new Date(booking.endTime).toLocaleString()],
                  ['Duration', `${booking.duration} hour(s)`],
                  ['Paid', `₹${booking.finalAmount || booking.totalAmount}`],
                  ...(booking.discountAmount > 0 ? [['Discount', `₹${booking.discountAmount} (${booking.promoCode})`]] : []),
                  ['Status', booking.status],
                ].map(([k, v]) => (
                  <div key={k} className="d-flex justify-content-between py-2" style={{ borderBottom: '1px solid #1e293b', fontSize: '0.88rem' }}>
                    <span style={{ color: '#64748b' }}>{k}</span>
                    <span style={{ color: '#e2e8f0', fontWeight: 500, textTransform: 'capitalize' }}>{v}</span>
                  </div>
                ))}

                {/* Entry/Exit Log */}
                {booking.entryExitLogs?.length > 0 && (
                  <div className="mt-3">
                    <div style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 700, marginBottom: 8 }}>Activity Log</div>
                    {booking.entryExitLogs.map((log, i) => (
                      <div key={i} style={{
                        display: 'flex', justifyContent: 'space-between',
                        padding: '6px 10px', borderRadius: 8, marginBottom: 4,
                        background: log.type === 'entry' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                        fontSize: '0.82rem'
                      }}>
                        <span style={{ color: log.type === 'entry' ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                          {log.type === 'entry' ? '🟢 Entry' : '🔴 Exit'}
                        </span>
                        <span style={{ color: '#94a3b8' }}>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Manual entry button */}
                {booking.status === 'confirmed' && (
                  <button
                    className="btn btn-outline-ezp w-100 mt-3"
                    onClick={handleEntryLog}
                    disabled={loggingEntry}
                  >
                    {loggingEntry ? <span className="spinner-border spinner-border-sm me-2" /> : '🚗 '}
                    Log Vehicle Entry
                  </button>
                )}
              </div>

              {/* Action buttons */}
              <div className="d-flex gap-3 flex-wrap justify-content-center">
                <Link to="/my-bookings" className="btn btn-primary-ezp px-4">My Bookings</Link>
                <Link to={`/booking-history`} className="btn btn-outline-ezp px-4">View History</Link>
                <Link to="/slots" className="btn btn-outline-ezp px-4">Book Another</Link>
              </div>
            </Col>

            {/* Map */}
            <Col lg={5}>
              <div className="ezp-card p-4">
                <h5 className="mb-3" style={{ color: '#00d4aa' }}>Parking Location</h5>
                <MapView
                  height={260}
                  locationName={booking.slot?.location || 'Main Parking Complex'}
                />
                <div className="mt-3 p-3 rounded" style={{ background: '#0f172a', border: '1px solid #334155', fontSize: '0.85rem', color: '#94a3b8' }}>
                  <div style={{ fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>📍 {booking.slot?.location}</div>
                  <div>Floor: {booking.slot?.floor} · Slot: {booking.slot?.slotNumber}</div>
                  {booking.slot?.features?.length > 0 && (
                    <div className="mt-2 d-flex flex-wrap gap-1">
                      {booking.slot.features.map((f, i) => (
                        <span key={i} style={{ background: 'rgba(0,212,170,0.1)', color: '#00d4aa', fontSize: '0.75rem', padding: '2px 8px', borderRadius: 6 }}>{f}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
};

export default BookingSuccess;