import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';       // ← replaces Home (GSAP animated)
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Slots from './pages/Slots';           // ← updated with floor map toggle
import Booking from './pages/Booking';       // ← updated with promo + map
import Checkout from './pages/Checkout';     // ← updated with timer + promo
import BookingSuccess from './pages/BookingSuccess'; // ← updated with QR + map + log
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import MyBookings from './pages/MyBookings'; // ← updated with extend + QR + log
import AdminDashboard from './pages/AdminDashboard'; // ← updated with promos + floor map
import BookingHistory from './pages/BookingHistory'; // ← NEW: charts & analytics

function App() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <main className="flex-grow-1">
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/slots" element={<Slots />} />

            {/* Protected */}
            <Route path="/booking/:slotId" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
            <Route path="/checkout/:bookingId" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/booking-success/:bookingId" element={<ProtectedRoute><BookingSuccess /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
            <Route path="/booking-history" element={<ProtectedRoute><BookingHistory /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          </Routes>
        </main>
        <Footer />

        {/* Mobile bottom nav — auto-hides on desktop via CSS media query */}
        <BottomNav />

        <ToastContainer
          position="top-right"
          autoClose={3000}
          theme="dark"
          toastStyle={{ background: '#1e293b', border: '1px solid #334155' }}
        />
      </div>
    </Router>
  );
}

export default App;