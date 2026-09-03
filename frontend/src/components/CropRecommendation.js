import React, { useState } from 'react';
import axios from 'axios';
import { FaSeedling, FaLeaf, FaThermometerHalf, FaTint, FaCloudRain } from 'react-icons/fa';

const FIELDS = [
  { name: 'N', label: 'Nitrogen (N)', unit: 'kg/ha', icon: '🌿', min: 0, max: 200, placeholder: 'e.g. 90' },
  { name: 'P', label: 'Phosphorus (P)', unit: 'kg/ha', icon: '🟤', min: 0, max: 150, placeholder: 'e.g. 42' },
  { name: 'K', label: 'Potassium (K)', unit: 'kg/ha', icon: '🟡', min: 0, max: 200, placeholder: 'e.g. 43' },
  { name: 'temperature', label: 'Temperature', unit: '°C', icon: '🌡️', min: 0, max: 50, placeholder: 'e.g. 25' },
  { name: 'humidity', label: 'Humidity', unit: '%', icon: '💧', min: 0, max: 100, placeholder: 'e.g. 80' },
  { name: 'ph', label: 'Soil pH', unit: '', icon: '⚗️', min: 0, max: 14, placeholder: 'e.g. 6.5' },
  { name: 'rainfall', label: 'Rainfall', unit: 'mm', icon: '🌧️', min: 0, max: 500, placeholder: 'e.g. 120' },
];

const CONFIDENCE_STYLES = {
  High:   { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' },
  Medium: { background: '#fffbeb', color: '#92400e', border: '1px solid #fde68a' },
  Low:    { background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' },
};

const CropRecommendation = () => {
  const [form, setForm] = useState({ N: '', P: '', K: '', temperature: '', humidity: '', ph: '', rainfall: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await axios.post('/api/user/crop-recommend', form);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get recommendation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    border: '1px solid #d1d5db',
    borderRadius: 7,
    padding: '9px 12px',
    fontSize: 14,
    color: '#111827',
    outline: 'none',
    boxSizing: 'border-box',
    background: '#fff',
  };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 };

  return (
    <div style={{ padding: '24px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <FaSeedling style={{ color: '#16a34a', fontSize: 20 }} />
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Crop Recommendation</h2>
      </div>
      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>
        Enter your soil parameters to get a data-driven crop recommendation for your field.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
        {FIELDS.map(f => (
          <div key={f.name}>
            <label style={labelStyle}>
              {f.icon} {f.label}{f.unit ? ` (${f.unit})` : ''}
            </label>
            <input
              type="number"
              name={f.name}
              value={form[f.name]}
              onChange={handleChange}
              placeholder={f.placeholder}
              min={f.min}
              max={f.max}
              step="any"
              required
              style={inputStyle}
            />
          </div>
        ))}
        <div style={{ gridColumn: '1 / -1' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8,
              padding: '10px 28px', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1, transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#15803d'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#16a34a'; }}
          >
            {loading ? 'Analyzing...' : '🌱 Recommend Crop'}
          </button>
        </div>
      </form>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Primary recommendation */}
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <FaLeaf style={{ color: '#16a34a', fontSize: 18 }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Best Match</span>
              <span style={{
                ...CONFIDENCE_STYLES[result.recommended.confidence],
                borderRadius: 9999, padding: '2px 10px', fontSize: 11, fontWeight: 700, marginLeft: 4,
              }}>
                {result.recommended.confidence} Confidence
              </span>
              <span style={{ marginLeft: 'auto', fontSize: 20, fontWeight: 800, color: '#16a34a' }}>
                {result.recommended.score}%
              </span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 6 }}>
              🌾 {result.recommended.crop}
            </div>
            <div style={{ fontSize: 13, color: '#374151' }}>{result.recommended.description}</div>
          </div>

          {/* Alternatives */}
          {result.alternatives?.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                Also Suitable
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                {result.alternatives.map((alt, i) => (
                  <div key={i} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 16px' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 4 }}>🌿 {alt.crop}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>{alt.description}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#d97706' }}>Match: {alt.score}%</div>
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
