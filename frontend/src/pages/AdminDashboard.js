import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import {
  getAdminStats, getAdminUsers, deleteAdminUser,
  getAdminBookings, updateAdminBooking,
  getAllSlots, createSlot, updateSlot, deleteSlot, seedSlots,
  getAllPromos, createPromo, updatePromo, deletePromo, togglePromo
} from '../services/api';
import { FiUsers, FiMapPin, FiBook, FiDollarSign, FiTrash2, FiRefreshCw, FiPlus, FiEdit2, FiTag, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import SlotMap from '../components/SlotMap';

const TABS = ['Overview', 'Bookings', 'Slots', 'Floor Map', 'Users', 'Promos'];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [slots, setSlots] = useState([]);
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Slot form
  const [showSlotForm, setShowSlotForm] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [slotForm, setSlotForm] = useState({ slotNumber: '', location: 'Main Parking Complex', floor: 'Ground', type: 'standard', pricePerHour: 20, isAvailable: true, features: '' });

  // Promo form
  const [showPromoForm, setShowPromoForm] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [promoForm, setPromoForm] = useState({ code: '', description: '', discountType: 'percentage', discountValue: 10, minBookingAmount: 0, maxDiscount: '', usageLimit: '', isActive: true, expiresAt: '' });

  useEffect(() => {
    if (activeTab === 'Overview') fetchStats();
    else if (activeTab === 'Users') fetchUsers();
    else if (activeTab === 'Bookings') fetchBookings();
    else if (activeTab === 'Slots' || activeTab === 'Floor Map') fetchSlots();
    else if (activeTab === 'Promos') fetchPromos();
  }, [activeTab]);

  const fetchStats = async () => { setLoading(true); try { const { data } = await getAdminStats(); setStats(data.stats); } catch { toast.error('Failed'); } finally { setLoading(false); } };
  const fetchUsers = async () => { setLoading(true); try { const { data } = await getAdminUsers(); setUsers(data.users); } catch { toast.error('Failed'); } finally { setLoading(false); } };
  const fetchBookings = async () => { setLoading(true); try { const { data } = await getAdminBookings(); setBookings(data.bookings); } catch { toast.error('Failed'); } finally { setLoading(false); } };
  const fetchSlots = async () => { setLoading(true); try { const { data } = await getAllSlots(); setSlots(data.slots); } catch { toast.error('Failed'); } finally { setLoading(false); } };
  const fetchPromos = async () => { setLoading(true); try { const { data } = await getAllPromos(); setPromos(data.promos); } catch { toast.error('Failed'); } finally { setLoading(false); } };

  const handleDeleteUser = async (id) => { if (!window.confirm('Delete user?')) return; try { await deleteAdminUser(id); toast.success('Deleted'); fetchUsers(); } catch { toast.error('Failed'); } };
  const handleBookingStatus = async (id, status) => { try { await updateAdminBooking(id, { status }); toast.success('Updated'); fetchBookings(); } catch { toast.error('Failed'); } };

  const handleSlotSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...slotForm, features: slotForm.features ? slotForm.features.split(',').map(f => f.trim()) : [] };
    try {
      editingSlot ? await updateSlot(editingSlot._id, payload) : await createSlot(payload);
      toast.success(editingSlot ? 'Updated' : 'Created');
      setShowSlotForm(false); setEditingSlot(null);
      setSlotForm({ slotNumber: '', location: 'Main Parking Complex', floor: 'Ground', type: 'standard', pricePerHour: 20, isAvailable: true, features: '' });
      fetchSlots();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const startEditSlot = (slot) => { setEditingSlot(slot); setSlotForm({ ...slot, features: slot.features?.join(', ') || '' }); setShowSlotForm(true); };
  const handleDeleteSlot = async (id) => { if (!window.confirm('Delete slot?')) return; try { await deleteSlot(id); toast.success('Deleted'); fetchSlots(); } catch { toast.error('Failed'); } };

  // Promo handlers
  const handlePromoSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...promoForm,
      maxDiscount: promoForm.maxDiscount ? Number(promoForm.maxDiscount) : null,
      usageLimit: promoForm.usageLimit ? Number(promoForm.usageLimit) : null,
      expiresAt: promoForm.expiresAt || null
    };
    try {
      editingPromo ? await updatePromo(editingPromo._id, payload) : await createPromo(payload);
      toast.success(editingPromo ? 'Promo updated' : 'Promo created');
      setShowPromoForm(false); setEditingPromo(null);
      setPromoForm({ code: '', description: '', discountType: 'percentage', discountValue: 10, minBookingAmount: 0, maxDiscount: '', usageLimit: '', isActive: true, expiresAt: '' });
      fetchPromos();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };
  const startEditPromo = (promo) => { setEditingPromo(promo); setPromoForm({ ...promo, maxDiscount: promo.maxDiscount || '', usageLimit: promo.usageLimit || '', expiresAt: promo.expiresAt ? new Date(promo.expiresAt).toISOString().slice(0,10) : '' }); setShowPromoForm(true); };
  const handleDeletePromo = async (id) => { if (!window.confirm('Delete promo?')) return; try { await deletePromo(id); toast.success('Deleted'); fetchPromos(); } catch { toast.error('Failed'); } };
  const handleTogglePromo = async (id) => { try { const { data } = await togglePromo(id); toast.success(data.message); fetchPromos(); } catch { toast.error('Failed'); } };

  return (
    <div className="page-wrapper">
      <Container fluid>
        <div className="mb-4 px-2">
          <h2 className="section-title">Admin Dashboard</h2>
          <p style={{ color: '#94a3b8' }}>Manage your EZpark system.</p>
        </div>

        {/* Tabs */}
        <div className="d-flex gap-2 mb-4 flex-wrap px-2" style={{ overflowX: 'auto' }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '0.5rem 1.2rem', borderRadius: '10px', fontWeight: 600,
              cursor: 'pointer', fontSize: '0.88rem', whiteSpace: 'nowrap',
              border: activeTab === tab ? '1.5px solid #00d4aa' : '1px solid #334155',
              background: activeTab === tab ? 'rgba(0,212,170,0.1)' : 'transparent',
              color: activeTab === tab ? '#00d4aa' : '#94a3b8',
            }}>{tab}</button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === 'Overview' && (
          <div className="px-2">
            {loading ? <div className="text-center py-5"><div className="spinner-ezp mx-auto" /></div> : stats && (
              <>
                <Row className="g-3 mb-4">
                  {[
                    { label: 'Total Users', value: stats.totalUsers, icon: <FiUsers />, color: '#6c63ff' },
                    { label: 'Total Slots', value: stats.totalSlots, icon: <FiMapPin />, color: '#00d4aa' },
                    { label: 'Available Slots', value: stats.availableSlots, icon: <FiMapPin />, color: '#22c55e' },
                    { label: 'Total Bookings', value: stats.totalBookings, icon: <FiBook />, color: '#f59e0b' },
                    { label: 'Active Bookings', value: stats.activeBookings, icon: <FiBook />, color: '#60a5fa' },
                    { label: 'Total Revenue', value: `₹${stats.totalRevenue}`, icon: <FiDollarSign />, color: '#34d399' },
                  ].map((s, i) => (
                    <Col xs={6} md={4} lg={2} key={i}>
                      <div className="ezp-card p-3 h-100">
                        <div style={{ color: s.color, marginBottom: '0.5rem' }}>{s.icon}</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'Syne, sans-serif', color: s.color }}>{s.value}</div>
                        <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '2px' }}>{s.label}</div>
                      </div>
                    </Col>
                  ))}
                </Row>

                <div className="ezp-card p-4">
                  <h5 className="mb-3">Quick Admin Actions</h5>
                  <div className="d-flex flex-wrap gap-3">
                    {/* ✅ Changed: was "Seed Demo Slots" with seed logic — now "Manage Slots" navigates to Slots tab */}
                    <button className="btn btn-primary-ezp" onClick={() => setActiveTab('Slots')}>
                      <FiMapPin className="me-2" />Manage Slots
                    </button>
                    <button className="btn btn-outline-ezp" onClick={() => setActiveTab('Bookings')}>View All Bookings</button>
                    <button className="btn btn-outline-ezp" onClick={() => setActiveTab('Promos')}><FiTag className="me-2" />Manage Promos</button>
                    <button className="btn btn-outline-ezp" onClick={() => setActiveTab('Users')}>Manage Users</button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── BOOKINGS ── */}
        {activeTab === 'Bookings' && (
          <div className="px-2">
            <div className="ezp-card p-0" style={{ overflow: 'hidden' }}>
              <div className="p-3 d-flex justify-content-between align-items-center" style={{ borderBottom: '1px solid #334155' }}>
                <h5 className="m-0">All Bookings ({bookings.length})</h5>
                <button className="btn btn-outline-ezp btn-sm" onClick={fetchBookings}><FiRefreshCw /></button>
              </div>
              {loading ? <div className="text-center py-5"><div className="spinner-ezp mx-auto" /></div> : (
                <div className="table-responsive">
                  <table className="ezp-table">
                    <thead><tr><th>Booking ID</th><th>User</th><th>Slot</th><th>Vehicle</th><th>Date</th><th>Amount</th><th>Discount</th><th>Payment</th><th>Status</th><th>Action</th></tr></thead>
                    <tbody>
                      {bookings.map((b) => (
                        <tr key={b._id}>
                          <td style={{ fontSize: '0.75rem', color: '#64748b' }}>{b.bookingId}</td>
                          <td style={{ fontSize: '0.85rem' }}>{b.user?.name}<br /><span style={{ color: '#64748b', fontSize: '0.75rem' }}>{b.user?.email}</span></td>
                          <td style={{ fontWeight: 600 }}>{b.slot?.slotNumber}</td>
                          <td style={{ fontSize: '0.85rem' }}>{b.vehicleNumber}</td>
                          <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(b.startTime).toLocaleDateString()}</td>
                          <td className="price-tag" style={{ fontSize: '0.9rem' }}>₹{b.finalAmount || b.totalAmount}</td>
                          <td style={{ fontSize: '0.8rem', color: '#22c55e' }}>{b.discountAmount > 0 ? `-₹${b.discountAmount}` : '—'}</td>
                          <td><span className={`status-badge ${b.paymentStatus === 'paid' ? 'status-confirmed' : 'status-pending'}`}>{b.paymentStatus}</span></td>
                          <td><span className={`status-badge status-${b.status}`}>{b.status}</span></td>
                          <td>
                            <select className="form-select form-select-sm" style={{ background: '#0f172a', border: '1px solid #334155', color: '#94a3b8', borderRadius: '6px', fontSize: '0.78rem', minWidth: '100px' }}
                              value={b.status} onChange={(e) => handleBookingStatus(b._id, e.target.value)}>
                              {['pending','confirmed','active','completed','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SLOTS ── */}
        {activeTab === 'Slots' && (
          <div className="px-2">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="m-0">Parking Slots ({slots.length})</h5>
              {/* ✅ Changed: removed the Seed button — only Add Slot remains */}
              <button
                className="btn btn-primary-ezp btn-sm"
                onClick={() => {
                  setEditingSlot(null);
                  setSlotForm({ slotNumber: '', location: 'Main Parking Complex', floor: 'Ground', type: 'standard', pricePerHour: 20, isAvailable: true, features: '' });
                  setShowSlotForm(!showSlotForm);
                }}
              >
                <FiPlus className="me-1" />{showSlotForm ? 'Cancel' : 'Add Slot'}
              </button>
            </div>

            {showSlotForm && (
              <div className="ezp-card p-4 mb-4">
                <h5 className="mb-3" style={{ color: '#00d4aa' }}>{editingSlot ? 'Edit Slot' : 'Add Slot'}</h5>
                <form onSubmit={handleSlotSubmit}>
                  <Row className="g-3">
                    <Col xs={6} md={3}><label className="ezp-label">Slot Number</label><input className="form-control ezp-input" value={slotForm.slotNumber} onChange={e => setSlotForm({ ...slotForm, slotNumber: e.target.value })} required placeholder="P001" /></Col>
                    <Col xs={6} md={3}><label className="ezp-label">Type</label><select className="form-select ezp-input" value={slotForm.type} onChange={e => setSlotForm({ ...slotForm, type: e.target.value })}>{['standard','compact','ev','vip','handicapped'].map(t => <option key={t} value={t}>{t}</option>)}</select></Col>
                    <Col xs={6} md={2}><label className="ezp-label">Floor</label><input className="form-control ezp-input" value={slotForm.floor} onChange={e => setSlotForm({ ...slotForm, floor: e.target.value })} placeholder="Ground" /></Col>
                    <Col xs={6} md={2}><label className="ezp-label">Price/hr (₹)</label><input type="number" className="form-control ezp-input" value={slotForm.pricePerHour} onChange={e => setSlotForm({ ...slotForm, pricePerHour: +e.target.value })} min={1} required /></Col>
                    <Col xs={12} md={2}><label className="ezp-label">Available</label><select className="form-select ezp-input" value={slotForm.isAvailable} onChange={e => setSlotForm({ ...slotForm, isAvailable: e.target.value === 'true' })}><option value="true">Yes</option><option value="false">No</option></select></Col>
                    <Col xs={12} md={6}><label className="ezp-label">Location</label><input className="form-control ezp-input" value={slotForm.location} onChange={e => setSlotForm({ ...slotForm, location: e.target.value })} /></Col>
                    <Col xs={12} md={6}><label className="ezp-label">Features (comma-separated)</label><input className="form-control ezp-input" value={slotForm.features} onChange={e => setSlotForm({ ...slotForm, features: e.target.value })} placeholder="CCTV, EV Charging" /></Col>
                  </Row>
                  <div className="d-flex gap-2 mt-3">
                    <button type="submit" className="btn btn-primary-ezp">{editingSlot ? 'Update' : 'Create'} Slot</button>
                    <button type="button" className="btn btn-outline-ezp" onClick={() => { setShowSlotForm(false); setEditingSlot(null); }}>Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {loading ? <div className="text-center py-5"><div className="spinner-ezp mx-auto" /></div> : (
              <div className="ezp-card p-0" style={{ overflow: 'hidden' }}>
                <div className="table-responsive">
                  <table className="ezp-table">
                    <thead><tr><th>Slot No.</th><th>Type</th><th>Floor</th><th>Location</th><th>Price/hr</th><th>Features</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                      {slots.map(s => (
                        <tr key={s._id}>
                          <td style={{ fontWeight: 700 }}>{s.slotNumber}</td>
                          <td><span className={`status-badge badge-${s.type}`}>{s.type}</span></td>
                          <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{s.floor}</td>
                          <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{s.location}</td>
                          <td className="price-tag" style={{ fontSize: '0.9rem' }}>₹{s.pricePerHour}</td>
                          <td style={{ fontSize: '0.78rem', color: '#64748b' }}>{s.features?.join(', ') || '—'}</td>
                          <td><span className={`status-badge ${s.isAvailable ? 'status-confirmed' : 'status-cancelled'}`}>{s.isAvailable ? 'Available' : 'Occupied'}</span></td>
                          <td>
                            <div className="d-flex gap-1">
                              <button className="btn btn-sm" style={{ background: 'rgba(0,212,170,0.1)', color: '#00d4aa', border: 'none', borderRadius: '6px', padding: '0.3rem 0.6rem' }} onClick={() => startEditSlot(s)}><FiEdit2 size={13} /></button>
                              <button className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: '6px', padding: '0.3rem 0.6rem' }} onClick={() => handleDeleteSlot(s._id)}><FiTrash2 size={13} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── FLOOR MAP ── */}
        {activeTab === 'Floor Map' && (
          <div className="px-2">
            <div className="ezp-card p-4">
              <h5 className="mb-3">Floor Map View</h5>
              {loading ? <div className="text-center py-5"><div className="spinner-ezp mx-auto" /></div> : <SlotMap slots={slots} />}
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {activeTab === 'Users' && (
          <div className="px-2">
            <div className="ezp-card p-0" style={{ overflow: 'hidden' }}>
              <div className="p-3 d-flex justify-content-between align-items-center" style={{ borderBottom: '1px solid #334155' }}>
                <h5 className="m-0">All Users ({users.length})</h5>
                <button className="btn btn-outline-ezp btn-sm" onClick={fetchUsers}><FiRefreshCw /></button>
              </div>
              {loading ? <div className="text-center py-5"><div className="spinner-ezp mx-auto" /></div> : (
                <div className="table-responsive">
                  <table className="ezp-table">
                    <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Vehicle</th><th>Joined</th><th>Action</th></tr></thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u._id}>
                          <td style={{ fontWeight: 600 }}>{u.name}</td>
                          <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{u.email}</td>
                          <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{u.phone || '—'}</td>
                          <td style={{ fontSize: '0.85rem' }}>{u.vehicleNumber || '—'}</td>
                          <td style={{ color: '#64748b', fontSize: '0.8rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button onClick={() => handleDeleteUser(u._id)} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: '6px', padding: '0.3rem 0.7rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                              <FiTrash2 size={13} className="me-1" />Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PROMOS ── */}
        {activeTab === 'Promos' && (
          <div className="px-2">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="m-0">Promo Codes ({promos.length})</h5>
              <button className="btn btn-primary-ezp btn-sm" onClick={() => { setEditingPromo(null); setShowPromoForm(!showPromoForm); }}>
                <FiPlus className="me-1" />{showPromoForm ? 'Cancel' : 'Add Promo'}
              </button>
            </div>

            {showPromoForm && (
              <div className="ezp-card p-4 mb-4">
                <h5 className="mb-3" style={{ color: '#00d4aa' }}>{editingPromo ? 'Edit Promo' : 'Add Promo Code'}</h5>
                <form onSubmit={handlePromoSubmit}>
                  <Row className="g-3">
                    <Col xs={6} md={3}><label className="ezp-label">Code</label><input className="form-control ezp-input" style={{ textTransform: 'uppercase' }} value={promoForm.code} onChange={e => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })} required placeholder="SAVE20" /></Col>
                    <Col xs={6} md={3}><label className="ezp-label">Type</label><select className="form-select ezp-input" value={promoForm.discountType} onChange={e => setPromoForm({ ...promoForm, discountType: e.target.value })}><option value="percentage">Percentage (%)</option><option value="flat">Flat (₹)</option></select></Col>
                    <Col xs={6} md={2}><label className="ezp-label">Value</label><input type="number" className="form-control ezp-input" value={promoForm.discountValue} onChange={e => setPromoForm({ ...promoForm, discountValue: +e.target.value })} min={1} required /></Col>
                    <Col xs={6} md={2}><label className="ezp-label">Max Discount (₹)</label><input type="number" className="form-control ezp-input" value={promoForm.maxDiscount} onChange={e => setPromoForm({ ...promoForm, maxDiscount: e.target.value })} placeholder="No cap" /></Col>
                    <Col xs={6} md={2}><label className="ezp-label">Min Amount (₹)</label><input type="number" className="form-control ezp-input" value={promoForm.minBookingAmount} onChange={e => setPromoForm({ ...promoForm, minBookingAmount: +e.target.value })} min={0} /></Col>
                    <Col xs={6} md={2}><label className="ezp-label">Usage Limit</label><input type="number" className="form-control ezp-input" value={promoForm.usageLimit} onChange={e => setPromoForm({ ...promoForm, usageLimit: e.target.value })} placeholder="Unlimited" /></Col>
                    <Col xs={6} md={3}><label className="ezp-label">Expires At</label><input type="date" className="form-control ezp-input" value={promoForm.expiresAt} onChange={e => setPromoForm({ ...promoForm, expiresAt: e.target.value })} /></Col>
                    <Col xs={12} md={7}><label className="ezp-label">Description</label><input className="form-control ezp-input" value={promoForm.description} onChange={e => setPromoForm({ ...promoForm, description: e.target.value })} placeholder="20% off on all bookings" /></Col>
                  </Row>
                  <div className="d-flex gap-2 mt-3">
                    <button type="submit" className="btn btn-primary-ezp">{editingPromo ? 'Update' : 'Create'} Promo</button>
                    <button type="button" className="btn btn-outline-ezp" onClick={() => { setShowPromoForm(false); setEditingPromo(null); }}>Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {loading ? <div className="text-center py-5"><div className="spinner-ezp mx-auto" /></div> : (
              <div className="ezp-card p-0" style={{ overflow: 'hidden' }}>
                <div className="table-responsive">
                  <table className="ezp-table">
                    <thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Min</th><th>Used/Limit</th><th>Expires</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                      {promos.map(p => (
                        <tr key={p._id}>
                          <td style={{ fontWeight: 800, color: '#00d4aa', letterSpacing: 1 }}>{p.code}</td>
                          <td style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{p.discountType}</td>
                          <td style={{ fontWeight: 700, color: '#f59e0b' }}>{p.discountType === 'percentage' ? `${p.discountValue}%` : `₹${p.discountValue}`}{p.maxDiscount ? ` (max ₹${p.maxDiscount})` : ''}</td>
                          <td style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{p.minBookingAmount > 0 ? `₹${p.minBookingAmount}` : '—'}</td>
                          <td style={{ fontSize: '0.82rem' }}>{p.usedCount} / {p.usageLimit || '∞'}</td>
                          <td style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{p.expiresAt ? new Date(p.expiresAt).toLocaleDateString() : 'Never'}</td>
                          <td><span className={`status-badge ${p.isActive ? 'status-confirmed' : 'status-cancelled'}`}>{p.isActive ? 'Active' : 'Inactive'}</span></td>
                          <td>
                            <div className="d-flex gap-1">
                              <button className="btn btn-sm" title={p.isActive ? 'Deactivate' : 'Activate'} style={{ background: p.isActive ? 'rgba(239,68,68,0.1)' : 'rgba(0,212,170,0.1)', color: p.isActive ? '#ef4444' : '#00d4aa', border: 'none', borderRadius: '6px', padding: '0.3rem 0.6rem' }} onClick={() => handleTogglePromo(p._id)}>
                                {p.isActive ? <FiToggleRight size={14} /> : <FiToggleLeft size={14} />}
                              </button>
                              <button className="btn btn-sm" style={{ background: 'rgba(0,212,170,0.1)', color: '#00d4aa', border: 'none', borderRadius: '6px', padding: '0.3rem 0.6rem' }} onClick={() => startEditPromo(p)}><FiEdit2 size={13} /></button>
                              <button className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: '6px', padding: '0.3rem 0.6rem' }} onClick={() => handleDeletePromo(p._id)}><FiTrash2 size={13} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </Container>
    </div>
  );
};

export default AdminDashboard;