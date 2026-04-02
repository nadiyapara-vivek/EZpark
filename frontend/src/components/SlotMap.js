import React, { useState } from 'react';

/**
 * SlotMap - Visual floor map showing parking slots by floor
 * Color-coded by availability and type
 */
const TYPE_COLORS = {
  standard: { bg: '#334155', border: '#475569', text: '#94a3b8', label: 'S' },
  compact:  { bg: 'rgba(108,99,255,0.2)', border: '#818cf8', text: '#818cf8', label: 'C' },
  ev:       { bg: 'rgba(34,197,94,0.15)', border: '#22c55e', text: '#22c55e', label: 'EV' },
  vip:      { bg: 'rgba(245,158,11,0.15)', border: '#f59e0b', text: '#f59e0b', label: 'V' },
  handicapped: { bg: 'rgba(59,130,246,0.15)', border: '#60a5fa', text: '#60a5fa', label: '♿' }
};

const SlotBox = ({ slot, selected, onSelect }) => {
  const colors = TYPE_COLORS[slot.type] || TYPE_COLORS.standard;
  const isSelected = selected?._id === slot._id;

  return (
    <div
      onClick={() => slot.isAvailable && onSelect && onSelect(slot)}
      title={`${slot.slotNumber} · ${slot.type} · ₹${slot.pricePerHour}/hr · ${slot.isAvailable ? 'Available' : 'Occupied'}`}
      style={{
        width: 52, height: 38,
        borderRadius: 6,
        border: `2px solid ${isSelected ? '#00d4aa' : slot.isAvailable ? colors.border : '#1e293b'}`,
        background: isSelected ? 'rgba(0,212,170,0.15)' : slot.isAvailable ? colors.bg : 'rgba(239,68,68,0.08)',
        cursor: slot.isAvailable ? 'pointer' : 'not-allowed',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 2,
        opacity: slot.isAvailable ? 1 : 0.45,
        transition: 'all 0.15s',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Occupied stripe */}
      {!slot.isAvailable && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(239,68,68,0.1) 4px, rgba(239,68,68,0.1) 8px)'
        }} />
      )}
      <div style={{ fontSize: '0.6rem', fontWeight: 700, color: isSelected ? '#00d4aa' : slot.isAvailable ? colors.text : '#64748b' }}>
        {slot.slotNumber}
      </div>
      <div style={{
        fontSize: '0.55rem',
        background: isSelected ? 'rgba(0,212,170,0.2)' : slot.isAvailable ? `${colors.border}22` : 'transparent',
        color: isSelected ? '#00d4aa' : slot.isAvailable ? colors.text : '#475569',
        padding: '0 3px', borderRadius: 3, fontWeight: 600
      }}>
        {colors.label}
      </div>
    </div>
  );
};

const SlotMap = ({ slots = [], onSelect, selectedSlot }) => {
  const [activeFloor, setActiveFloor] = useState(null);

  // Group slots by floor
  const floors = {};
  slots.forEach(s => {
    const f = s.floor || 'Ground';
    if (!floors[f]) floors[f] = [];
    floors[f].push(s);
  });
  const floorNames = Object.keys(floors).sort();
  const currentFloor = activeFloor || floorNames[0];

  const currentSlots = floors[currentFloor] || [];
  const available = currentSlots.filter(s => s.isAvailable).length;

  return (
    <div>
      {/* Floor selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {floorNames.map(f => (
          <button
            key={f}
            onClick={() => setActiveFloor(f)}
            style={{
              padding: '0.35rem 0.9rem',
              borderRadius: 20,
              fontWeight: 600, fontSize: '0.82rem',
              cursor: 'pointer',
              border: currentFloor === f ? '1.5px solid #00d4aa' : '1px solid #334155',
              background: currentFloor === f ? 'rgba(0,212,170,0.1)' : 'transparent',
              color: currentFloor === f ? '#00d4aa' : '#94a3b8',
              transition: 'all 0.15s'
            }}
          >
            {f} <span style={{ opacity: 0.7, fontSize: '0.75rem' }}>({floors[f].filter(s => s.isAvailable).length}/{floors[f].length})</span>
          </button>
        ))}
      </div>

      {/* Map header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
          <span style={{ color: '#00d4aa', fontWeight: 700 }}>{available}</span> available · {currentSlots.length - available} occupied
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {Object.entries(TYPE_COLORS).map(([type, c]) => (
            <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: c.text }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: c.bg, border: `1px solid ${c.border}` }} />
              {type}
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: '#ef4444' }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(239,68,68,0.08)', border: '1px solid #ef4444', opacity: 0.5 }} />
            occupied
          </div>
        </div>
      </div>

      {/* Parking map area */}
      <div style={{
        background: '#0f172a',
        border: '1px solid #334155',
        borderRadius: 12,
        padding: '20px 16px',
        position: 'relative',
        overflow: 'auto'
      }}>
        {/* Road lane */}
        <div style={{
          position: 'absolute', left: 0, right: 0,
          top: '50%', transform: 'translateY(-50%)',
          height: 28,
          background: 'rgba(255,255,255,0.02)',
          borderTop: '1px dashed #1e293b',
          borderBottom: '1px dashed #1e293b',
          pointerEvents: 'none'
        }} />

        {/* Row 1 — top */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 28 }}>
          {currentSlots.slice(0, Math.ceil(currentSlots.length / 2)).map(s => (
            <SlotBox key={s._id} slot={s} selected={selectedSlot} onSelect={onSelect} />
          ))}
        </div>

        {/* DRIVE label */}
        <div style={{
          textAlign: 'center',
          color: '#1e293b',
          fontSize: '0.65rem',
          fontWeight: 700,
          letterSpacing: 4,
          marginBottom: 28,
          position: 'relative', zIndex: 1
        }}>▶ ─ ─ DRIVE LANE ─ ─ ▶</div>

        {/* Row 2 — bottom */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {currentSlots.slice(Math.ceil(currentSlots.length / 2)).map(s => (
            <SlotBox key={s._id} slot={s} selected={selectedSlot} onSelect={onSelect} />
          ))}
        </div>
      </div>

      {/* Selected slot info */}
      {selectedSlot && (
        <div style={{
          marginTop: 12,
          padding: '0.8rem 1rem',
          background: 'rgba(0,212,170,0.05)',
          border: '1px solid #00d4aa',
          borderRadius: 10,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <span style={{ fontWeight: 700, color: '#00d4aa' }}>{selectedSlot.slotNumber}</span>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem', marginLeft: 10 }}>{selectedSlot.type} · {selectedSlot.floor}</span>
          </div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: '#00d4aa' }}>₹{selectedSlot.pricePerHour}/hr</span>
        </div>
      )}

      {slots.length === 0 && (
        <div style={{ textAlign: 'center', color: '#475569', padding: 40, fontSize: '0.9rem' }}>
          🅿️ No slots available to display
        </div>
      )}
    </div>
  );
};

export default SlotMap;