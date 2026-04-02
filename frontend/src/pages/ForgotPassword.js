import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { forgotPassword } from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword({ email });
      setSent(true);
      toast.success('Reset instructions sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card fade-in-up">
        <div className="text-center mb-4">
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800 }}>Reset Password</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Enter your email to receive reset instructions</p>
        </div>
        {sent ? (
          <div className="text-center">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📬</div>
            <p style={{ color: '#94a3b8' }}>Check your email for password reset instructions.</p>
            <Link to="/login" className="btn btn-primary-ezp mt-3">Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="ezp-label">Email Address</label>
              <input type="email" className="form-control ezp-input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary-ezp w-100 mt-2" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}
        <div className="text-center mt-4" style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
          <Link to="/login" style={{ color: '#00d4aa' }}>← Back to login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;