import React, { useState } from 'react';
import {
  FaLeaf, FaChartLine, FaWallet, FaBell, FaCloudSun, FaQuoteLeft,
  FaFacebook, FaTwitter, FaInstagram, FaEnvelope, FaPhone, FaArrowRight,
  FaCheck, FaRobot, FaShoppingBasket, FaStore, FaTractor, FaSeedling,
  FaChartBar, FaShieldAlt, FaMobileAlt, FaGlobe, FaStar, FaUsers,
  FaLock, FaBug
} from 'react-icons/fa';
import { GiWheat, GiFarmTractor, GiPlantRoots } from 'react-icons/gi';

/* ── static data ─────────────────────────────────────── */
const features = [
  { icon: <FaWallet />, color: '#16a34a', bg: '#dcfce7', title: 'Income & Expense Tracking', desc: 'Monitor all farm finances in real-time with categorised records and crop-wise breakdowns.' },
  { icon: <GiWheat />, color: '#d97706', bg: '#fef3c7', title: 'Crop-wise Budgeting', desc: 'Plan and track budgets for each crop individually with smart alerts when you overspend.' },
  { icon: <FaBell />, color: '#2563eb', bg: '#dbeafe', title: 'Smart Budget Alerts', desc: 'Get instant notifications when approaching or exceeding your planned budget limits.' },
  { icon: <FaCloudSun />, color: '#7c3aed', bg: '#ede9fe', title: 'Weather & Market Data', desc: 'Live weather forecasts and real-time commodity market prices at your fingertips.' },
  { icon: <FaRobot />, color: '#0d9488', bg: '#ccfbf1', title: 'AI Advisory (AgriAI)', desc: 'Ask AgriAI about crop health, market timing, financial planning and get expert guidance.' },
  { icon: <FaChartLine />, color: '#dc2626', bg: '#fee2e2', title: 'Deep Analytics', desc: 'Visualise income vs. expenses, profit trends, and crop performance over time.' },
];

const aiFeatures = [
  { q: 'Which crop should I grow this season?', icon: '🌱' },
  { q: 'Why are my farming expenses increasing?', icon: '📊' },
  { q: 'When is the best time to sell my wheat?', icon: '💹' },
  { q: 'What disease is affecting my crop?', icon: '🔬' },
];

const steps = [
  { n: '01', title: 'Create Your Account', desc: 'Register as a farmer or agro-business. It takes under 2 minutes.', icon: <FaUsers /> },
  { n: '02', title: 'Set Up Your Farm', desc: 'Add your crops, set budgets, and configure your financial preferences.', icon: <GiFarmTractor /> },
  { n: '03', title: 'Track & Grow', desc: 'Log income and expenses, get AI insights, and watch your profits grow.', icon: <FaChartLine /> },
];

const testimonials = [
  { quote: 'AgriBudget transformed how I manage my farm finances. The crop-wise budgeting feature alone saved me ₹40,000 last season!', name: 'Ravi Patel', location: 'Gujarat, India', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', role: 'Wheat Farmer' },
  { quote: 'The AI assistant answered questions my local consultant could not. It knew exactly when I should sell my cotton.', name: 'Sunita Sharma', location: 'Punjab, India', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', role: 'Cotton Farmer' },
  { quote: 'As an agro-business owner, the inventory and order management is exactly what I needed to scale my operations.', name: 'Arjun Mehta', location: 'Maharashtra, India', avatar: 'https://randomuser.me/api/portraits/men/65.jpg', role: 'Agro-Business Owner' },
];

const stats = [
  { value: '10,000+', label: 'Active Farmers' },
  { value: '₹2.4Cr+', label: 'Transactions Tracked' },
  { value: '99.9%', label: 'Uptime' },
  { value: '4.8★', label: 'User Rating' },
];

const ecosystem = [
  { icon: <GiFarmTractor style={{ fontSize: 28 }} />, color: '#16a34a', bg: '#dcfce7', title: 'Farmers', points: ['Track income & expenses', 'Crop-wise budgeting', 'AI crop advisor', 'Disease detection', 'Marketplace access'] },
  { icon: <FaStore style={{ fontSize: 28 }} />, color: '#2563eb', bg: '#dbeafe', title: 'Agro-Businesses', points: ['Sell products online', 'Manage inventory', 'Track orders & revenue', 'Reach thousands of farmers', 'Analytics dashboard'] },
];

/* ── mini chart preview component ───────────────────── */
const MiniChart = () => {
  const bars = [40, 65, 55, 80, 70, 90, 75];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 50, padding: '4px 0' }}>
      {bars.map((h, i) => (
        <div key={i} style={{
          flex: 1, height: `${h}%`, borderRadius: '4px 4px 0 0',
          background: i === 5 ? '#16a34a' : '#dcfce7',
          transition: 'height 0.3s ease',
        }} />
      ))}
    </div>
  );
};

