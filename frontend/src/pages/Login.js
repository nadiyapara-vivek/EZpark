import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { loginUser } from '../services/api';
import { saveAuth } from '../utils/auth';

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await loginUser(form);
      saveAuth(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`);
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card fade-in-up">
        <div className="text-center mb-4">
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800 }}>Welcome back</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Sign in to your EZpark account</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="ezp-label">Email Address</label>
            <input type="email" name="email" className="form-control ezp-input" placeholder="example@ezpark.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <div className="d-flex justify-content-between">
              <label className="ezp-label">Password</label>
              <Link to="/forgot-password" style={{ color: '#00d4aa', fontSize: '0.8rem' }}>Forgot password?</Link>
            </div>
            <input type="password" name="password" className="form-control ezp-input" placeholder="••••••••" value={form.password} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn btn-primary-ezp w-100 mt-2" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="text-center mt-4" style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
          Don't have an account? <Link to="/register" style={{ color: '#00d4aa' }}>Sign up free</Link>
        </div>
     
      </div>
    </div>
  );
};

export default Login;