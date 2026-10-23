import React, { useState } from 'react';
import axios from 'axios';
import { FaSeedling, FaLeaf, FaRupeeSign, FaWarehouse, FaChartLine, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import { GiWheat } from 'react-icons/gi';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const FIELDS = [
  { name: 'N',           label: 'Nitrogen (N)',    unit: 'kg/ha', icon: '🌿', min: 0,   max: 300, placeholder: 'e.g. 90'  },
  { name: 'P',           label: 'Phosphorus (P)',  unit: 'kg/ha', icon: '🟤', min: 0,   max: 150, placeholder: 'e.g. 42'  },
  { name: 'K',           label: 'Potassium (K)',   unit: 'kg/ha', icon: '🟡', min: 0,   max: 210, placeholder: 'e.g. 43'  },
  { name: 'temperature', label: 'Temperature',     unit: '°C',    icon: '🌡️', min: 5,   max: 50,  placeholder: 'e.g. 25'  },
  { name: 'humidity',    label: 'Humidity',        unit: '%',     icon: '💧', min: 5,   max: 100, placeholder: 'e.g. 80'  },
  { name: 'ph',          label: 'Soil pH',         unit: '',      icon: '⚗️', min: 3.0, max: 10,  placeholder: 'e.g. 6.5' },
  { name: 'rainfall',    label: 'Rainfall',        unit: 'mm',    icon: '🌧️', min: 10,  max: 400, placeholder: 'e.g. 120' },
];

const SEASONS = ['Kharif', 'Rabi', 'Zaid'];
const STATES  = [
  'Gujarat', 'Maharashtra', 'Punjab', 'Haryana', 'Uttar Pradesh',
  'Madhya Pradesh', 'Rajasthan', 'Andhra Pradesh', 'Karnataka',
  'Tamil Nadu', 'Bihar', 'West Bengal', 'Other',
];

const SUITABILITY_STYLES = {
  High:   { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' },
  Medium: { background: '#fffbeb', color: '#92400e', border: '1px solid #fde68a' },
  Low:    { background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' },
};

const fmt    = (n) => n != null ? `₹${Number(n).toLocaleString('en-IN')}` : '—';
const fmtNum = (n, d = 2) => n != null ? Number(n).toFixed(d) : '—';

const CropRecommendation = ({ userEmail }) => {
  const [form, setForm] = useState({
    N: '', P: '', K: '', temperature: '', humidity: '', ph: '', rainfall: '',
    location: '', season: '', landArea: '1',
  });
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [saved, setSaved]     = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setResult(null); setSaved(false);
    try {
      const res = await axios.post(`${API}/user/crop-recommend`, { ...form, email: userEmail });
      const data = res.data;

      // Handle validation errors returned from server
      if (data.status === 'validation_error') {
        setError((data.errors || [data.message]).join(' • '));
        return;
      }
      setResult(data);
      if (data.predictionId) setSaved(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get recommendation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', border: '1px solid #d1d5db', borderRadius: 7,
    padding: '9px 12px', fontSize: 14, color: '#111827', outline: 'none',
    boxSizing: 'border-box', background: '#fff',
  };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 };

  // Determine label for the score badge
  const suitabilityKey = result?.recommended?.suitability || result?.recommended?.confidence || 'Low';

  return (
    <div style={{ padding: '24px 0', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <div style={{ width: 38, height: 38, background: '#dcfce7', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FaSeedling style={{ color: '#16a34a', fontSize: 17 }} />
        </div>
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 800, color: '#111827', margin: 0 }}>Crop Recommendation</h2>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: 0, marginTop: 1 }}>Soil &amp; climate suitability analysis — 22 crops</p>
        </div>
      </div>

      {/* What this does / doesn't do */}
      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 9, padding: '10px 14px', fontSize: 12, color: '#1e40af', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <FaInfoCircle style={{ marginTop: 1, flexShrink: 0 }} />
        <span>
          The model uses your <strong>soil parameters and climate data</strong> (N, P, K, pH, temperature, humidity, rainfall) to score crop suitability.
          State and season are recorded for your records but are <strong>not model inputs</strong>.
          Financial figures are <strong>reference estimates</strong> based on national average yields and MSP/Agmarknet prices (2023-24), not predictions.
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Soil & Weather Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 14 }}>
          {FIELDS.map(f => (
            <div key={f.name}>
              <label style={labelStyle}>{f.icon} {f.label}{f.unit ? ` (${f.unit})` : ''}</label>
              <input
                type="number" name={f.name} value={form[f.name]}
                onChange={handleChange} placeholder={f.placeholder}
                min={f.min} max={f.max} step="any" required style={inputStyle}
              />
            </div>
          ))}

          {/* State */}
          <div>
            <label style={labelStyle}>📍 State <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional)</span></label>
            <select name="location" value={form.location} onChange={handleChange} style={{ ...inputStyle }}>
              <option value="">Select state</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {/* Season */}
          <div>
            <label style={labelStyle}>🗓️ Season <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional)</span></label>
            <select name="season" value={form.season} onChange={handleChange} style={{ ...inputStyle }}>
              <option value="">Select season</option>
              {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {/* Land area */}
          <div>
            <label style={labelStyle}>🌾 Land Area (hectares)</label>
            <input
              type="number" name="landArea" value={form.landArea}
              onChange={handleChange} placeholder="e.g. 2" min="0.1" step="0.1"
              required style={inputStyle}
            />
          </div>
        </div>

        <button
          type="submit" disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: loading ? '#9ca3af' : '#16a34a', color: '#fff', border: 'none', borderRadius: 9,
            padding: '12px 28px', fontSize: 14, fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.15s',
            boxShadow: loading ? 'none' : '0 3px 12px rgba(22,163,74,0.3)', fontFamily: 'inherit',
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#15803d'; }}
          onMouseLeave={e => { e.currentTarget.style.background = loading ? '#9ca3af' : '#16a34a'; }}
        >
          {loading ? '⏳ Analyzing…' : <><FaSeedling style={{ fontSize: 13 }} /> Get Recommendation</>}
        </button>
      </form>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 9, padding: '10px 14px', fontSize: 13, marginTop: 16, fontWeight: 600 }}>
          ⚠️ {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>

          {saved && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '8px 14px', fontSize: 13, color: '#15803d', fontWeight: 600 }}>
              ✅ Prediction saved to your farm records
            </div>
          )}

          {/* Source badge */}
          <div style={{ fontSize: 11, color: '#6b7280' }}>
            Source: <strong>{result.source || 'ML model'}</strong>
            {result.modelVersion && ` · v${result.modelVersion}`}
            {result.testAccuracy && ` · Test accuracy: ${result.testAccuracy}`}
          </div>

          {/* Warnings */}
          {result.warning && (
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 9, padding: '10px 14px', fontSize: 13, color: '#92400e', display: 'flex', gap: 8 }}>
              <FaExclamationTriangle style={{ marginTop: 1, flexShrink: 0 }} />
              <span>{result.warning}</span>
            </div>
          )}

          {/* Location/season note */}
          {result.locationNote && (
            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 9, padding: '9px 14px', fontSize: 12, color: '#0369a1' }}>
              ℹ️ {result.locationNote}
            </div>
          )}

          {/* Score meaning */}
          {result.scoreMeaning && (
            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 9, padding: '9px 14px', fontSize: 12, color: '#374151' }}>
              📊 <strong>Score:</strong> {result.scoreMeaning}
            </div>
          )}

          {/* Primary Recommendation */}
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 14, padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <FaLeaf style={{ color: '#16a34a', fontSize: 18 }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Best Match</span>
              <span style={{
                ...SUITABILITY_STYLES[suitabilityKey],
                borderRadius: 9999, padding: '2px 10px', fontSize: 11, fontWeight: 700, marginLeft: 4,
              }}>
                {suitabilityKey} Suitability
              </span>
              <span style={{ marginLeft: 'auto', fontSize: 22, fontWeight: 800, color: '#16a34a' }}>
                {result.recommended.score}%
              </span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#111827', marginBottom: 6 }}>
              🌾 {result.recommended.crop}
            </div>
            <div style={{ fontSize: 13, color: '#374151', marginBottom: 16 }}>{result.recommended.description}</div>

            {/* Financial Estimates */}
            {result.recommended.yieldTons != null && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
                  {[
                    { icon: <GiWheat style={{ color: '#d97706' }} />,  label: 'Est. Yield',    value: `${fmtNum(result.recommended.yieldTons)} t` },
                    { icon: <FaRupeeSign style={{ color: '#dc2626' }}/>, label: 'Est. Cost',   value: fmt(result.recommended.costEst) },
                    { icon: <FaChartLine style={{ color: '#2563eb' }}/>, label: 'Est. Revenue', value: fmt(result.recommended.revenueEst) },
                    { icon: <FaRupeeSign style={{ color: '#16a34a' }}/>, label: 'Est. Profit',  value: fmt(result.recommended.profitEst) },
                  ].map((stat, i) => (
                    <div key={i} style={{ background: '#fff', border: '1px solid #d1fae5', borderRadius: 10, padding: '12px 14px' }}>
                      <div style={{ fontSize: 18, marginBottom: 4 }}>{stat.icon}</div>
                      <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, marginBottom: 2 }}>{stat.label}</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#111827' }}>{stat.value}</div>
                    </div>
                  ))}
                </div>

                {/* Price basis */}
                {result.recommended.pricePerQuintal && (
                  <div style={{ marginTop: 10, fontSize: 11, color: '#6b7280', background: '#f9fafb', borderRadius: 8, padding: '8px 12px' }}>
                    💰 <strong>Price basis:</strong> ₹{result.recommended.pricePerQuintal}/quintal
                    {result.recommended.priceSource && ` (${result.recommended.priceSource})`}
                    {' · '}Revenue = yield × 10 quintals/tonne × price
                  </div>
                )}
              </>
            )}

            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 12, fontStyle: 'italic' }}>
              ⚠️ {result.disclaimer}
            </div>
          </div>

          {/* Alternative Crops */}
          {result.alternatives?.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
                Also Suitable
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
                {result.alternatives.map((alt, i) => (
                  <div key={i} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 16px' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 4 }}>🌿 {alt.crop}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>{alt.description}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#d97706' }}>Suitability: {alt.score}%</div>
                    {alt.profitEst != null && (
                      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>
                        Est. profit: {fmt(alt.profitEst)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CropRecommendation;
