import React from 'react';
import { FiZap, FiStar, FiInfo } from 'react-icons/fi';

const typeIcons = { ev: <FiZap size={13} />, vip: <FiStar size={13} />, handicapped: <FiInfo size={13} /> };

const SlotCard = ({ slot, selected, onSelect }) => {
  const unavailable = !slot.isAvailable;
  return (
    <div
      className={`slot-card ${unavailable ? 'unavailable' : ''} ${selected ? 'selected' : ''}`}
      onClick={() => !unavailable && onSelect && onSelect(slot)}
    >
      {selected && (
        <div style={{ position: 'absolute', top: 8, right: 8, background: '#00d4aa', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: '#0f172a', fontWeight: 'bold' }}>✓</div>
      )}
      <div className="d-flex justify-content-between align-items-start mb-2">
        <div className="slot-number">{slot.slotNumber}</div>
        <span className={`status-badge badge-${slot.type}`}>{typeIcons[slot.type]} {slot.type}</span>
      </div>
      <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
        {slot.floor} · {slot.location}
      </div>
      <div className="d-flex justify-content-between align-items-center">
        <div className="price-tag" style={{ fontSize: '1.1rem' }}>₹{slot.pricePerHour}<span style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 400 }}>/hr</span></div>
        <div>
          {slot.isAvailable ? (
            <span style={{ color: '#22c55e', fontSize: '0.75rem', fontWeight: 600 }}>● Available</span>
          ) : (
            <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 600 }}>● Occupied</span>
          )}
        </div>
      </div>
      {slot.features?.length > 0 && (
        <div className="mt-2 d-flex flex-wrap gap-1">
          {slot.features.map((f, i) => (
            <span key={i} style={{ background: '#0f172a', color: '#64748b', fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>{f}</span>
          ))}
        </div>
      )}
    </div>
  );
};

export default SlotCard;