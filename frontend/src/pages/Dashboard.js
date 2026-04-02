import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getMyBookings } from '../services/api';
import { getUser } from '../utils/auth';
import { FiCalendar, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const Dashboard = () => {
  const user = getUser();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyBookings().then(({ data }) => setBookings(data.bookings)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  const recent = bookings.slice(0, 5);

  return (
    <div className="page-wrapper">
      <Container>
        {/* Welcome */}
        <div className="mb-4">
          <h2 className="section-title">Welcome back, {user?.name?.split(' ')[0]}! 👋</h2>
          <p style={{ color: '#94a3b8' }}>Here's an overview of your parking activity.</p>
        </div>

        {/* Stats */}
        <Row className="g-3 mb-4">
          {[
            { label: 'Total Bookings', value: stats.total, icon: <FiCalendar size={20} />, color: '#6c63ff' },
            { label: 'Confirmed', value: stats.confirmed, icon: <FiClock size={20} />, color: '#00d4aa' },
            { label: 'Completed', value: stats.completed, icon: <FiCheckCircle size={20} />, color: '#22c55e' },
            { label: 'Cancelled', value: stats.cancelled, icon: <FiXCircle size={20} />, color: '#ef4444' },
          ].map((s, i) => (
            <Col xs={6} md={3} key={i}>
              <div className="ezp-card p-3 h-100">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div style={{ color: s.color }}>{s.icon}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'Syne, sans-serif', color: s.color }}>{s.value}</div>
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.82rem' }}>{s.label}</div>
              </div>
            </Col>
          ))}
        </Row>

        {/* Quick Actions */}
        <div className="ezp-card p-4 mb-4">
          <h5 className="mb-3">Quick Actions</h5>
          <div className="d-flex gap-3 flex-wrap">
            <Link to="/slots" className="btn btn-primary-ezp">🔍 Find Parking</Link>
            <Link to="/my-bookings" className="btn btn-outline-ezp">📋 My Bookings</Link>
            <Link to="/profile" className="btn btn-outline-ezp">👤 Edit Profile</Link>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="ezp-card p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="m-0">Recent Bookings</h5>
            <Link to="/my-bookings" style={{ color: '#00d4aa', fontSize: '0.85rem' }}>View all →</Link>
          </div>
          {loading ? (
            <div className="text-center py-3"><div className="spinner-ezp mx-auto" /></div>
          ) : recent.length === 0 ? (
            <div className="text-center py-4">
              <p style={{ color: '#94a3b8' }}>No bookings yet.</p>
              <Link to="/slots" className="btn btn-primary-ezp btn-sm">Book Your First Spot</Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="ezp-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Slot</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((b) => (
                    <tr key={b._id}>
                      <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{b.bookingId}</td>
                      <td style={{ fontWeight: 600 }}>{b.slot?.slotNumber}</td>
                      <td style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{new Date(b.startTime).toLocaleDateString()}</td>
                      <td className="price-tag" style={{ fontSize: '0.95rem' }}>₹{b.totalAmount}</td>
                      <td><span className={`status-badge status-${b.status}`}>{b.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default Dashboard;