/* ── dashboard preview card ──────────────────────────── */
const DashPreview = () => (
  <div style={{
    background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16,
    padding: 24, width: '100%', maxWidth: 400,
    boxShadow: '0 20px 60px rgba(0,0,0,0.10)',
  }}>
    {/* Header */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
      <div style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)', borderRadius: 10, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <GiFarmTractor style={{ color: '#fff', fontSize: 20 }} />
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>Farmer Dashboard</div>
        <div style={{ fontSize: 11, color: '#6b7280' }}>Kharif 2024 · Good Afternoon 🌤️</div>
      </div>
      <div style={{ marginLeft: 'auto', background: '#dcfce7', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600, color: '#15803d' }}>Live</div>
    </div>

    {/* KPI Row */}
    {[
      { label: 'Monthly Income', val: '₹48,000', pct: 72, color: '#16a34a', trend: '+12%' },
      { label: 'Total Expenses', val: '₹32,000', pct: 48, color: '#d97706', trend: '+3%' },
      { label: 'Net Profit', val: '₹16,000', pct: 24, color: '#2563eb', trend: '+19%' },
    ].map((row, i) => (
      <div key={i} style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{row.label}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#111827' }}>{row.val}</span>
            <span style={{ fontSize: 10, color: '#16a34a', fontWeight: 600, background: '#dcfce7', padding: '1px 6px', borderRadius: 9999 }}>↑ {row.trend}</span>
          </div>
        </div>
        <div style={{ height: 5, background: '#f3f4f6', borderRadius: 99 }}>
          <div style={{ height: 5, width: `${row.pct}%`, background: row.color, borderRadius: 99 }} />
        </div>
      </div>
    ))}

    {/* AI tip */}
    <div style={{ marginTop: 18, background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <div style={{ width: 28, height: 28, background: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <FaRobot style={{ color: '#fff', fontSize: 12 }} />
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#15803d', marginBottom: 2 }}>AgriAI Insight</div>
        <div style={{ fontSize: 11, color: '#166534', lineHeight: 1.5 }}>Your wheat expenses are 8% above seasonal average. Consider switching fertilizers next cycle.</div>
      </div>
    </div>

    {/* Mini chart */}
    <div style={{ marginTop: 16, background: '#fafafa', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 14px' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>7-Day Income Trend</div>
      <MiniChart />
    </div>
  </div>
);

/* ── main component ──────────────────────────────────── */
const Home = () => {
  const [hoveredFeature, setHoveredFeature] = useState(null);

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>

      {/* ═══ HERO ═══════════════════════════════════════════ */}
      <section style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '80px 24px 72px' }}>
        <div className="ab-container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 60 }}>
          {/* Left */}
          <div style={{ flex: '1 1 420px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#dcfce7', color: '#15803d', borderRadius: 9999, padding: '5px 14px', fontSize: 12.5, fontWeight: 700, marginBottom: 24, letterSpacing: '0.3px' }}>
              <FaLeaf style={{ fontSize: 10 }} /> 🌱 Agricultural Finance Platform
            </span>
            <h1 style={{ fontSize: 'clamp(32px, 5vw, 54px)', fontWeight: 900, color: '#111827', lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: 20 }}>
              Smart Financial<br />
              <span style={{ color: '#16a34a' }}>Management</span> for<br />
              Modern Farmers
            </h1>
            <p style={{ fontSize: 17, color: '#6b7280', lineHeight: 1.75, marginBottom: 36, maxWidth: 480 }}>
              Track expenses, plan crop budgets, get AI-powered recommendations, and manage your entire agricultural operation — all in one platform.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 36 }}>
              <a href="/login" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#fff',
                padding: '13px 28px', borderRadius: 10, fontWeight: 700, fontSize: 15,
                textDecoration: 'none', boxShadow: '0 4px 16px rgba(22,163,74,0.3)',
                transition: 'opacity 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                aria-label="Get Started"
              >
                Get Started Free <FaArrowRight style={{ fontSize: 13 }} />
              </a>
              <a href="#features" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#fff', color: '#374151', padding: '13px 24px', borderRadius: 10,
                fontWeight: 600, fontSize: 15, textDecoration: 'none',
                border: '1.5px solid #e5e7eb', transition: 'border-color 0.15s, background 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.background = '#f9fafb'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fff'; }}
              >
                Explore Features
              </a>
            </div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {['Works on any device — mobile, tablet, desktop', 'Bank-grade data security & encryption', 'Supports Hindi, Gujarati & English', 'Free for individual farmers'].map((h, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13.5, color: '#6b7280' }}>
                  <span style={{ width: 18, height: 18, background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FaCheck style={{ color: '#16a34a', fontSize: 9, fontWeight: 700 }} />
                  </span>
                  {h}
                </li>
              ))}
            </ul>
          </div>

          {/* Right — dashboard preview */}
          <div style={{ flex: '1 1 360px', display: 'flex', justifyContent: 'center' }}>
            <div className="animate-fade-in-slow">
              <DashPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TRUST STATS ════════════════════════════════════ */}
      <section style={{ background: '#111827', padding: '32px 24px' }}>
        <div className="ab-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 24, textAlign: 'center' }}>
          {stats.map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>{s.value}</div>
              <div style={{ fontSize: 12.5, color: '#9ca3af', fontWeight: 500, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FEATURES ═══════════════════════════════════════ */}
      <section id="features" className="ab-section" style={{ background: 'var(--bg-page)' }}>
        <div className="ab-container">
          <div className="ab-section-header">
            <span className="ab-section-eyebrow"><FaSeedling style={{ fontSize: 11 }} /> Core Features</span>
            <h2 className="ab-section-h2">Everything your farm needs</h2>
            <p className="ab-section-sub">From daily expense tracking to AI-powered crop recommendations — AgriBudget covers every aspect of farm management.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {features.map((f, i) => (
              <div
                key={i}
                className="pro-card"
                style={{
                  padding: '26px 24px', cursor: 'default',
                  transition: 'box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease',
                  transform: hoveredFeature === i ? 'translateY(-3px)' : 'none',
                  boxShadow: hoveredFeature === i ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                  borderColor: hoveredFeature === i ? '#d1d5db' : 'var(--border)',
                }}
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div style={{ width: 46, height: 46, background: f.bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, fontSize: 20, color: f.color }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13.5, color: '#6b7280', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ AI SECTION ═════════════════════════════════════ */}
      <section className="ab-section" style={{ background: '#fff', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>
        <div className="ab-container" style={{ display: 'flex', flexWrap: 'wrap', gap: 60, alignItems: 'center' }}>
          {/* Left — Chat preview */}
          <div style={{ flex: '1 1 360px', minWidth: 0 }}>
            <div style={{ background: '#0f172a', borderRadius: 16, padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
              {/* AI Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #1e293b' }}>
                <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaRobot style={{ color: '#fff', fontSize: 18 }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9' }}>AgriAI Assistant</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Powered by Gemini · Online</div>
                </div>
                <div style={{ marginLeft: 'auto', width: 8, height: 8, background: '#22c55e', borderRadius: '50%' }} />
              </div>
              {/* Chat bubbles */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                <div style={{ background: '#1e293b', borderRadius: '12px 12px 12px 4px', padding: '12px 16px', maxWidth: '85%' }}>
                  <div style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.6 }}>🌱 Namaste! I'm AgriAI. I can help you with crop selection, disease detection, financial planning, and more. What can I help you with?</div>
                </div>
                <div style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)', borderRadius: '12px 12px 4px 12px', padding: '12px 16px', maxWidth: '80%', alignSelf: 'flex-end' }}>
                  <div style={{ fontSize: 13, color: '#fff', lineHeight: 1.6 }}>Which crop should I grow this Rabi season in Gujarat?</div>
                </div>
                <div style={{ background: '#1e293b', borderRadius: '12px 12px 12px 4px', padding: '12px 16px', maxWidth: '85%' }}>
                  <div style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.6 }}>Based on Gujarat's climate and your soil pH data, I recommend <strong style={{ color: '#22c55e' }}>Wheat or Mustard</strong> for Rabi. Expected profit: <strong style={{ color: '#22c55e' }}>₹32,000–₹45,000/hectare</strong>.</div>
                </div>
              </div>
              {/* Suggested questions */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {aiFeatures.map((a, i) => (
                  <div key={i} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 20, padding: '5px 12px', fontSize: 11.5, color: '#94a3b8', cursor: 'pointer' }}>
                    {a.icon} {a.q}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — description */}
          <div style={{ flex: '1 1 380px', minWidth: 0 }}>
            <span className="ab-section-eyebrow" style={{ background: '#ede9fe', color: '#5b21b6' }}>
              <FaRobot style={{ fontSize: 11 }} /> AI-Powered Farming
            </span>
            <h2 className="ab-section-h2" style={{ textAlign: 'left' }}>Your Personal<br />Agricultural AI Expert</h2>
            <p style={{ fontSize: 16, color: '#6b7280', lineHeight: 1.75, marginBottom: 28 }}>
              AgriAI combines domain expertise with cutting-edge AI to give you contextualised, actionable advice for your farm — 24/7, in your language.
            </p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                ['🌱', 'Crop Recommendations', 'Get data-driven crop suggestions based on soil, weather, and season.'],
                ['🔬', 'Disease Detection', 'Upload a photo of your crop and get instant AI disease diagnosis.'],
                ['💰', 'Financial Planning', 'Analyse spending patterns and get personalised cost reduction advice.'],
                ['📈', 'Market Intelligence', 'Know exactly when to sell your produce for maximum profit.'],
              ].map(([emoji, title, desc], i) => (
                <li key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>{emoji}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#111827', marginBottom: 3 }}>{title}</div>
                    <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.55 }}>{desc}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ═══ ANALYTICS STATS ════════════════════════════════ */}
      <section className="ab-section-sm" style={{ background: 'var(--bg-page)' }}>
        <div className="ab-container">
          <div className="ab-section-header" style={{ marginBottom: 36 }}>
            <span className="ab-section-eyebrow"><FaChartBar style={{ fontSize: 11 }} /> Financial Analytics</span>
            <h2 className="ab-section-h2">Real-time numbers,<br />real farming decisions</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {[
              { title: 'Monthly Income', value: '₹48,000', change: '↑ +12%', accent: '#16a34a', bg: '#f0fdf4' },
              { title: 'Total Expenses', value: '₹32,000', change: '↓ −3%', accent: '#d97706', bg: '#fffbeb' },
              { title: 'Budget Utilisation', value: '80%', change: 'On Track', accent: '#2563eb', bg: '#eff6ff' },
              { title: 'Crop Performance', value: '95%', change: '↑ +5%', accent: '#7c3aed', bg: '#faf5ff' },
            ].map((item, i) => (
              <div key={i} style={{
                background: item.bg, border: `1px solid ${item.accent}22`,
                borderLeft: `4px solid ${item.accent}`,
                borderRadius: 10, padding: '20px 18px',
              }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#111827', marginBottom: 4, letterSpacing: '-0.5px' }}>{item.value}</div>
                <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 6 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: item.accent, fontWeight: 700 }}>{item.change}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══════════════════════════════════ */}
      <section className="ab-section" style={{ background: '#fff', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>
        <div className="ab-container">
          <div className="ab-section-header">
            <span className="ab-section-eyebrow">How It Works</span>
            <h2 className="ab-section-h2">Get started in 3 simple steps</h2>
            <p className="ab-section-sub">No technical knowledge required. AgriBudget is designed for farmers, not accountants.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, position: 'relative' }}>
            {steps.map((step, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '28px 24px' }}>
                <div style={{ position: 'relative', display: 'inline-flex', marginBottom: 20 }}>
                  <div style={{ width: 64, height: 64, background: '#dcfce7', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, color: '#16a34a' }}>
                    {step.icon}
                  </div>
                  <span style={{ position: 'absolute', top: -8, right: -8, width: 24, height: 24, background: '#16a34a', borderRadius: '50%', color: '#fff', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 10 }}>{step.title}</h3>
                <p style={{ fontSize: 13.5, color: '#6b7280', lineHeight: 1.65, maxWidth: 240, margin: '0 auto' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ ECOSYSTEM ══════════════════════════════════════ */}
      <section className="ab-section" style={{ background: 'var(--bg-page)' }}>
        <div className="ab-container">
          <div className="ab-section-header">
            <span className="ab-section-eyebrow"><FaGlobe style={{ fontSize: 11 }} /> Who It's For</span>
            <h2 className="ab-section-h2">Built for the entire agri ecosystem</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {ecosystem.map((e, i) => (
              <div key={i} className="pro-card" style={{ padding: '32px 28px' }}>
                <div style={{ width: 60, height: 60, background: e.bg, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: e.color, marginBottom: 20 }}>
                  {e.icon}
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 16 }}>For {e.title}</h3>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {e.points.map((p, j) => (
                    <li key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: '#374151' }}>
                      <div style={{ width: 20, height: 20, background: e.bg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FaCheck style={{ color: e.color, fontSize: 9 }} />
                      </div>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══════════════════════════════════ */}
      <section className="ab-section" style={{ background: '#fff', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>
        <div className="ab-container">
          <div className="ab-section-header">
            <span className="ab-section-eyebrow"><FaStar style={{ fontSize: 11 }} /> Testimonials</span>
            <h2 className="ab-section-h2">Trusted by farmers across India</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 20 }}>
            {testimonials.map((t, i) => (
              <div key={i} className="pro-card" style={{ padding: '28px 24px', transition: 'all 0.2s ease' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'none'; }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 14 }}>
                  {[...Array(5)].map((_, j) => <FaStar key={j} style={{ color: '#f59e0b', fontSize: 13 }} />)}
                </div>
                <FaQuoteLeft style={{ fontSize: 18, color: '#d1d5db', marginBottom: 12 }} />
                <p style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>{t.quote}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid #f3f4f6', paddingTop: 16 }}>
                  <img src={t.avatar} alt={t.name} style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', border: '2px solid #dcfce7' }} />
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#111827' }}>{t.name}</div>
                    <div style={{ fontSize: 11.5, color: '#9ca3af' }}>{t.role} · {t.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ══════════════════════════════════════ */}
      <section style={{ background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)', padding: '72px 24px', position: 'relative', overflow: 'hidden' }}>
        {/* Background decoration */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 280, height: 280, background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />
        <div className="ab-container" style={{ textAlign: 'center', position: 'relative' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: 9999, padding: '5px 14px', fontSize: 12.5, fontWeight: 700, marginBottom: 20 }}>
            <FaLeaf style={{ fontSize: 10 }} /> Start Your Journey
          </span>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 800, color: '#fff', marginBottom: 14, letterSpacing: '-0.5px' }}>
            Ready to transform your farm's financial health?
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.8)', marginBottom: 36, maxWidth: 500, margin: '0 auto 36px' }}>
            Join thousands of farmers already using AgriBudget to make smarter decisions every season.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#fff', color: '#16a34a', padding: '14px 32px',
              borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)'; }}
              aria-label="Start for Free"
            >
              Start for Free <FaArrowRight style={{ fontSize: 13 }} />
            </a>
            <a href="/about" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'transparent', color: '#fff', padding: '14px 28px',
              borderRadius: 10, fontWeight: 600, fontSize: 15, textDecoration: 'none',
              border: '2px solid rgba(255,255,255,0.4)', transition: 'background 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═════════════════════════════════════════ */}
      <footer style={{ background: '#0f172a', color: '#e2e8f0', padding: '60px 24px 32px' }}>
        <div className="ab-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 44, marginBottom: 44 }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)', borderRadius: 9, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaLeaf style={{ color: '#fff', fontSize: 16 }} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 17, color: '#fff', letterSpacing: '-0.3px' }}>AgriBudget</div>
                <div style={{ fontSize: 10.5, color: '#64748b', fontWeight: 500, letterSpacing: '0.4px' }}>Smart Farm Finance</div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.75, maxWidth: 220 }}>
              Intelligent farm finance management for modern farmers and agro-businesses across India.
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              {[FaFacebook, FaTwitter, FaInstagram].map((Icon, i) => (
                <a key={i} href="#" aria-label="Social media" style={{ width: 34, height: 34, background: '#1e293b', border: '1px solid #334155', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', textDecoration: 'none', transition: 'background 0.15s, color 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#334155'; e.currentTarget.style.color = '#e2e8f0'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.color = '#64748b'; }}>
                  <Icon style={{ fontSize: 14 }} />
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 style={{ fontSize: 11.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 16 }}>Product</h4>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[['/', 'Home'], ['/about', 'About'], ['#features', 'Features'], ['/login', 'Login']].map(([href, label]) => (
                <li key={label}>
                  <a href={href} style={{ fontSize: 13, color: '#64748b', textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.target.style.color = '#e2e8f0'}
                    onMouseLeave={e => e.target.style.color = '#64748b'}>{label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 style={{ fontSize: 11.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 16 }}>Support</h4>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Help Center', 'FAQs', 'Privacy Policy', 'Terms of Service'].map(label => (
                <li key={label}>
                  <a href="#" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.target.style.color = '#e2e8f0'}
                    onMouseLeave={e => e.target.style.color = '#64748b'}>{label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontSize: 11.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 16 }}>Contact</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#64748b' }}>
                <FaEnvelope style={{ fontSize: 12, color: '#16a34a' }} /> info@agribudget.com
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#64748b' }}>
                <FaPhone style={{ fontSize: 12, color: '#16a34a' }} /> +91 12345 67890
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#64748b' }}>
                <FaShieldAlt style={{ fontSize: 12, color: '#16a34a' }} /> Bank-grade security
              </div>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #1e293b', paddingTop: 24, display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 12.5, color: '#475569' }}>© {new Date().getFullYear()} AgriBudget. All rights reserved.</div>
          <div style={{ fontSize: 12.5, color: '#475569' }}>Made with ❤️ for Indian farmers</div>
        </div>
      </footer>
    </div>
  );
};

export default Home;