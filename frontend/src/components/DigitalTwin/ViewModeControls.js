import React from 'react';
import { VIEW_MODES } from './digitalTwinData';

const iconMap = {
  normal:        '🗺️',
  cropHealth:    '🌿',
  water:         '💧',
  diseaseRisk:   '🦠',
  profitability: '💰',
};

export default function ViewModeControls({ activeMode, onChange, onResetCamera }) {
  return (
    <div style={{
      position: 'absolute',
      bottom: 16,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: 8,
      background: 'rgba(15, 23, 42, 0.88)',
      backdropFilter: 'blur(12px)',
      borderRadius: 40,
      padding: '8px 14px',
      border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      zIndex: 10,
      flexWrap: 'wrap',
      justifyContent: 'center',
    }}>
      {/* Reset Camera */}
      <button
        onClick={onResetCamera}
        title="Reset Camera View"
        style={{
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 20,
          color: '#94a3b8',
          fontSize: 11,
          fontWeight: 600,
          padding: '5px 12px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          fontFamily: "'Inter', sans-serif",
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#f1f5f9'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#94a3b8'; }}
      >
        🔄 Reset View
      </button>

      {/* Divider */}
      <div style={{ width: 1, background: 'rgba(255,255,255,0.1)', margin: '4px 2px' }} />

      {/* Mode buttons */}
      {VIEW_MODES.map(mode => {
        const isActive = activeMode === mode.key;
        return (
          <button
            key={mode.key}
            onClick={() => onChange(mode.key)}
            title={mode.desc}
            style={{
              background: isActive ? '#16a34a' : 'rgba(255,255,255,0.05)',
              border: isActive ? '1px solid #16a34a' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: 20,
              color: isActive ? '#fff' : '#94a3b8',
              fontSize: 11,
              fontWeight: 600,
              padding: '5px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontFamily: "'Inter', sans-serif",
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#f1f5f9'; } }}
            onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94a3b8'; } }}
          >
            <span>{iconMap[mode.key]}</span>
            <span>{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
}
