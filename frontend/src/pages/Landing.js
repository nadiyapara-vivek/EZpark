import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { FiSearch, FiCreditCard, FiMapPin, FiShield, FiZap, FiClock } from 'react-icons/fi';
import MapView from '../components/MapView';

/**
 * Landing page with GSAP animations
 * Install: npm install gsap
 */

const features = [
  { icon: <FiSearch size={24} />, title: 'Find Instantly', desc: 'Browse real-time parking availability across all floors and zones.' },
  { icon: <FiCreditCard size={24} />, title: 'Secure Payment', desc: 'Multiple payment options — UPI, card, netbanking, and wallet.' },
  { icon: <FiClock size={24} />, title: 'Flexible Booking', desc: 'Book by the hour. Extend or cancel anytime before check-in.' },
  { icon: <FiShield size={24} />, title: 'Safe & Monitored', desc: '24/7 CCTV surveillance and on-site security across all zones.' },
  { icon: <FiZap size={24} />, title: 'EV Charging', desc: 'Dedicated EV charging spots available for electric vehicles.' },
  { icon: <FiMapPin size={24} />, title: 'Prime Locations', desc: 'Central parking complex with easy access from major roads.' },
];

const Landing = () => {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const statsRef = useRef(null);
  const featuresRef = useRef(null);
  const floatingRef = useRef(null);

  useEffect(() => {
    let gsap;
    let ScrollTrigger;

    const initAnimations = async () => {
      try {
        const gsapModule = await import('gsap');
        const stModule = await import('gsap/ScrollTrigger');
        gsap = gsapModule.gsap || gsapModule.default;
        ScrollTrigger = stModule.ScrollTrigger;
        gsap.registerPlugin(ScrollTrigger);

        // Hero title animation
        if (titleRef.current) {
          gsap.fromTo(titleRef.current,
            { opacity: 0, y: 60, skewY: 3 },
            { opacity: 1, y: 0, skewY: 0, duration: 1, ease: 'power3.out', delay: 0.1 }
          );
        }

        // Subtitle
        if (subtitleRef.current) {
          gsap.fromTo(subtitleRef.current,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.4 }
          );
        }

        // CTA buttons
        if (ctaRef.current) {
          gsap.fromTo(ctaRef.current.children,
            { opacity: 0, scale: 0.85 },
            { opacity: 1, scale: 1, duration: 0.5, stagger: 0.15, ease: 'back.out(1.7)', delay: 0.7 }
          );
        }

        // Floating cards — staggered drift animation
        if (floatingRef.current) {
          const cards = floatingRef.current.querySelectorAll('.float-card');
          cards.forEach((card, i) => {
            gsap.fromTo(card,
              { opacity: 0, x: i % 2 === 0 ? 40 : -40, y: 20 },
              { opacity: 1, x: 0, y: 0, duration: 0.7, delay: 0.6 + i * 0.15, ease: 'power2.out' }
            );
            // Continuous float
            gsap.to(card, {
              y: i % 2 === 0 ? -8 : 8,
              duration: 2 + i * 0.5,
              ease: 'sine.inOut',
              yoyo: true,
              repeat: -1,
              delay: i * 0.3
            });
          });
        }

        // Stats counter animation
        if (statsRef.current) {
          const statNumbers = statsRef.current.querySelectorAll('.stat-number-animated');
          statNumbers.forEach(el => {
            const target = el.dataset.target;
            const isNumeric = !isNaN(parseInt(target));
            if (isNumeric) {
              gsap.fromTo(el,
                { textContent: 0 },
                {
                  textContent: parseInt(target),
                  duration: 1.5,
                  ease: 'power1.out',
                  snap: { textContent: 1 },
                  scrollTrigger: { trigger: statsRef.current, start: 'top 80%' },
                  onUpdate: function () {
                    el.textContent = Math.round(this.targets()[0].textContent) + (target.includes('+') ? '+' : target.includes('%') ? '%' : '');
                  }
                }
              );
            }
          });
        }

        // Feature cards scroll reveal
        if (featuresRef.current) {
          const cards = featuresRef.current.querySelectorAll('.feature-card-anim');
          gsap.fromTo(cards,
            { opacity: 0, y: 40 },
            {
              opacity: 1, y: 0,
              stagger: 0.1,
              duration: 0.6,
              ease: 'power2.out',
              scrollTrigger: { trigger: featuresRef.current, start: 'top 75%' }
            }
          );
        }

      } catch (err) {
        // GSAP not installed — animations just won't run, page still works
        console.info('GSAP not available. Install with: npm install gsap');
      }
    };

    initAnimations();

    return () => {
      if (ScrollTrigger) ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <>
      {/* ── HERO ── */}
      <section ref={heroRef} className="hero-section">
        <Container style={{ position: 'relative', zIndex: 1 }}>
          <Row className="align-items-center g-5">
            <Col lg={6}>
              <div className="mb-3">
                <span style={{
                  background: 'rgba(0,212,170,0.1)', color: '#00d4aa',
                  border: '1px solid rgba(0,212,170,0.2)',
                  padding: '0.3rem 0.9rem', borderRadius: '20px',
                  fontSize: '0.82rem', fontWeight: 600
                }}>
                  🚗 Smart Parking System
                </span>
              </div>
              <h1 ref={titleRef} className="hero-title mb-4" style={{ opacity: 0 }}>
                Park Smarter,<br />
                <span className="hero-highlight">Not Harder.</span>
              </h1>
              <p ref={subtitleRef} style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '2rem', maxWidth: '480px', opacity: 0 }}>
                Find and book parking spots in seconds. Real-time availability, QR entry, instant confirmation, and hassle-free experience.
              </p>
              <div ref={ctaRef} className="d-flex flex-wrap gap-3">
                <Link to="/slots" className="btn btn-primary-ezp btn-lg px-4">Find Parking Now</Link>
                <Link to="/register" className="btn btn-outline-ezp btn-lg px-4">Get Started Free</Link>
              </div>
            </Col>

            <Col lg={6} className="d-none d-lg-flex justify-content-center">
              <div ref={floatingRef} style={{ position: 'relative', width: '380px', height: '380px' }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,170,0.1) 0%, transparent 70%)', animation: 'pulse 3s ease-in-out infinite' }} />
                <div style={{ position: 'absolute', inset: '20px', border: '1px solid rgba(0,212,170,0.15)', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', inset: '60px', border: '1px solid rgba(0,212,170,0.1)', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: '6rem' }}>🅿️</div>

                {[
                  { top: '5%', left: '-5%', content: '✓ Slot P012 Reserved', className: 'float-card' },
                  { bottom: '5%', right: '-5%', content: '💳 Payment Confirmed', className: 'float-card' },
                  { top: '40%', right: '-10%', content: '📍 Floor 2 · Zone B', className: 'float-card' },
                  { bottom: '22%', left: '-8%', content: '⏱️ 10 min to pay', className: 'float-card' },
                ].map((card, i) => (
                  <div key={i} className={card.className} style={{
                    position: 'absolute', top: card.top, left: card.left, right: card.right, bottom: card.bottom,
                    background: '#1e293b', border: '1px solid #334155',
                    borderRadius: '10px', padding: '0.6rem 1rem',
                    fontSize: '0.8rem', color: '#e2e8f0', whiteSpace: 'nowrap',
                    opacity: 0
                  }}>
                    {card.content}
                  </div>
                ))}
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ── STATS ── */}
      <section ref={statsRef} style={{ background: '#1e293b', borderTop: '1px solid #334155', borderBottom: '1px solid #334155', padding: '2rem 0' }}>
        <Container>
          <Row className="g-3 text-center">
            {[['500', '500+', 'Parking Spots'], ['10000', '10K+', 'Happy Drivers'], ['99', '99.9%', 'Uptime'], ['24', '24/7', 'Support']].map(([target, display, label], i) => (
              <Col xs={6} md={3} key={i}>
                <div className="stat-number stat-number-animated" data-target={target}>{display}</div>
                <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.2rem' }}>{label}</div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: '5rem 0' }}>
        <Container>
          <div className="text-center mb-5">
            <h2 className="section-title">Why Choose EZpark?</h2>
            <div className="section-divider mx-auto" />
            <p style={{ color: '#94a3b8', maxWidth: '500px', margin: '0 auto' }}>Everything you need for a seamless parking experience.</p>
          </div>
          <Row ref={featuresRef} className="g-4">
            {features.map((f, i) => (
              <Col md={6} lg={4} key={i}>
                <div className="feature-card-anim ezp-card p-4 h-100" style={{ opacity: 0 }}>
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

      {/* ── MAP SECTION ── */}
      <section style={{ padding: '4rem 0', background: '#1e293b', borderTop: '1px solid #334155' }}>
        <Container>
          <div className="text-center mb-4">
            <h2 className="section-title">Find Us</h2>
            <div className="section-divider mx-auto" />
            <p style={{ color: '#94a3b8' }}>Main Parking Complex — Rajkot, Gujarat</p>
          </div>
          <MapView height={360} locationName="EZpark Main Parking Complex" />
        </Container>
      </section>

      {/* ── CTA ── */}
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
};

export default Landing;