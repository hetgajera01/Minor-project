import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaChartLine, FaRupeeSign, FaLeaf, FaSpinner, FaTractor, FaExclamationTriangle } from 'react-icons/fa';
import { GiWheat, GiFarmTractor } from 'react-icons/gi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const CROPS = ['Rice', 'Wheat', 'Cotton', 'Maize', 'Sugarcane', 'Soybean', 'Groundnut', 'Tomato', 'Onion', 'Potato', 'Chickpea', 'Mustard'];
const SEASONS = ['Kharif', 'Rabi', 'Zaid'];

const fmt   = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const fmtN  = (n, d = 2) => Number(n || 0).toFixed(d);

const RISK_COLOR = { Low: '#16a34a', Medium: '#d97706', High: '#dc2626' };
const RISK_BG    = { Low: '#f0fdf4', Medium: '#fffbeb', High: '#fef2f2' };
const RISK_BORDER= { Low: '#bbf7d0', Medium: '#fde68a', High: '#fecaca' };

const CropYieldPrediction = ({ userEmail }) => {
  const [form, setForm] = useState({
    crop: '', landArea: '', season: '', location: '',
    fertilizer: '', labor: '', irrigation: '', other: '',
  });
  const [result, setResult]         = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [pastPredictions, setPastPredictions] = useState([]);
  const [showActual, setShowActual] = useState(null); // predictionId for entering actual data
  const [actualForm, setActualForm] = useState({ yieldTons: '', revenueActual: '', expenseActual: '' });

  useEffect(() => {
    if (userEmail) fetchPredictions();
  }, [userEmail]);

  const fetchPredictions = async () => {
    try {
      const res = await axios.get(`${API}/user/crop/predictions?email=${userEmail}`);
      setPastPredictions(res.data.filter(p => p.result?.yieldEst));
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await axios.post(`${API}/user/crop/yield-predict`, {
        email: userEmail, crop: form.crop,
        landArea: Number(form.landArea),
        season: form.season, location: form.location,
        additionalCosts: {
          fertilizer: Number(form.fertilizer) || 0,
          labor:      Number(form.labor)      || 0,
          irrigation: Number(form.irrigation) || 0,
          other:      Number(form.other)      || 0,
        },
      });
      setResult(res.data);
      fetchPredictions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordActual = async (predId) => {
    try {
      await axios.patch(`${API}/user/crop/predictions/${predId}/actual`, {
        email: userEmail, ...actualForm,
      });
      setShowActual(null);
      setActualForm({ yieldTons: '', revenueActual: '', expenseActual: '' });
      fetchPredictions();
    } catch (err) {
      alert('Failed to save actual data');
    }
  };

  const inputStyle = {
    width: '100%', border: '1px solid #d1d5db', borderRadius: 7,
    padding: '9px 12px', fontSize: 14, color: '#111827', outline: 'none',
    boxSizing: 'border-box', background: '#fff',
  };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 };

  // Chart data for predicted vs actual
  const chartData = pastPredictions
    .filter(p => p.actual?.profitActual)
    .slice(0, 5)
    .map(p => ({
      crop: p.cropName,
      'Predicted Profit': Math.round(p.result?.profitEst || 0),
      'Actual Profit':    Math.round(p.actual?.profitActual || 0),
    }));

  return (
    <div style={{ padding: '24px 0', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <FaChartLine style={{ color: '#2563eb', fontSize: 20 }} />
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Yield & Profit Prediction</h2>
      </div>
      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
        Predict your crop yield, costs, revenue, and profit — and compare with actual harvest results.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px', marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 14 }}>Crop Information</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>🌾 Crop *</label>
                <select name="crop" value={form.crop} onChange={e => setForm({...form, crop: e.target.value})} required style={inputStyle}>
                  <option value="">Select crop</option>
                  {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>📐 Land Area (ha) *</label>
                <input type="number" value={form.landArea} onChange={e => setForm({...form, landArea: e.target.value})} placeholder="e.g. 2" min="0.1" step="0.1" required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>🗓️ Season</label>
                <select value={form.season} onChange={e => setForm({...form, season: e.target.value})} style={inputStyle}>
                  <option value="">Select season</option>
                  {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>📍 Location</label>
                <input type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="e.g. Gujarat" style={inputStyle} />
              </div>
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px', marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 14 }}>Additional Cost Breakdown</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { key: 'fertilizer', label: '🧪 Fertilizer (₹)', placeholder: 'e.g. 8000' },
                { key: 'labor',      label: '👷 Labor (₹)',       placeholder: 'e.g. 12000' },
                { key: 'irrigation', label: '💧 Irrigation (₹)',  placeholder: 'e.g. 5000' },
                { key: 'other',      label: '📦 Other (₹)',       placeholder: 'e.g. 2000' },
              ].map(f => (
                <div key={f.key}>
                  <label style={labelStyle}>{f.label}</label>
                  <input type="number" value={form[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})} placeholder={f.placeholder} min="0" style={inputStyle} />
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading || !form.crop || !form.landArea} style={{
            background: loading ? '#9ca3af' : '#2563eb', color: '#fff', border: 'none',
            borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 700,
            cursor: loading || !form.crop ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            {loading ? <><FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> Calculating...</> : <><FaChartLine /> Generate Prediction</>}
          </button>
          {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginTop: 12 }}>{error}</div>}
        </form>

        {/* Results */}
        <div>
          {!result && (
            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: 32, textAlign: 'center', color: '#9ca3af', minHeight: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <GiWheat style={{ fontSize: 48, marginBottom: 12 }} />
              <div style={{ fontSize: 14, fontWeight: 600 }}>Fill in crop details to generate prediction</div>
              <div style={{ fontSize: 12, marginTop: 6 }}>Integrated with your existing expense data</div>
            </div>
          )}

          {result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Risk Badge */}
              <div style={{ background: RISK_BG[result.riskLevel], border: `1px solid ${RISK_BORDER[result.riskLevel]}`, borderRadius: 10, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <FaExclamationTriangle style={{ color: RISK_COLOR[result.riskLevel] }} />
                <div>
                  <span style={{ fontWeight: 700, color: RISK_COLOR[result.riskLevel] }}>{result.riskLevel} Risk</span>
                  <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 8 }}>{result.riskReason}</span>
                </div>
              </div>

              {/* Main Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Predicted Yield',   value: `${fmtN(result.predictedYield)} tons`, icon: <GiWheat style={{ color: '#d97706', fontSize: 20 }} /> },
                  { label: 'Profit Margin',      value: `${result.profitMargin}%`,             icon: <FaChartLine style={{ color: '#2563eb', fontSize: 18 }} /> },
                  { label: 'Total Predicted Cost',    value: fmt(result.predictedCost),         icon: <FaRupeeSign style={{ color: '#dc2626', fontSize: 18 }} /> },
                  { label: 'Predicted Revenue', value: fmt(result.predictedRevenue),           icon: <FaRupeeSign style={{ color: '#7c3aed', fontSize: 18 }} /> },
                ].map((s, i) => (
                  <div key={i} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px' }}>
                    <div style={{ marginBottom: 6 }}>{s.icon}</div>
                    <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>{s.label}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#111827' }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Profit Highlight */}
              <div style={{ background: result.predictedProfit > 0 ? '#f0fdf4' : '#fef2f2', border: `1px solid ${result.predictedProfit > 0 ? '#bbf7d0' : '#fecaca'}`, borderRadius: 12, padding: '16px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, marginBottom: 4 }}>PREDICTED PROFIT</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: result.predictedProfit > 0 ? '#16a34a' : '#dc2626' }}>
                  {result.predictedProfit >= 0 ? '' : '-'}{fmt(Math.abs(result.predictedProfit))}
                </div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 6 }}>
                  Market price used: ₹{result.marketPriceUsed}/quintal · {result.source}
                </div>
              </div>

              {/* Cost Breakdown */}
              {result.breakdown && (
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 10 }}>Cost Breakdown</div>
                  {Object.entries(result.breakdown).map(([k, v]) => v > 0 && (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#374151', marginBottom: 4, paddingBottom: 4, borderBottom: '1px solid #f3f4f6' }}>
                      <span style={{ textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1')}</span>
                      <span style={{ fontWeight: 600 }}>{fmt(v)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ fontSize: 11, color: '#6b7280', fontStyle: 'italic' }}>⚠️ {result.disclaimer}</div>
            </div>
          )}
        </div>
      </div>

      {/* Predicted vs Actual Chart */}
      {chartData.length > 0 && (
        <div style={{ marginTop: 32, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 16 }}>📊 Predicted vs Actual Profit</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="crop" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => fmt(v)} />
              <Legend />
              <Bar dataKey="Predicted Profit" fill="#2563eb" radius={[4,4,0,0]} />
              <Bar dataKey="Actual Profit"    fill="#16a34a" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Past Predictions */}
      {pastPredictions.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 12 }}>📋 Past Predictions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pastPredictions.slice(0, 5).map((pred, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{pred.cropName}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                      Predicted Profit: <strong>{fmt(pred.result?.profitEst)}</strong>
                      {pred.actual?.profitActual && (
                        <> · Actual: <strong style={{ color: pred.actual.profitActual >= pred.result?.profitEst ? '#16a34a' : '#dc2626' }}>
                          {fmt(pred.actual.profitActual)}
                        </strong>
                        · Diff: <strong>{pred.actual.profitActual - pred.result?.profitEst >= 0 ? '+' : ''}{fmt(pred.actual.profitActual - (pred.result?.profitEst || 0))}</strong></>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>{new Date(pred.createdAt).toLocaleDateString('en-IN')}</span>
                    {pred.status !== 'harvested' && (
                      <button onClick={() => setShowActual(pred._id)} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 6, padding: '4px 10px', fontSize: 11, color: '#2563eb', cursor: 'pointer', fontWeight: 600 }}>
                        Record Actual
                      </button>
                    )}
                    {pred.status === 'harvested' && (
                      <span style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '4px 10px', fontSize: 11, color: '#16a34a', fontWeight: 600 }}>
                        ✅ Harvested
                      </span>
                    )}
                  </div>
                </div>

                {/* Record Actual Form */}
                {showActual === pred._id && (
                  <div style={{ marginTop: 12, padding: '14px', background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>Record Actual Harvest Data</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
                      {[
                        { key: 'yieldTons',      label: 'Actual Yield (tons)',  placeholder: 'e.g. 3.2' },
                        { key: 'revenueActual',  label: 'Actual Revenue (₹)',   placeholder: 'e.g. 72000' },
                        { key: 'expenseActual',  label: 'Actual Expenses (₹)',  placeholder: 'e.g. 38000' },
                      ].map(f => (
                        <div key={f.key}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 3 }}>{f.label}</div>
                          <input type="number" value={actualForm[f.key]} onChange={e => setActualForm({...actualForm, [f.key]: e.target.value})} placeholder={f.placeholder} style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 6, padding: '6px 10px', fontSize: 13, boxSizing: 'border-box' }} />
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => handleRecordActual(pred._id)} style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                        Save Actual Data
                      </button>
                      <button onClick={() => setShowActual(null)} style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 6, padding: '7px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default CropYieldPrediction;
