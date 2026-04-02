import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { updateProfile, changePassword } from '../services/api';
import { getUser, saveAuth, getToken } from '../utils/auth';

const Profile = () => {
  const user = getUser();
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '', vehicleNumber: user?.vehicleNumber || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await updateProfile(profile);
      saveAuth(getToken(), data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setChangingPw(true);
    try {
      await changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password changed!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Container>
        <div className="mb-4">
          <h2 className="section-title">My Profile</h2>
          <div className="section-divider" />
        </div>
        <Row className="g-4">
          {/* Avatar card */}
          <Col lg={3}>
            <div className="ezp-card p-4 text-center">
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(0,212,170,0.15)', border: '2px solid #00d4aa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1rem' }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <h5 style={{ fontFamily: 'Syne, sans-serif' }}>{user?.name}</h5>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{user?.email}</p>
              <span className={`status-badge ${user?.role === 'admin' ? 'status-confirmed' : 'status-completed'}`}>
                {user?.role === 'admin' ? '🛡 Admin' : '👤 User'}
              </span>
            </div>
          </Col>

          <Col lg={9}>
            {/* Profile info */}
            <div className="ezp-card p-4 mb-4">
              <h5 className="mb-4" style={{ color: '#00d4aa' }}>Personal Information</h5>
              <form onSubmit={handleProfileSave}>
                <Row className="g-3">
                  <Col md={6}>
                    <label className="ezp-label">Full Name</label>
                    <input className="form-control ezp-input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
                  </Col>
                  <Col md={6}>
                    <label className="ezp-label">Email (read-only)</label>
                    <input className="form-control ezp-input" value={user?.email} readOnly style={{ opacity: 0.6 }} />
                  </Col>
                  <Col md={6}>
                    <label className="ezp-label">Phone Number</label>
                    <input className="form-control ezp-input" placeholder="+1 555 000" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                  </Col>
                  <Col md={6}>
                    <label className="ezp-label">Vehicle Number</label>
                    <input className="form-control ezp-input" placeholder="MH01AB1234" value={profile.vehicleNumber} onChange={(e) => setProfile({ ...profile, vehicleNumber: e.target.value.toUpperCase() })} />
                  </Col>
                </Row>
                <button type="submit" className="btn btn-primary-ezp mt-4" disabled={saving}>
                  {saving ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>

            {/* Change password */}
            <div className="ezp-card p-4">
              <h5 className="mb-4" style={{ color: '#00d4aa' }}>Change Password</h5>
              <form onSubmit={handlePasswordChange}>
                <Row className="g-3">
                  <Col md={12}>
                    <label className="ezp-label">Current Password</label>
                    <input type="password" className="form-control ezp-input" placeholder="••••••••" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} required />
                  </Col>
                  <Col md={6}>
                    <label className="ezp-label">New Password</label>
                    <input type="password" className="form-control ezp-input" placeholder="Min. 6 characters" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} required minLength={6} />
                  </Col>
                  <Col md={6}>
                    <label className="ezp-label">Confirm New Password</label>
                    <input type="password" className="form-control ezp-input" placeholder="Repeat password" value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} required />
                  </Col>
                </Row>
                <button type="submit" className="btn btn-outline-ezp mt-4" disabled={changingPw}>
                  {changingPw ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                  {changingPw ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Profile;