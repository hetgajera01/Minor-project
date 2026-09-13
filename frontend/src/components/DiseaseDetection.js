import React, { useState, useRef } from 'react';
import axios from 'axios';
import { FaBug, FaUpload, FaLeaf, FaSpinner, FaExclamationTriangle, FaCheckCircle, FaHistory } from 'react-icons/fa';
import { GiPlantRoots } from 'react-icons/gi';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const CONFIDENCE_COLOR = (c) => {
  if (c >= 80) return { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d' };
  if (c >= 50) return { bg: '#fffbeb', border: '#fde68a', text: '#92400e' };
  return { bg: '#fef2f2', border: '#fecaca', text: '#b91c1c' };
};

const DiseaseDetection = ({ userEmail }) => {
  const [selectedImage, setSelectedImage]   = useState(null);
  const [previewUrl, setPreviewUrl]         = useState(null);
  const [result, setResult]                 = useState(null);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState('');
  const [history, setHistory]               = useState([]);
  const [showHistory, setShowHistory]       = useState(false);
  const [dragging, setDragging]             = useState(false);
  const fileRef                             = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please upload an image file (JPG, PNG, WEBP).'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('Image must be under 10MB.'); return; }
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    setLoading(true); setError('');
    const formData = new FormData();
    formData.append('image', selectedImage);
    if (userEmail) formData.append('email', userEmail);

    try {
      const res = await axios.post(`${API}/user/disease/detect`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    if (!userEmail) return;
    try {
      const res = await axios.get(`${API}/user/disease/history?email=${userEmail}`);
      setHistory(res.data);
      setShowHistory(true);
    } catch {}
  };

  const col = result ? CONFIDENCE_COLOR(result.confidence || 0) : null;

  return (
    <div style={{ padding: '24px 0', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, background: '#fee2e2', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaBug style={{ color: '#dc2626', fontSize: 17 }} />
          </div>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: '#111827', margin: 0 }}>Crop Disease Detection</h2>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: 0, marginTop: 1 }}>AI-powered diagnosis from leaf images</p>
          </div>
        </div>
        <button onClick={fetchHistory} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '7px 13px', fontSize: 12, color: '#374151', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>
          <FaHistory style={{ fontSize: 11 }} /> History
        </button>
      </div>
      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 18 }}>
        Upload a clear photo of a crop leaf for AI-powered disease analysis.
      </p>

      {/* Disclaimer */}
      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 14px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <FaExclamationTriangle style={{ color: '#d97706', fontSize: 13, marginTop: 2, flexShrink: 0 }} />
        <p style={{ fontSize: 12, color: '#92400e', margin: 0, lineHeight: 1.6 }}>
          <strong>Important:</strong> This is an AI-assisted tool. Always consult your local agricultural extension officer or KVK for critical decisions.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        {/* Upload Area */}
        <div>
          <div
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onClick={() => fileRef.current?.click()}
            className={`pro-upload-zone${dragging ? ' dragging' : ''}`}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Leaf preview" style={{ maxWidth: '100%', maxHeight: 220, borderRadius: 10, objectFit: 'contain' }} />
            ) : (
              <>
                <div style={{ width: 64, height: 64, background: '#fee2e2', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <GiPlantRoots style={{ fontSize: 32, color: '#dc2626' }} />
                </div>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                  Drag &amp; drop a leaf photo here
                </div>
                <div style={{ fontSize: 12.5, color: '#9ca3af' }}>or click to browse</div>
                <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center', gap: 6 }}>
                  {['JPG', 'PNG', 'WEBP'].map(ext => (
                    <span key={ext} style={{ background: '#f3f4f6', color: '#6b7280', borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>{ext}</span>
                  ))}
                  <span style={{ background: '#f3f4f6', color: '#6b7280', borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>max 10MB</span>
                </div>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />

          <button
            onClick={handleAnalyze}
            disabled={!selectedImage || loading}
            style={{
              width: '100%', background: !selectedImage || loading ? '#9ca3af' : '#dc2626',
              color: '#fff', border: 'none', borderRadius: 10, padding: '12px', fontSize: 14,
              fontWeight: 700, cursor: !selectedImage || loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'background 0.15s', marginTop: 14, fontFamily: 'inherit',
              boxShadow: selectedImage && !loading ? '0 3px 10px rgba(220,38,38,0.25)' : 'none',
            }}
          >
            {loading
              ? <><FaSpinner className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} /> Analyzing…</>
              : <><FaBug /> Detect Disease</>}
          </button>

          {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginTop: 12, fontWeight: 600 }}>⚠️ {error}</div>}

          {/* Tips */}
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '14px 16px', marginTop: 14 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#2563eb', marginBottom: 8 }}>📸 Tips for best results</div>
            {['Upload a clear, well-lit photo of the affected leaf', 'Ensure the leaf fills most of the frame', 'Avoid blurry or dark images', 'Take photos in natural daylight'].map((tip, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#1d4ed8', marginBottom: 5 }}>
                <FaCheckCircle style={{ fontSize: 11, flexShrink: 0 }} /> {tip}
              </div>
            ))}
          </div>
        </div>

        {/* Result Panel */}
        <div>
          {!result && !loading && (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', textAlign: 'center', minHeight: 300, background: '#f9fafb', borderRadius: 14, border: '1px solid #e5e7eb', padding: 32 }}>
              <FaLeaf style={{ fontSize: 48, marginBottom: 12 }} />
              <div style={{ fontSize: 14, fontWeight: 600 }}>Upload a leaf image to start analysis</div>
              <div style={{ fontSize: 12, marginTop: 6 }}>Results will appear here</div>
            </div>
          )}

          {loading && (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, background: '#f9fafb', borderRadius: 14, border: '1px solid #e5e7eb' }}>
              <FaSpinner style={{ fontSize: 40, color: '#16a34a', animation: 'spin 1s linear infinite', marginBottom: 16 }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Analyzing leaf image...</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>AI model is processing</div>
            </div>
          )}

          {result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Main Result */}
              <div style={{ background: col.bg, border: `1px solid ${col.border}`, borderRadius: 12, padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {result.isHealthy ? '✅ Detection Result' : '🔴 Disease Detected'}
                  </span>
                  {result.confidence > 0 && (
                    <span style={{ background: col.bg, border: `1px solid ${col.border}`, color: col.text, borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 700 }}>
                      {result.confidence}% confidence
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>Crop</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 4 }}>{result.detectedCrop || 'Unknown'}</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>Condition</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: col.text }}>{result.disease}</div>

                {result.confidence === 0 && (
                  <div style={{ fontSize: 12, color: '#92400e', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '8px 12px', marginTop: 10 }}>
                    ⚠️ ML model not loaded — result is a placeholder
                  </div>
                )}
              </div>

              {/* Sections */}
              {[
                { title: '🔍 Symptoms',   items: result.symptoms,   bg: '#fef2f2', border: '#fecaca' },
                { title: '⚠️ Causes',     items: result.causes,     bg: '#fffbeb', border: '#fde68a' },
                { title: '🛡️ Prevention', items: result.prevention, bg: '#eff6ff', border: '#bfdbfe' },
                { title: '💊 Treatment',  items: result.treatment,  bg: '#f0fdf4', border: '#bbf7d0' },
                { title: '➡️ Next Steps', items: result.nextSteps,  bg: '#f5f3ff', border: '#ddd6fe' },
              ].filter(s => s.items?.length > 0).map((section, i) => (
                <div key={i} style={{ background: section.bg, border: `1px solid ${section.border}`, borderRadius: 10, padding: '12px 16px' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 8 }}>{section.title}</div>
                  {section.items.map((item, j) => (
                    <div key={j} style={{ fontSize: 13, color: '#374151', marginBottom: 4, paddingLeft: 12, borderLeft: '2px solid #d1d5db' }}>
                      {item}
                    </div>
                  ))}
                </div>
              ))}

              {/* Disclaimer */}
              <div style={{ fontSize: 11, color: '#6b7280', background: '#f3f4f6', borderRadius: 8, padding: '8px 12px', lineHeight: 1.6 }}>
                {result.disclaimer || '⚠️ AI prediction — consult an agricultural expert before taking action.'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* History Modal */}
      {showHistory && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, width: '90%', maxWidth: 600, maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Detection History</h3>
              <button onClick={() => setShowHistory(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6b7280' }}>✕</button>
            </div>
            {history.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#9ca3af', padding: 32 }}>No detection history yet</div>
            ) : history.map((h, i) => (
              <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <strong style={{ fontSize: 14 }}>{h.disease}</strong>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>{new Date(h.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
                <div style={{ fontSize: 13, color: '#374151' }}>{h.detectedCrop} · {h.confidence}% confidence</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default DiseaseDetection;
