import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CROP_OPTIONS } from './farmConfigUtils';

/* ── shared styles ─────────────────────────────────────────────── */
const ff = "'Inter', sans-serif";

const inputS = {
  width: '100%', boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 8, padding: '8px 12px',
  color: '#f1f5f9', fontSize: 13,
  fontFamily: ff, outline: 'none',
};
const labelS = { fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4, fontFamily: ff, textTransform: 'uppercase', letterSpacing: '0.04em' };
const btnBase = { fontFamily: ff, fontWeight: 600, fontSize: 13, borderRadius: 8, border: 'none', cursor: 'pointer', padding: '8px 16px', transition: 'all 0.18s' };

function makeBlankZone(idx) {
  return { _id: `new-${Date.now()}-${idx}`, name: `Zone ${String.fromCharCode(65 + idx)}`, area: '', crop: 'Wheat', cropVariety: '', growthStage: '' };
}

export default function FarmConfigModal({ onSave, onCancel, existingConfig, userEmail }) {
  const [totalArea, setTotalArea]   = useState(existingConfig?.totalArea?.toString() || '');
  const [zones, setZones]           = useState(
    existingConfig?.zones?.length
      ? existingConfig.zones.map(z => ({ ...z, area: z.area?.toString() || '' }))
      : [makeBlankZone(0)]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  /* ── derived validation ──────────────────────────────────────── */
  const parsedTotal    = parseFloat(totalArea) || 0;
  const allocatedArea  = zones.reduce((s, z) => s + (parseFloat(z.area) || 0), 0);
  const remainingArea  = parsedTotal - allocatedArea;
  const overAllocated  = parsedTotal > 0 && allocatedArea > parsedTotal;
  const underAllocated = parsedTotal > 0 && remainingArea > 0.001;
  const canSave        = !saving && parsedTotal > 0 && zones.length > 0 && !overAllocated
                         && zones.every(z => z.name.trim() && z.crop && parseFloat(z.area) > 0);

  /* ── handlers ────────────────────────────────────────────────── */
  function addZone() {
    setZones(prev => [...prev, makeBlankZone(prev.length)]);
  }

  function removeZone(idx) {
    setZones(prev => prev.filter((_, i) => i !== idx));
  }

  function updateZone(idx, field, value) {
    setZones(prev => prev.map((z, i) => i === idx ? { ...z, [field]: value } : z));
  }

  async function handleSave() {
    setError('');
    if (!parsedTotal || parsedTotal <= 0) { setError('Total farm area must be greater than 0.'); return; }
    if (zones.length === 0) { setError('Add at least one zone.'); return; }
    for (const z of zones) {
      if (!z.name.trim()) { setError('All zones must have a name.'); return; }
      if (!z.crop)        { setError('All zones must have a crop selected.'); return; }
      if (!z.area || parseFloat(z.area) <= 0) { setError(`Zone "${z.name}" area must be greater than 0.`); return; }
    }
    if (overAllocated) { setError(`Allocated area (${allocatedArea.toFixed(2)} ac) exceeds total farm area (${parsedTotal} ac).`); return; }

    setSaving(true);
    try {
      const payload = {
        email: userEmail,
        totalArea: parsedTotal,
        zones: zones.map(z => ({
          name:        z.name.trim(),
          area:        parseFloat(z.area),
          crop:        z.crop,
          cropVariety: z.cropVariety || '',
          growthStage: z.growthStage || '',
        })),
      };
      const res = await axios.post('/api/user/farm-config', payload);
      onSave(res.data.config);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  /* ── render ──────────────────────────────────────────────────── */
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1100,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: ff,
    }}>
      <div style={{
        width: '100%', maxWidth: 780,
        maxHeight: '92vh', overflowY: 'auto',
        background: 'linear-gradient(145deg, #0f1c2e, #0a1628)',
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
        padding: '28px 32px',
      }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9' }}>
              {existingConfig ? '✏️ Edit Farm Configuration' : '🌾 Create Farm Configuration'}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
              Configure your farm layout for the Digital Twin.
            </div>
          </div>
          <button onClick={onCancel} style={{ ...btnBase, background: 'rgba(255,255,255,0.07)', color: '#94a3b8', padding: '6px 12px' }}>✕</button>
        </div>

        {/* Total Area */}
        <div style={{ marginBottom: 24 }}>
          <label style={labelS}>Total Farm Area (acres)</label>
          <input
            type="number" min="0.1" step="0.1"
            value={totalArea}
            onChange={e => setTotalArea(e.target.value)}
            placeholder="e.g. 12.5"
            style={{ ...inputS, maxWidth: 220, fontSize: 15, fontWeight: 600 }}
          />
        </div>

        {/* Summary bar */}
        {parsedTotal > 0 && (
          <div style={{
            display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap',
          }}>
            {[
              { label: 'Total Area', value: `${parsedTotal} ac`, color: '#a3e635' },
              { label: 'Allocated', value: `${allocatedArea.toFixed(2)} ac`, color: overAllocated ? '#ef4444' : '#22c55e' },
              { label: 'Unused', value: `${Math.max(0, remainingArea).toFixed(2)} ac`, color: underAllocated ? '#f59e0b' : '#64748b' },
              { label: 'Zones', value: zones.length, color: '#60a5fa' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10, padding: '8px 14px',
              }}>
                <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color }}>{value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Validation warnings */}
        {overAllocated && (
          <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#fca5a5' }}>
            ⛔ Allocated area exceeds total farm area. Reduce zone areas or increase total area.
          </div>
        )}
        {!overAllocated && underAllocated && parsedTotal > 0 && (
          <div style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#fde68a' }}>
            ⚠️ {remainingArea.toFixed(2)} acres of farm area is unallocated. You can add more zones or leave it as buffer.
          </div>
        )}

        {/* Zone list */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Farm Zones</div>
            <button
              onClick={addZone}
              style={{ ...btnBase, background: 'rgba(22,163,74,0.2)', color: '#4ade80', border: '1px solid rgba(22,163,74,0.4)', padding: '6px 14px', fontSize: 12 }}
            >
              + Add Zone
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {zones.map((zone, idx) => (
              <div key={zone._id || idx} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 12, padding: '16px 18px',
              }}>
                {/* Zone row header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Zone {idx + 1}
                  </span>
                  {zones.length > 1 && (
                    <button
                      onClick={() => removeZone(idx)}
                      style={{ ...btnBase, background: 'rgba(239,68,68,0.12)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.25)', padding: '4px 10px', fontSize: 11 }}
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* Fields row 1: name + area */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={labelS}>Zone Name *</label>
                    <input
                      type="text"
                      value={zone.name}
                      onChange={e => updateZone(idx, 'name', e.target.value)}
                      placeholder="e.g. North Field"
                      style={inputS}
                    />
                  </div>
                  <div>
                    <label style={labelS}>Area (acres) *</label>
                    <input
                      type="number" min="0.01" step="0.1"
                      value={zone.area}
                      onChange={e => updateZone(idx, 'area', e.target.value)}
                      placeholder="e.g. 3.5"
                      style={{
                        ...inputS,
                        borderColor: parseFloat(zone.area) <= 0 && zone.area !== '' ? '#ef4444' : 'rgba(255,255,255,0.15)',
                      }}
                    />
                  </div>
                </div>

                {/* Fields row 2: crop + variety + growth stage */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelS}>Crop *</label>
                    <select
                      value={zone.crop}
                      onChange={e => updateZone(idx, 'crop', e.target.value)}
                      style={{ ...inputS, cursor: 'pointer' }}
                    >
                      {CROP_OPTIONS.map(c => <option key={c} value={c} style={{ background: '#1e2d40' }}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelS}>Variety <span style={{ color: '#475569' }}>(optional)</span></label>
                    <input
                      type="text"
                      value={zone.cropVariety}
                      onChange={e => updateZone(idx, 'cropVariety', e.target.value)}
                      placeholder="e.g. HD-2967"
                      style={inputS}
                    />
                  </div>
                  <div>
                    <label style={labelS}>Growth Stage <span style={{ color: '#475569' }}>(optional)</span></label>
                    <input
                      type="text"
                      value={zone.growthStage}
                      onChange={e => updateZone(idx, 'growthStage', e.target.value)}
                      placeholder="e.g. Flowering"
                      style={inputS}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#fca5a5' }}>
            {error}
          </div>
        )}

        {/* Footer buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button onClick={onCancel} style={{ ...btnBase, background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            style={{
              ...btnBase,
              background: canSave ? 'linear-gradient(135deg, #16a34a, #15803d)' : 'rgba(22,163,74,0.2)',
              color: canSave ? '#fff' : '#4ade80',
              opacity: canSave ? 1 : 0.6,
              cursor: canSave ? 'pointer' : 'not-allowed',
            }}
          >
            {saving ? '⏳ Saving…' : '✅ Save Farm Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
}
