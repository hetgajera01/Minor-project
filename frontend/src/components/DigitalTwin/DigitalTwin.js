import React, { useRef, useState, useEffect, Suspense, lazy } from 'react';
import axios from 'axios';
import { FARM_ZONES } from './digitalTwinData';
import { layoutZones } from './farmConfigUtils';
import ZoneInfoPanel from './ZoneInfoPanel';
import ViewModeControls from './ViewModeControls';
import FarmConfigModal from './FarmConfigModal';

const FarmScene = lazy(() => import('./FarmScene'));

/* ── Error Boundary ──────────────────────────────────────────────── */
class FarmSceneErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: '#94a3b8', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ fontSize: 40 }}>🌾</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9' }}>3D View Unavailable</div>
        <div style={{ fontSize: 13, color: '#64748b', textAlign: 'center', maxWidth: 280 }}>
          Your browser may not support WebGL. Try Chrome or Firefox.
        </div>
      </div>
    );
    return this.props.children;
  }
}

/* ── Stat chip ───────────────────────────────────────────────────── */
function StatChip({ label, value, accent }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 14px', fontFamily: "'Inter', sans-serif", minWidth: 90 }}>
      <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: accent || '#f1f5f9' }}>{value}</div>
    </div>
  );
}

/* ── Zone legend ─────────────────────────────────────────────────── */
function ZoneLegend({ zones }) {
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      {zones.map(z => (
        <div key={z.id} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#94a3b8', fontFamily: "'Inter', sans-serif" }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: z.color || '#64748b' }} />
          {z.name} – {z.crop}
        </div>
      ))}
    </div>
  );
}

/* ── Setup screen — shown when no farm config exists ─────────────── */
function SetupScreen({ onSetup }) {
  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20, fontFamily: "'Inter', sans-serif" }}>
      <div style={{ fontSize: 56 }}>🌾</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', textAlign: 'center' }}>Welcome to Your Farm Digital Twin</div>
      <div style={{ fontSize: 14, color: '#64748b', textAlign: 'center', maxWidth: 380, lineHeight: 1.7 }}>
        You haven't configured your farm yet.<br />Set up your farm area and zones to generate your personalised 3D farm.
      </div>
      <button
        onClick={onSetup}
        style={{
          fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 14,
          background: 'linear-gradient(135deg, #16a34a, #15803d)',
          color: '#fff', border: 'none', borderRadius: 10,
          padding: '12px 28px', cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(22,163,74,0.35)',
          transition: 'all 0.2s',
        }}
      >
        🚜 Create Farm Configuration
      </button>
    </div>
  );
}

/* ── Icon button ─────────────────────────────────────────────────── */
function IconBtn({ onClick, children, title, danger }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 12,
        background: danger ? 'rgba(220,38,38,0.15)' : 'rgba(255,255,255,0.07)',
        border: danger ? '1px solid rgba(220,38,38,0.3)' : '1px solid rgba(255,255,255,0.12)',
        borderRadius: 8, color: danger ? '#fca5a5' : '#94a3b8',
        padding: '7px 14px', cursor: 'pointer', transition: 'all 0.18s',
        display: 'flex', alignItems: 'center', gap: 5,
      }}
      onMouseEnter={e => { e.currentTarget.style.background = danger ? 'rgba(220,38,38,0.28)' : 'rgba(255,255,255,0.14)'; e.currentTarget.style.color = danger ? '#fca5a5' : '#f1f5f9'; }}
      onMouseLeave={e => { e.currentTarget.style.background = danger ? 'rgba(220,38,38,0.15)' : 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = danger ? '#fca5a5' : '#94a3b8'; }}
    >
      {children}
    </button>
  );
}

