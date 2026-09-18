import React, { useState, useEffect, useRef } from 'react';

const STYLE_ID = 'solar-panel-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes solar-pulse {
      0%,100% { opacity:.9; transform:scale(1); }
      50%      { opacity:1; transform:scale(1.04); }
    }
    @keyframes flow-dot {
      0%   { top:0%; opacity:0; }
      10%  { opacity:1; }
      90%  { opacity:1; }
      100% { top:100%; opacity:0; }
    }
    @keyframes glow-sun {
      0%,100% { box-shadow: 0 0 0 0 rgba(251,191,36,0); }
      50%      { box-shadow: 0 0 24px 8px rgba(251,191,36,0.35); }
    }
    @keyframes spin-ray {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes efficiency-fill {
      from { width:0%; }
    }
    @keyframes zone-pulse {
      0%,100% { transform:scale(1); }
      50%      { transform:scale(1.06); }
    }
  `;
  document.head.appendChild(style);
}

const FlowDot = ({ delay, color }) => (
  <span style={{
    position: 'absolute',
    left: 'calc(50% - 3.5px)',
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: color,
    boxShadow: `0 0 8px 3px ${color}88`,
    animation: `flow-dot 1.6s ${delay}s infinite ease-in-out`,
    pointerEvents: 'none',
  }} />
);

FlowDot.defaultProps = { delay: 0, color: '#fbbf24' };

const EnergyNode = ({ emoji, title, value, unit, accent, bg, children, nodeStyle }) => (
  <div style={{
    background: bg,
    border: `2px solid ${accent}33`,
    borderRadius: 16,
    padding: '18px 20px',
    minWidth: 160,
    textAlign: 'center',
    position: 'relative',
    animation: 'solar-pulse 4s ease-in-out infinite',
    boxShadow: `0 4px 18px ${accent}22`,
    ...nodeStyle,
  }}>
    <div style={{ fontSize: 30, marginBottom: 6, lineHeight: 1 }}>{emoji}</div>
    <div style={{ fontSize: 12, fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
      {title}
    </div>
    <div style={{ fontSize: 26, fontWeight: 900, color: '#111827', letterSpacing: '-0.5px' }}>
      {value}
      <span style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', marginLeft: 2 }}>{unit}</span>
    </div>
    {children}
  </div>
);

const VPipe = ({ color, dots }) => (
  <div style={{ display: 'flex', justifyContent: 'center', height: 52, position: 'relative' }}>
    <div style={{
      width: 4,
      background: `linear-gradient(to bottom, ${color}88, ${color}cc)`,
      borderRadius: 99,
      position: 'relative',
      overflow: 'visible',
    }}>
      {Array.from({ length: dots }).map((_, i) => (
        <FlowDot key={i} delay={i * (1.6 / dots)} color={color} />
      ))}
    </div>
  </div>
);

VPipe.defaultProps = { color: '#fbbf24', dots: 3 };

const ZoneBadge = ({ label, active, color }) => (
  <div style={{
    background: active ? `${color}18` : '#f9fafb',
    border: `1.5px solid ${active ? color : '#e5e7eb'}`,
    borderRadius: 10,
    padding: '8px 12px',
    fontSize: 12,
    fontWeight: 600,
    color: active ? color : '#9ca3af',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    transition: 'all 0.3s ease',
    animation: active ? 'zone-pulse 3s ease-in-out infinite' : 'none',
  }}>
    <span style={{ width: 7, height: 7, borderRadius: '50%', background: active ? color : '#d1d5db', display: 'inline-block' }} />
    {label}
  </div>
);

const SolarEnergyPanel = () => {
  const [solar, setSolar] = useState(8.4);
  const [pump, setPump] = useState(3.1);
  const [efficiency, setEfficiency] = useState(82);
  const [activeZones, setActiveZones] = useState([true, true, false, true]);
  const tickRef = useRef(null);

  useEffect(() => {
    tickRef.current = setInterval(() => {
      setSolar(v => +Math.max(7.0, Math.min(10.5, v + (Math.random() - 0.5) * 0.1)).toFixed(1));
      setPump(v  => +Math.max(2.0, Math.min(5.0,  v + (Math.random() - 0.5) * 0.08)).toFixed(1));
      setEfficiency(v => Math.max(70, Math.min(97, v + Math.round((Math.random() - 0.5) * 2))));
    }, 3000);
    return () => clearInterval(tickRef.current);
  }, []);

  const irrigation = (solar - pump).toFixed(1);
  const zones = activeZones.filter(Boolean).length;
  const toggleZone = (i) => setActiveZones(z => z.map((v, idx) => idx === i ? !v : v));
  const effColor = efficiency >= 80 ? '#16a34a' : efficiency >= 60 ? '#d97706' : '#dc2626';
  const effGrad  = efficiency >= 80
    ? 'linear-gradient(90deg,#16a34a,#22c55e)'
    : efficiency >= 60
      ? 'linear-gradient(90deg,#d97706,#fbbf24)'
      : 'linear-gradient(90deg,#dc2626,#f87171)';

  return (
    <div className="pro-card" style={{ padding: '22px 24px', background: 'linear-gradient(135deg,#fffbeb 0%,#f0fdf4 60%,#eff6ff 100%)', border: '1px solid #fef3c7' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'glow-sun 3s ease-in-out infinite' }}>
            <span style={{ fontSize: 18 }}>☀️</span>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#111827' }}>Solar Energy Flow</h3>
            <p style={{ margin: 0, fontSize: 11.5, color: '#9ca3af' }}>Real-time generation &amp; irrigation</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#dcfce7', borderRadius: 99, padding: '4px 12px' }}>
          <span style={{ width: 7, height: 7, background: '#16a34a', borderRadius: '50%', display: 'inline-block', animation: 'solar-pulse 1.2s ease-in-out infinite' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#15803d' }}>LIVE</span>
        </div>
      </div>

      {/* Flow Diagram */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 22 }}>
        <EnergyNode emoji="☀️" title="Solar Generation" value={solar} unit="kWh" accent="#f59e0b" bg="#fffbeb">
          <div style={{ position: 'absolute', top: -10, right: -10, width: 26, height: 26, background: 'radial-gradient(circle, #fbbf2488, transparent)', borderRadius: '50%', animation: 'spin-ray 8s linear infinite', border: '2px dashed #fbbf2466' }} />
        </EnergyNode>

        <VPipe color="#f59e0b" dots={3} />

        <EnergyNode emoji="💧" title="Water Pump" value={pump} unit="kWh" accent="#3b82f6" bg="#eff6ff" nodeStyle={{ animationDelay: '1s' }} />

        <VPipe color="#3b82f6" dots={3} />

        <EnergyNode emoji="🌱" title="Net Irrigation" value={irrigation} unit="kWh" accent="#16a34a" bg="#f0fdf4" nodeStyle={{ animationDelay: '2s' }}>
          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4, fontWeight: 500 }}>
            {zones} active zone{zones !== 1 ? 's' : ''}
          </div>
        </EnergyNode>
      </div>

      {/* Efficiency Bar */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>⚡ Energy Efficiency</span>
          <span style={{ fontSize: 14, fontWeight: 900, color: effColor }}>{efficiency}%</span>
        </div>
        <div style={{ height: 8, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${efficiency}%`, background: effGrad, borderRadius: 99, transition: 'width 0.6s ease', animation: 'efficiency-fill 0.8s ease-out' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: '#9ca3af', marginTop: 4 }}>
          <span>0%</span><span>Optimal ≥80%</span><span>100%</span>
        </div>
      </div>

      {/* Zones */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 10 }}>🌱 Irrigation Zones</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {activeZones.map((active, i) => (
            <button
              key={i}
              onClick={() => toggleZone(i)}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
              title={`Toggle Zone ${i + 1}`}
            >
              <ZoneBadge label={`Zone ${i + 1}`} active={active} color="#16a34a" />
            </button>
          ))}
        </div>
        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 8, textAlign: 'center' }}>Click a zone to toggle irrigation</div>
      </div>

      {/* Summary Row */}
      <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, background: '#fff', borderRadius: 12, padding: '12px 10px', border: '1px solid #f3f4f6' }}>
        {[
          { label: 'Generated', value: `${solar} kWh`, color: '#f59e0b' },
          { label: 'Consumed',  value: `${pump} kWh`,  color: '#3b82f6' },
          { label: 'Surplus',   value: `${Math.max(0, solar - pump).toFixed(1)} kWh`, color: '#16a34a' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10.5, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{label}</div>
            <div style={{ fontSize: 13.5, fontWeight: 800, color, marginTop: 2 }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SolarEnergyPanel;
