import React from 'react';

const panelStyle = {
  position: 'absolute',
  top: 16,
  right: 16,
  width: 230,
  background: 'rgba(15, 23, 42, 0.92)',
  backdropFilter: 'blur(12px)',
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,0.1)',
  padding: '16px 18px',
  color: '#f1f5f9',
  fontFamily: "'Inter', sans-serif",
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  zIndex: 10,
};

const rowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '6px 0',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
};

const labelStyle = {
  fontSize: 11,
  color: '#94a3b8',
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const valueStyle = {
  fontSize: 13,
  color: '#f1f5f9',
  fontWeight: 600,
};

function StatBar({ value, color }) {
  return (
    <div style={{ width: 70, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
      <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.4s ease' }} />
    </div>
  );
}

export default function ZoneInfoPanel({ zone, onClose }) {
  if (!zone) return null;

  return (
    <div style={panelStyle}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>{zone.name}</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{zone.crop}</div>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 6, width: 24, height: 24, cursor: 'pointer', color: '#94a3b8', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          ✕
        </button>
      </div>

      {/* Info rows */}
      {[
        { label: 'Growth Stage', value: zone.growthStage },
        { label: 'Area', value: zone.area },
      ].map(({ label, value }) => (
        <div key={label} style={rowStyle}>
          <span style={labelStyle}>{label}</span>
          <span style={valueStyle}>{value}</span>
        </div>
      ))}

      {/* Stat bars */}
      <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { label: 'Crop Health', value: zone.health, color: '#22c55e' },
          { label: 'Soil Moisture', value: zone.soilMoisture, color: '#3b82f6' },
          { label: 'Disease Risk', value: zone.diseaseRisk, color: '#ef4444' },
          { label: 'Profitability', value: zone.profitability, color: '#f59e0b' },
        ].map(({ label, value, color }) => (
          <div key={label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={labelStyle}>{label}</span>
              <span style={{ fontSize: 11, color, fontWeight: 600 }}>{value}%</span>
            </div>
            <StatBar value={value} color={color} />
          </div>
        ))}
      </div>

      {/* Stage 2 notice */}
      <div style={{ marginTop: 14, fontSize: 10, color: '#475569', textAlign: 'center', fontStyle: 'italic' }}>
        Live sensor data — Stage 2
      </div>
    </div>
  );
}
