import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { FiUser, FiLogOut, FiGrid, FiBook, FiShield } from 'react-icons/fi';
import { isLoggedIn, getUser, logout } from '../utils/auth';

const AppNavbar = () => {
  const navigate = useNavigate();
  const loggedIn = isLoggedIn();
  const user = getUser();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setExpanded(false);
  };

  return (
    <Navbar expand="lg" className="ezp-navbar" expanded={expanded} onToggle={setExpanded}>
      <Container>
        <Navbar.Brand as={Link} to="/" className="ezp-brand">
          EZ<span>park</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="nav-main" style={{ border: '1px solid #334155' }}>
          <span style={{ color: '#94a3b8', fontSize: '1.2rem' }}>☰</span>
        </Navbar.Toggle>
        <Navbar.Collapse id="nav-main">
          <Nav className="me-auto">
            <NavLink to="/" className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`} onClick={() => setExpanded(false)}>Home</NavLink>
            <NavLink to="/slots" className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`} onClick={() => setExpanded(false)}>Find Parking</NavLink>
          </Nav>
          <Nav className="align-items-lg-center gap-2">
            {loggedIn ? (
              <>
                {user?.role === 'admin' && (
                  <NavLink to="/admin" className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`} onClick={() => setExpanded(false)}>
                    <FiShield className="me-1" />Admin
                  </NavLink>
                )}
                <NavDropdown
                  title={<span style={{ color: '#94a3b8' }}><FiUser className="me-1" />{user?.name?.split(' ')[0]}</span>}
                  id="user-dropdown"
                  menuVariant="dark"
                  align="end"
                >
                  <NavDropdown.Item as={Link} to="/dashboard" onClick={() => setExpanded(false)}><FiGrid className="me-2" />Dashboard</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/my-bookings" onClick={() => setExpanded(false)}><FiBook className="me-2" />My Bookings</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/profile" onClick={() => setExpanded(false)}><FiUser className="me-2" />Profile</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout} style={{ color: '#ef4444' }}><FiLogOut className="me-2" />Logout</NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-ezp btn-sm" onClick={() => setExpanded(false)}>Login</Link>
                <Link to="/register" className="btn btn-primary-ezp btn-sm" onClick={() => setExpanded(false)}>Sign Up</Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;