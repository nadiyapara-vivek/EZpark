import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { registerUser } from '../services/api';
import { saveAuth } from '../utils/auth';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', vehicleNumber: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await registerUser(form);
      saveAuth(data.token, data.user);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card fade-in-up">
        <div className="text-center mb-4">
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800 }}>Create Account</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Join EZpark — it's free forever</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="ezp-label">Full Name</label>
            <input type="text" name="name" className="form-control ezp-input" placeholder="Write Your Name Here" value={form.name} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="ezp-label">Email Address</label>
            <input type="email" name="email" className="form-control ezp-input" placeholder="example@ezpark.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="ezp-label">Password</label>
            <input type="password" name="password" className="form-control ezp-input" placeholder="Min. 6 characters" value={form.password} onChange={handleChange} required minLength={6} />
          </div>
          <div className="row g-3 mb-3">
            <div className="col-6">
              <label className="ezp-label">Phone (optional)</label>
              <input type="tel" name="phone" className="form-control ezp-input" placeholder="+91 12345 67890" value={form.phone} onChange={handleChange} />
            </div>
            <div className="col-6">
              <label className="ezp-label">Vehicle No. (optional)</label>
              <input type="text" name="vehicleNumber" className="form-control ezp-input" placeholder="GJ03AB1234" value={form.vehicleNumber} onChange={handleChange} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary-ezp w-100 mt-1" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <div className="text-center mt-4" style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color: '#00d4aa' }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;