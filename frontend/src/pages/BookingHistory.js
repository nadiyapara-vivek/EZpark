import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { getMyBookings } from '../services/api';
import { SpendingChart, BookingStatusChart, SlotTypeChart, HoursChart } from '../components/Charts';
import { FiTrendingUp, FiClock, FiDollarSign, FiBook } from 'react-icons/fi';

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    getMyBookings()
      .then(({ data }) => setBookings(data.bookings))
      .catch(() => toast.error('Failed to load booking history'))
      .finally(() => setLoading(false));
  }, []);

  const filteredByYear = bookings.filter(b => new Date(b.createdAt).getFullYear() === year);
  const years = [...new Set(bookings.map(b => new Date(b.createdAt).getFullYear()))].sort((a, b) => b - a);

  const totalSpent = filteredByYear.filter(b => b.paymentStatus === 'paid').reduce((s, b) => s + (b.finalAmount || b.totalAmount), 0);
  const totalHours = filteredByYear.reduce((s, b) => s + (b.duration || 0), 0);
  const completedCount = filteredByYear.filter(b => b.status === 'completed').length;
  const cancelRate = filteredByYear.length ? Math.round((filteredByYear.filter(b => b.status === 'cancelled').length / filteredByYear.length) * 100) : 0;

  if (loading) return <div className="text-center py-5"><div className="spinner-ezp mx-auto" /></div>;

  return (
    <div className="page-wrapper">
      <Container>
        {/* Header */}
        <div className="mb-4 d-flex justify-content-between align-items-end flex-wrap gap-3">
          <div>
            <h2 className="section-title">Booking History</h2>
            <div className="section-divider" />
            <p style={{ color: '#94a3b8' }}>Analytics and insights from your parking activity.</p>
          </div>
          {years.length > 1 && (
            <select
              className="form-select ezp-input"
              style={{ width: 'auto' }}
              value={year}
              onChange={e => setYear(Number(e.target.value))}
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          )}
        </div>

        {/* Summary cards */}
        <Row className="g-3 mb-4">
          {[
            { label: 'Total Spent', value: `₹${totalSpent.toLocaleString()}`, icon: <FiDollarSign />, color: '#00d4aa' },
            { label: 'Hours Parked', value: `${totalHours}h`, icon: <FiClock />, color: '#6c63ff' },
            { label: 'Completed', value: completedCount, icon: <FiBook />, color: '#22c55e' },
            { label: 'Cancel Rate', value: `${cancelRate}%`, icon: <FiTrendingUp />, color: '#f59e0b' },
          ].map((s, i) => (
            <Col xs={6} md={3} key={i}>
              <div className="ezp-card p-3 h-100">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div style={{ color: s.color, fontSize: '1.1rem' }}>{s.icon}</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'Syne, sans-serif', color: s.color }}>{s.value}</div>
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.82rem' }}>{s.label}</div>
              </div>
            </Col>
          ))}
        </Row>

        {filteredByYear.length === 0 ? (
          <div className="ezp-card p-5 text-center">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
            <p style={{ color: '#94a3b8' }}>No booking data for {year}.</p>
          </div>
        ) : (
          <>
            {/* Charts row 1 */}
            <Row className="g-4 mb-4">
              <Col lg={8}>
                <div className="ezp-card p-4">
                  <SpendingChart bookings={filteredByYear} />
                </div>
              </Col>
              <Col lg={4}>
                <div className="ezp-card p-4">
                  <SlotTypeChart bookings={filteredByYear} />
                </div>
              </Col>
            </Row>

            {/* Charts row 2 */}
            <Row className="g-4 mb-4">
              <Col lg={6}>
                <div className="ezp-card p-4">
                  <HoursChart bookings={filteredByYear} />
                </div>
              </Col>
              <Col lg={6}>
                <div className="ezp-card p-4">
                  <BookingStatusChart bookings={filteredByYear} />
                </div>
              </Col>
            </Row>

            {/* Recent bookings table */}
            <div className="ezp-card p-0" style={{ overflow: 'hidden' }}>
              <div className="p-3" style={{ borderBottom: '1px solid #334155' }}>
                <h5 className="m-0">All Bookings ({filteredByYear.length})</h5>
              </div>
              <div className="table-responsive">
                <table className="ezp-table">
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>Slot</th>
                      <th>Date</th>
                      <th>Duration</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredByYear.map(b => (
                      <tr key={b._id}>
                        <td style={{ fontSize: '0.78rem', color: '#64748b' }}>{b.bookingId}</td>
                        <td style={{ fontWeight: 600 }}>{b.slot?.slotNumber || '—'}</td>
                        <td style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{new Date(b.createdAt).toLocaleDateString()}</td>
                        <td style={{ fontSize: '0.85rem' }}>{b.duration}h</td>
                        <td style={{ fontFamily: 'Syne', fontWeight: 700, color: '#00d4aa' }}>
                          ₹{b.finalAmount || b.totalAmount}
                          {b.discountAmount > 0 && (
                            <span style={{ fontSize: '0.7rem', color: '#22c55e', marginLeft: 4 }}>-₹{b.discountAmount}</span>
                          )}
                        </td>
                        <td><span className={`status-badge status-${b.status}`}>{b.status}</span></td>
                        <td><span className={`status-badge ${b.paymentStatus === 'paid' ? 'status-confirmed' : 'status-pending'}`}>{b.paymentStatus}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </Container>
    </div>
  );
};

export default BookingHistory;