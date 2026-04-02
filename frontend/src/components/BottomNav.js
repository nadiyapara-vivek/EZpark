import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiHome, FiMapPin, FiBook, FiUser, FiGrid } from 'react-icons/fi';
import { isLoggedIn, isAdmin } from '../utils/auth';

/**
 * BottomNav - Mobile app-like bottom navigation bar
 * Renders only on mobile screens (hidden on lg+)
 * Uses CSS media query via inline style + class
 */
const BottomNav = () => {
  const loggedIn = isLoggedIn();
  const admin = isAdmin();

  if (!loggedIn) return null;

  const navItems = [
    { to: '/', icon: <FiHome size={20} />, label: 'Home' },
    { to: '/slots', icon: <FiMapPin size={20} />, label: 'Parking' },
    { to: '/my-bookings', icon: <FiBook size={20} />, label: 'Bookings' },
    ...(admin ? [{ to: '/admin', icon: <FiGrid size={20} />, label: 'Admin' }] : []),
    { to: '/profile', icon: <FiUser size={20} />, label: 'Profile' },
  ];

  return (
    <>
      <style>{`
        .bottom-nav-bar {
          display: none;
        }
        @media (max-width: 991px) {
          .bottom-nav-bar {
            display: flex;
          }
          .bottom-nav-spacer {
            height: 72px;
          }
        }
      `}</style>

      {/* Spacer to prevent content being hidden behind nav */}
      <div className="bottom-nav-spacer" />

      <nav className="bottom-nav-bar" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        zIndex: 999,
        background: 'rgba(15,23,42,0.97)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid #334155',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingBottom: 'env(safe-area-inset-bottom, 8px)',
        paddingTop: 6,
        height: 64
      }}>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            style={({ isActive }) => ({
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 3,
              padding: '4px 12px',
              borderRadius: 10,
              color: isActive ? '#00d4aa' : '#64748b',
              textDecoration: 'none',
              fontSize: '0.65rem',
              fontWeight: 600,
              transition: 'all 0.15s',
              background: isActive ? 'rgba(0,212,170,0.08)' : 'transparent',
              minWidth: 52
            })}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
};

export default BottomNav;