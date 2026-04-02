import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAllSlots } from '../services/api';
import SlotCard from '../components/SlotCard';
import SlotMap from '../components/SlotMap';
import { isLoggedIn } from '../utils/auth';
import { FiGrid, FiMap } from 'react-icons/fi';

const TYPES = ['all', 'standard', 'compact', 'ev', 'vip', 'handicapped'];

const Slots = () => {
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: 'all', isAvailable: '' });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => { fetchSlots(); }, [filter]);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter.type !== 'all') params.type = filter.type;
      if (filter.isAvailable !== '') params.isAvailable = filter.isAvailable;
      const { data } = await getAllSlots(params);
      setSlots(data.slots);
    } catch {
      toast.error('Failed to load slots');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (slot) => {
    if (!isLoggedIn()) {
      toast.info('Please login to book a slot');
      navigate('/login');
      return;
    }
    if (viewMode === 'map') {
      setSelectedSlot(slot);
    } else {
      navigate(`/booking/${slot._id}`);
    }
  };

  const handleMapBook = () => {
    if (selectedSlot) navigate(`/booking/${selectedSlot._id}`);
  };

  return (
    <div className="page-wrapper">
      <Container>
        <div className="mb-4">
          <h2 className="section-title">Find Parking</h2>
          <div className="section-divider" />
          <p style={{ color: '#94a3b8' }}>Browse and book available parking slots in real time.</p>
        </div>

        {/* Filters + view toggle */}
        <div className="ezp-card p-3 mb-4">
          <Row className="g-3 align-items-end">
            <Col xs={12} md={5}>
              <label className="ezp-label">Slot Type</label>
              <div className="d-flex flex-wrap gap-2 mt-1">
                {TYPES.map((t) => (
                  <button key={t} onClick={() => setFilter({ ...filter, type: t })} style={{
                    padding: '0.3rem 0.9rem', borderRadius: '20px',
                    border: filter.type === t ? '1.5px solid #00d4aa' : '1px solid #334155',
                    background: filter.type === t ? 'rgba(0,212,170,0.1)' : 'transparent',
                    color: filter.type === t ? '#00d4aa' : '#94a3b8',
                    fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
                  }}>{t === 'all' ? 'All Types' : t}</button>
                ))}
              </div>
            </Col>
            <Col xs={12} md={3}>
              <label className="ezp-label">Availability</label>
              <select className="form-select ezp-input mt-1" value={filter.isAvailable} onChange={(e) => setFilter({ ...filter, isAvailable: e.target.value })}>
                <option value="">All Slots</option>
                <option value="true">Available Only</option>
                <option value="false">Occupied Only</option>
              </select>
            </Col>
            <Col xs={12} md={4}>
              <div className="d-flex justify-content-between align-items-center">
                <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                  <span style={{ color: '#00d4aa', fontWeight: 700 }}>{slots.length}</span> slots
                </div>
                {/* View toggle */}
                <div style={{ display: 'flex', gap: 4, background: '#0f172a', borderRadius: 10, padding: 4, border: '1px solid #334155' }}>
                  {[{ id: 'grid', icon: <FiGrid size={15} />, label: 'Grid' }, { id: 'map', icon: <FiMap size={15} />, label: 'Floor Map' }].map(v => (
                    <button key={v.id} onClick={() => { setViewMode(v.id); setSelectedSlot(null); }} style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '0.3rem 0.8rem', borderRadius: 7, border: 'none',
                      background: viewMode === v.id ? 'rgba(0,212,170,0.15)' : 'transparent',
                      color: viewMode === v.id ? '#00d4aa' : '#64748b',
                      fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer',
                    }}>{v.icon}{v.label}</button>
                  ))}
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Legend (grid mode only) */}
        {viewMode === 'grid' && (
          <div className="d-flex gap-4 mb-4 flex-wrap">
            {[['Available', '#22c55e'], ['Occupied', '#ef4444']].map(([label, color]) => (
              <div key={label} className="d-flex align-items-center gap-2" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                {label}
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-ezp mx-auto" />
            <p style={{ color: '#94a3b8', marginTop: '1rem' }}>Loading slots...</p>
          </div>
        ) : slots.length === 0 ? (
          <div className="text-center py-5">
            <div style={{ fontSize: '3rem' }}>🅿️</div>
            <p style={{ color: '#94a3b8', marginTop: '1rem' }}>No slots found.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <Row className="g-3">
            {slots.map((slot) => (
              <Col xs={6} sm={4} md={3} lg={2} key={slot._id}>
                <SlotCard slot={slot} onSelect={handleSelect} />
              </Col>
            ))}
          </Row>
        ) : (
          <div className="ezp-card p-4">
            <SlotMap slots={slots} onSelect={handleSelect} selectedSlot={selectedSlot} />
            {selectedSlot && (
              <div className="text-center mt-4">
                <button className="btn btn-primary-ezp px-5" onClick={handleMapBook}>
                  Book {selectedSlot.slotNumber} →
                </button>
              </div>
            )}
          </div>
        )}
      </Container>
    </div>
  );
};

export default Slots;