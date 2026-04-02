import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { FiSearch, FiCreditCard, FiMapPin, FiShield, FiZap, FiClock } from 'react-icons/fi';

const features = [
  { icon: <FiSearch size={24} />, title: 'Find Instantly', desc: 'Browse real-time parking availability across all floors and zones.' },
  { icon: <FiCreditCard size={24} />, title: 'Secure Payment', desc: 'Multiple payment options — UPI, card, netbanking, and wallet.' },
  { icon: <FiClock size={24} />, title: 'Flexible Booking', desc: 'Book by the hour. Extend or cancel anytime before check-in.' },
  { icon: <FiShield size={24} />, title: 'Safe & Monitored', desc: '24/7 CCTV surveillance and on-site security across all zones.' },
  { icon: <FiZap size={24} />, title: 'EV Charging', desc: 'Dedicated EV charging spots available for electric vehicles.' },
  { icon: <FiMapPin size={24} />, title: 'Prime Locations', desc: 'Central parking complex with easy access from major roads.' },
];

const Home = () => (
  <>
    {/* Hero */}
    <section className="hero-section">
      <Container style={{ position: 'relative', zIndex: 1 }}>
        <Row className="align-items-center g-5">
          <Col lg={6} className="fade-in-up">
            <div className="mb-3">
              <span style={{ background: 'rgba(0,212,170,0.1)', color: '#00d4aa', border: '1px solid rgba(0,212,170,0.2)', padding: '0.3rem 0.9rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 600 }}>
                🚗 Smart Parking System
              </span>
            </div>
            <h1 className="hero-title mb-4">
              Park Smarter,<br />
              <span className="hero-highlight">Not Harder.</span>
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '2rem', maxWidth: '480px' }}>
              Find and book parking spots in seconds. Real-time availability, instant confirmation, and hassle-free experience.
            </p>
            <div className="d-flex flex-wrap gap-3">
              <Link to="/slots" className="btn btn-primary-ezp btn-lg px-4">Find Parking Now</Link>
              <Link to="/register" className="btn btn-outline-ezp btn-lg px-4">Get Started Free</Link>
            </div>
          </Col>
          <Col lg={6} className="d-none d-lg-flex justify-content-center">
            <div style={{ position: 'relative', width: '380px', height: '380px' }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,170,0.1) 0%, transparent 70%)', animation: 'pulse 3s ease-in-out infinite' }} />
              <div style={{ position: 'absolute', inset: '20px', border: '1px solid rgba(0,212,170,0.15)', borderRadius: '50%' }} />
              <div style={{ position: 'absolute', inset: '60px', border: '1px solid rgba(0,212,170,0.1)', borderRadius: '50%' }} />
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: '6rem' }}>🅿️</div>
              {/* floating cards */}
              {[
                { top: '5%', left: '-5%', content: '✓ Slot P012 Reserved' },
                { bottom: '5%', right: '-5%', content: '💳 Payment Confirmed' },
                { top: '40%', right: '-10%', content: '📍 Floor 2 · Zone B' },
              ].map((card, i) => (
                <div key={i} style={{ position: 'absolute', ...card, background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '0.6rem 1rem', fontSize: '0.8rem', color: '#e2e8f0', whiteSpace: 'nowrap', content: undefined }}>
                  {card.content}
                </div>
              ))}
            </div>
          </Col>
        </Row>
      </Container>
    </section>

    {/* Stats */}
    <section style={{ background: '#1e293b', borderTop: '1px solid #334155', borderBottom: '1px solid #334155', padding: '2rem 0' }}>
      <Container>
        <Row className="g-3 text-center">
          {[['500+', 'Parking Spots'], ['10K+', 'Happy Drivers'], ['99.9%', 'Uptime'], ['24/7', 'Support']].map(([num, label], i) => (
            <Col xs={6} md={3} key={i}>
              <div className="stat-number">{num}</div>
              <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.2rem' }}>{label}</div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>

    {/* Features */}
    <section style={{ padding: '5rem 0' }}>
      <Container>
        <div className="text-center mb-5">
          <h2 className="section-title">Why Choose EZpark?</h2>
          <div className="section-divider mx-auto" />
          <p style={{ color: '#94a3b8', maxWidth: '500px', margin: '0 auto' }}>Everything you need for a seamless parking experience.</p>
        </div>
        <Row className="g-4">
          {features.map((f, i) => (
            <Col md={6} lg={4} key={i}>
              <div className="ezp-card p-4 h-100">
                <div style={{ width: 50, height: 50, borderRadius: '12px', background: 'rgba(0,212,170,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00d4aa', marginBottom: '1rem' }}>
                  {f.icon}
                </div>
                <h5 style={{ marginBottom: '0.5rem' }}>{f.title}</h5>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>{f.desc}</p>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>

    {/* CTA */}
    <section style={{ padding: '5rem 0', background: 'linear-gradient(135deg, rgba(0,212,170,0.05), rgba(108,99,255,0.05))', borderTop: '1px solid #334155' }}>
      <Container className="text-center">
        <h2 className="section-title mb-3">Ready to Park Smarter?</h2>
        <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Join thousands of drivers who trust EZpark every day.</p>
        <div className="d-flex justify-content-center gap-3 flex-wrap">
          <Link to="/register" className="btn btn-primary-ezp btn-lg px-5">Create Free Account</Link>
          <Link to="/slots" className="btn btn-outline-ezp btn-lg px-5">Browse Slots</Link>
        </div>
      </Container>
    </section>
  </>
);

export default Home;