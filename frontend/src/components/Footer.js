import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Footer = () => (
  <footer className="ezp-footer">
    <Container>
      <Row className="mb-4 g-4">
        <Col md={4}>
          <h5 className="ezp-brand" style={{ fontSize: '1.4rem' }}>EZ<span style={{ color: 'white' }}>park</span></h5>
          <p className="mt-2" style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Smart parking solutions for modern cities. Find, book, and manage your parking effortlessly.
          </p>
        </Col>
        <Col md={2} xs={6}>
          <h6 style={{ color: '#e2e8f0', fontFamily: 'Syne, sans-serif', marginBottom: '1rem' }}>Quick Links</h6>
          {['/', '/slots', '/login', '/register'].map((path, i) => (
            <div key={i} className="mb-1">
              <Link to={path} style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' }}>
                {['Home', 'Find Parking', 'Login', 'Sign Up'][i]}
              </Link>
            </div>
          ))}
        </Col>
        <Col md={3} xs={6}>
          <h6 style={{ color: '#e2e8f0', fontFamily: 'Syne, sans-serif', marginBottom: '1rem' }}>Parking Types</h6>
          {['Standard', 'Compact', 'EV Charging', 'VIP', 'Handicapped'].map((t, i) => (
            <div key={i} className="mb-1" style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{t}</div>
          ))}
        </Col>
        <Col md={3}>
          <h6 style={{ color: '#e2e8f0', fontFamily: 'Syne, sans-serif', marginBottom: '1rem' }}>Contact</h6>
          <div className="d-flex align-items-center gap-2 mb-2" style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            <FiMapPin size={14} style={{ color: '#00d4aa' }} /> Rajkot
          </div>
          <div className="d-flex align-items-center gap-2 mb-2" style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            <FiPhone size={14} style={{ color: '#00d4aa' }} /> +91 12345 67890
          </div>
          <div className="d-flex align-items-center gap-2" style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            <FiMail size={14} style={{ color: '#00d4aa' }} /> support@ezpark.com
          </div>
        </Col>
      </Row>
      <hr style={{ borderColor: '#334155' }} />
      <div className="text-center" style={{ color: '#475569', fontSize: '0.85rem' }}>
        © {new Date().getFullYear()} EZpark. All rights reserved. Created by Vivek Nadiyapara and His Team.
      </div>
    </Container>
  </footer>
);

export default Footer;