/* ── Main DigitalTwin component ──────────────────────────────────── */
export default function DigitalTwin({ onClose }) {
  const userEmail   = localStorage.getItem('userEmail') || '';
  const controlsRef = useRef();

  // UI state
  const [viewMode,       setViewMode]       = useState('normal');
  const [selectedZone,   setSelectedZone]   = useState(null);
  const [showModal,      setShowModal]       = useState(false);

  // Data state
  const [farmConfig,  setFarmConfig]  = useState(null);   // raw config from DB
  const [zones3d,     setZones3d]     = useState([]);     // layout-computed zones for 3D
  const [loading,     setLoading]     = useState(true);
  const [fetchError,  setFetchError]  = useState(false);

  // ── Fetch farm config on mount ─────────────────────────────────
  useEffect(() => {
    if (!userEmail) { setLoading(false); return; }
    axios.get(`/api/user/farm-config?email=${encodeURIComponent(userEmail)}`)
      .then(res => {
        applyConfig(res.data);
      })
      .catch(err => {
        if (err.response?.status === 404) {
          // No config yet — show setup screen
          setFarmConfig(null);
          setZones3d([]);
        } else {
          // Network error — fall back to demo data
          console.warn('Farm config fetch failed, using demo data:', err.message);
          setFetchError(true);
          const demoZones = layoutZones(FARM_ZONES.map(z => ({
            ...z, area: parseFloat(z.area),
          })), 9.3);
          setFarmConfig({ totalArea: 9.3, zones: FARM_ZONES, _isDemo: true });
          setZones3d(demoZones);
        }
      })
      .finally(() => setLoading(false));
  }, [userEmail]); // eslint-disable-line

  function applyConfig(config) {
    setFarmConfig(config);
    setZones3d(layoutZones(config.zones, config.totalArea));
    setSelectedZone(null);
  }

  function handleSaved(config) {
    applyConfig(config);
    setShowModal(false);
  }

  function handleResetCamera() {
    if (controlsRef.current) controlsRef.current.reset();
  }

  // ── Derived display values ────────────────────────────────────
  const totalArea  = farmConfig?.totalArea ?? 0;
  const zoneCount  = zones3d.length;
  const avgHealth  = zoneCount ? Math.round(zones3d.reduce((s, z) => s + z.health, 0) / zoneCount) : 0;
  const isDemo     = farmConfig?._isDemo;
  const hasConfig  = farmConfig && !isDemo;

  // ── Loading spinner ────────────────────────────────────────────
  if (loading) return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: '#0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14, fontFamily: "'Inter', sans-serif" }}>
      <div style={{ fontSize: 36, animation: 'spin 1.4s linear infinite' }}>🌾</div>
      <div style={{ fontSize: 14, color: '#64748b' }}>Loading your farm…</div>
      <style>{`@keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }`}</style>
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'linear-gradient(135deg,#0a0f1e 0%,#0f172a 50%,#071224 100%)', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif" }}>

      {/* ═══ Top bar ══════════════════════════════════════════════ */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', background: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0, flexWrap: 'wrap', gap: 10 }}>

        {/* Left: title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg,#16a34a,#15803d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>🌾</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.01em' }}>Farm Digital Twin</div>
            <div style={{ fontSize: 11, color: '#475569' }}>
              {isDemo ? 'Demo Data · Configure your farm below' : hasConfig ? 'Your Farm · Live Configuration' : 'Stage 3 · Dynamic Configuration'}
            </div>
          </div>
        </div>

        {/* Right: stats + actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {hasConfig && <>
            <StatChip label="Total Area" value={`${totalArea} ac`} accent="#a3e635" />
            <StatChip label="Avg Health" value={`${avgHealth}%`} accent={avgHealth > 75 ? '#22c55e' : '#f59e0b'} />
            <StatChip label="Zones" value={zoneCount} accent="#60a5fa" />
          </>}

          <IconBtn onClick={() => setShowModal(true)} title="Configure farm zones and area">
            ⚙️ {hasConfig ? 'Edit Farm' : 'Setup Farm'}
          </IconBtn>

          <IconBtn onClick={onClose} danger title="Close Digital Twin">
            ✕ Close
          </IconBtn>
        </div>
      </div>

      {/* Demo/error notice */}
      {fetchError && (
        <div style={{ background: 'rgba(245,158,11,0.12)', borderBottom: '1px solid rgba(245,158,11,0.2)', padding: '7px 20px', fontSize: 12, color: '#fde68a', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          ⚠️ Could not reach the server. Showing demo farm. Your real farm will load when the server is available.
        </div>
      )}

      {/* ═══ Canvas / Setup area ══════════════════════════════════ */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', margin: '12px 16px' }}>

        {/* No config yet → setup prompt */}
        {!farmConfig && !loading && (
          <SetupScreen onSetup={() => setShowModal(true)} />
        )}

        {/* Has config → 3D scene */}
        {farmConfig && zones3d.length > 0 && (
          <FarmSceneErrorBoundary>
            <Suspense fallback={
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: 28, animation: 'spin 1.4s linear infinite' }}>🌾</div>
                <div style={{ fontSize: 13 }}>Loading 3D Farm Scene…</div>
              </div>
            }>
              <FarmScene
                zones={zones3d}
                totalArea={totalArea}
                viewMode={viewMode}
                selectedZone={selectedZone}
                onZoneClick={(zone) => setSelectedZone(prev => prev?.id === zone.id ? null : zone)}
                controlsRef={controlsRef}
              />
            </Suspense>
          </FarmSceneErrorBoundary>
        )}

        {/* Overlays */}
        {farmConfig && zones3d.length > 0 && (
          <>
            <ZoneInfoPanel zone={selectedZone} onClose={() => setSelectedZone(null)} />
            <ViewModeControls activeMode={viewMode} onChange={setViewMode} onResetCamera={handleResetCamera} />
            {!selectedZone && (
              <div style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '7px 12px', fontSize: 11, color: '#64748b', fontFamily: "'Inter', sans-serif" }}>
                🖱️ Click a zone to inspect · Drag to rotate · Scroll to zoom
              </div>
            )}
          </>
        )}
      </div>

      {/* ═══ Bottom legend ════════════════════════════════════════ */}
      <div style={{ padding: '10px 20px', background: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <ZoneLegend zones={zones3d} />
        <div style={{ fontSize: 10, color: '#334155', fontStyle: 'italic' }}>
          {hasConfig ? `${zoneCount} zone${zoneCount !== 1 ? 's' : ''} · ${totalArea} acres configured` : 'Stage 3 · Dynamic Farm Configuration'}
        </div>
      </div>

      {/* ═══ Farm Config Modal ════════════════════════════════════ */}
      {showModal && (
        <FarmConfigModal
          userEmail={userEmail}
          existingConfig={hasConfig ? farmConfig : null}
          onSave={handleSaved}
          onCancel={() => setShowModal(false)}
        />
      )}

      <style>{`@keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }`}</style>
    </div>
  );
}
