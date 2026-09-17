import React, { useState, useEffect, useRef } from 'react';
import {
  FaLeaf, FaChartLine, FaWallet, FaBell, FaCloudSun, FaQuoteLeft,
  FaFacebook, FaTwitter, FaInstagram, FaEnvelope, FaPhone, FaArrowRight,
  FaCheck, FaRobot, FaStore, FaSeedling,
  FaChartBar, FaShieldAlt, FaGlobe, FaStar, FaUsers,
  FaBug, FaPlay, FaArrowUp,
} from 'react-icons/fa';
import { GiWheat, GiFarmTractor, GiPlantRoots } from 'react-icons/gi';

/* ── Static data ────────────────────────────────────────── */
const features = [
  { icon: <FaWallet />, color: '#16a34a', bg: 'linear-gradient(135deg,#dcfce7,#bbf7d0)', title: 'Income & Expense Tracking', desc: 'Monitor all farm finances in real-time with categorised records and crop-wise breakdowns.' },
  { icon: <GiWheat />, color: '#d97706', bg: 'linear-gradient(135deg,#fef3c7,#fde68a)', title: 'Crop-wise Budgeting', desc: 'Plan and track budgets for each crop individually with smart alerts when you overspend.' },
  { icon: <FaBell />, color: '#2563eb', bg: 'linear-gradient(135deg,#dbeafe,#bfdbfe)', title: 'Smart Budget Alerts', desc: 'Get instant notifications when approaching or exceeding your planned budget limits.' },
  { icon: <FaCloudSun />, color: '#7c3aed', bg: 'linear-gradient(135deg,#ede9fe,#ddd6fe)', title: 'Weather & Market Data', desc: 'Live weather forecasts and real-time commodity market prices at your fingertips.' },
  { icon: <FaRobot />, color: '#0d9488', bg: 'linear-gradient(135deg,#ccfbf1,#99f6e4)', title: 'AI Advisory (AgriAI)', desc: 'Ask AgriAI about crop health, market timing, financial planning and get expert guidance.' },
  { icon: <FaBug />, color: '#dc2626', bg: 'linear-gradient(135deg,#fee2e2,#fecaca)', title: 'Disease Detection', desc: 'Upload a leaf photo and get instant AI-powered crop disease diagnosis and treatment advice.' },
];

const testimonials = [
  { quote: 'AgriBudget transformed how I manage my farm finances. The crop-wise budgeting feature alone saved me ₹40,000 last season!', name: 'Ravi Patel', location: 'Gujarat', avatar: 'RP', role: 'Wheat Farmer', color: '#16a34a' },
  { quote: 'The AI assistant answered questions my local consultant could not. It knew exactly when I should sell my cotton for maximum profit.', name: 'Sunita Sharma', location: 'Punjab', avatar: 'SS', role: 'Cotton Farmer', color: '#7c3aed' },
  { quote: 'As an agro-business owner, the inventory and order management is exactly what I needed to scale my operations significantly.', name: 'Arjun Mehta', location: 'Maharashtra', avatar: 'AM', role: 'Agro-Business Owner', color: '#2563eb' },
];

const stats = [
  { value: '10,000+', label: 'Active Farmers', icon: <GiFarmTractor /> },
  { value: '₹2.4Cr+', label: 'Transactions Tracked', icon: <FaWallet /> },
  { value: '99.9%', label: 'Uptime', icon: <FaShieldAlt /> },
  { value: '4.8★', label: 'User Rating', icon: <FaStar /> },
];

const steps = [
  { n: '01', title: 'Create Your Account', desc: 'Register as a farmer or agro-business. It takes under 2 minutes.', icon: <FaUsers />, color: '#16a34a' },
  { n: '02', title: 'Set Up Your Farm', desc: 'Add your crops, set budgets, and configure your financial preferences.', icon: <GiFarmTractor />, color: '#d97706' },
  { n: '03', title: 'Track & Grow', desc: 'Log income, get AI insights, and watch your farm profits grow season by season.', icon: <FaChartLine />, color: '#7c3aed' },
];

const aiFeatures = [
  { q: 'Which crop this season?', icon: '🌱' },
  { q: 'Why are expenses rising?', icon: '📊' },
  { q: 'Best time to sell wheat?', icon: '💹' },
  { q: 'What disease is this?', icon: '🔬' },
];

/* ── Animated counter hook ─────────────────────────────── */
function useCountUp(target, duration = 1800, trigger) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start = 0;
    const num = parseFloat(target.replace(/[^0-9.]/g, ''));
    if (!num) return;
    const step = num / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= num) { setCount(num); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [trigger]);
  return count;
}

/* ── Mini Bar Chart ─────────────────────────────────────── */
const MiniChart = () => {
  const bars = [40, 62, 55, 78, 68, 92, 75];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 52, padding: '4px 0' }}>
      {bars.map((h, i) => (
        <div key={i} style={{
          flex: 1, height: `${h}%`, borderRadius: '4px 4px 0 0',
          background: i === 5
            ? 'linear-gradient(180deg,#16a34a,#15803d)'
            : 'linear-gradient(180deg,#bbf7d0,#dcfce7)',
          transition: 'height 0.3s ease',
          boxShadow: i === 5 ? '0 2px 8px rgba(22,163,74,0.35)' : 'none',
        }} />
      ))}
    </div>
  );
};

/* ── Floating Dashboard Preview ─────────────────────────── */
const DashPreview = () => (
  <div style={{
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    boxShadow: '0 32px 80px rgba(0,0,0,0.13), 0 4px 16px rgba(0,0,0,0.06)',
    position: 'relative',
  }}>
    {/* Floating badge */}
    <div style={{
      position: 'absolute', top: -14, right: 20,
      background: 'linear-gradient(135deg,#16a34a,#15803d)',
      color: '#fff', fontSize: 11, fontWeight: 700,
      padding: '5px 14px', borderRadius: 20,
      boxShadow: '0 4px 12px rgba(22,163,74,0.4)',
      display: 'flex', alignItems: 'center', gap: 5,
    }}>
      <div style={{ width: 6, height: 6, background: '#bbf7d0', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
      Live Dashboard
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
      <div style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)', borderRadius: 10, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(22,163,74,0.3)' }}>
        <GiFarmTractor style={{ color: '#fff', fontSize: 20 }} />
      </div>
      <div>
        <div style={{ fontWeight: 800, fontSize: 14, color: '#111827' }}>Farmer Dashboard</div>
        <div style={{ fontSize: 11, color: '#9ca3af' }}>Kharif 2024 · Gujarat</div>
      </div>
    </div>

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
            <span style={{ fontSize: 10, color: '#16a34a', fontWeight: 700, background: '#dcfce7', padding: '2px 7px', borderRadius: 20 }}>↑ {row.trend}</span>
          </div>
        </div>
        <div style={{ height: 6, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: 6, width: `${row.pct}%`, background: `linear-gradient(90deg,${row.color}99,${row.color})`, borderRadius: 99, transition: 'width 1s ease' }} />
        </div>
      </div>
    ))}

    <div style={{ marginTop: 18, background: 'linear-gradient(135deg,#faf5ff,#ede9fe)', border: '1px solid #ddd6fe', borderRadius: 12, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <FaRobot style={{ color: '#fff', fontSize: 11 }} />
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#5b21b6', marginBottom: 2 }}>AgriAI Insight</div>
        <div style={{ fontSize: 11, color: '#6d28d9', lineHeight: 1.5 }}>Your wheat expenses are 8% above average. Consider organic fertilizers next cycle.</div>
      </div>
    </div>

    <div style={{ marginTop: 14, background: '#fafafa', border: '1px solid #f3f4f6', borderRadius: 10, padding: '12px 14px' }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: '#9ca3af', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.6px' }}>7-Day Income Trend</div>
      <MiniChart />
    </div>
  </div>
);

/* ── Main Component ─────────────────────────────────────── */
const Home = () => {
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [hoveredTestimonial, setHoveredTestimonial] = useState(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setStatsVisible(true);
    }, { threshold: 0.3 });
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ background: '#fafafa', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>

      {/* ═══ HERO ══════════════════════════════════════════════ */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #14532d 100%)',
        padding: '96px 24px 80px',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '92vh',
        display: 'flex',
        alignItems: 'center',
      }}>
        {/* Animated background orbs */}
        <div style={{ position: 'absolute', top: -100, left: -100, width: 500, height: 500, background: 'radial-gradient(circle, rgba(22,163,74,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -150, right: -100, width: 600, height: 600, background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '40%', left: '60%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: 4 + i * 2,
            height: 4 + i * 2,
            background: `rgba(22,163,74,${0.3 - i * 0.04})`,
            borderRadius: '50%',
            top: `${15 + i * 14}%`,
            left: `${5 + i * 8}%`,
            animation: `float ${3 + i}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.4}s`,
          }} />
        ))}

        <div className="ab-container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 60, position: 'relative', zIndex: 1, width: '100%' }}>
          {/* Left */}
          <div style={{ flex: '1 1 440px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(22,163,74,0.15)',
              border: '1px solid rgba(22,163,74,0.3)',
              color: '#4ade80', fontSize: 12.5, fontWeight: 700,
              padding: '6px 16px', borderRadius: 20, marginBottom: 28,
              backdropFilter: 'blur(10px)',
            }}>
              <FaLeaf style={{ fontSize: 10 }} />
              🌱 India's #1 Agricultural Finance Platform
            </div>

            <h1 style={{
              fontSize: 'clamp(36px, 5.5vw, 60px)',
              fontWeight: 900,
              color: '#fff',
              lineHeight: 1.08,
              letterSpacing: '-2px',
              marginBottom: 24,
            }}>
              Smart Finance for{' '}
              <span style={{
                background: 'linear-gradient(135deg, #4ade80, #22c55e, #16a34a)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Indian Farmers
              </span>
            </h1>

            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, marginBottom: 40, maxWidth: 500 }}>
              Track expenses, plan crop budgets, detect diseases with AI, and manage your entire agricultural operation — all in one beautiful platform.
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 48 }}>
              <a href="/login" style={{
                display: 'inline-flex', alignItems: 'center', gap: 9,
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                color: '#fff', padding: '15px 32px', borderRadius: 12,
                fontWeight: 700, fontSize: 15, textDecoration: 'none',
                boxShadow: '0 6px 24px rgba(22,163,74,0.45)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(22,163,74,0.55)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(22,163,74,0.45)'; }}
              >
                Get Started Free <FaArrowRight style={{ fontSize: 13 }} />
              </a>
              <a href="#features" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff', padding: '15px 28px', borderRadius: 12,
                fontWeight: 600, fontSize: 15, textDecoration: 'none',
                backdropFilter: 'blur(10px)',
                transition: 'background 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.14)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              >
                <FaPlay style={{ fontSize: 11 }} /> Explore Features
              </a>
            </div>

            {/* Trust bar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
              {[
                { icon: '📱', text: 'Works on any device' },
                { icon: '🔒', text: 'Bank-grade security' },
                { icon: '🆓', text: 'Free for farmers' },
                { icon: '🗣️', text: 'Hindi & Gujarati support' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                  <span>{item.icon}</span> {item.text}
                </div>
              ))}
            </div>
          </div>

          {/* Right — Floating dashboard card */}
          <div style={{ flex: '1 1 380px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ animation: 'floatCard 4s ease-in-out infinite' }}>
              <DashPreview />
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
          background: 'linear-gradient(to bottom, transparent, #fafafa)',
          pointerEvents: 'none',
        }} />

        <style>{`
          @keyframes float { 0%{transform:translateY(0)} 100%{transform:translateY(-10px)} }
          @keyframes floatCard { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-12px) rotate(0.5deg)} }
          @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.2)} }
          @keyframes slideIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
          @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        `}</style>
      </section>

      {/* ═══ STATS STRIP ═══════════════════════════════════════ */}
      <section ref={statsRef} style={{
        background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
        padding: '40px 24px',
        borderTop: '1px solid #1e293b',
        borderBottom: '1px solid #1e293b',
      }}>
        <div className="ab-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 24, textAlign: 'center' }}>
          {stats.map((s, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <div style={{ fontSize: 22, color: '#16a34a', marginBottom: 6, display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
              <div style={{ fontSize: 30, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 12.5, color: '#6b7280', fontWeight: 500, marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FEATURES ══════════════════════════════════════════ */}
      <section id="features" style={{ background: '#fff', padding: '96px 24px' }}>
        <div className="ab-container">
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#f0fdf4', color: '#15803d',
              fontSize: 12, fontWeight: 700, padding: '5px 16px',
              borderRadius: 20, marginBottom: 20,
              border: '1px solid #bbf7d0', textTransform: 'uppercase', letterSpacing: 1,
            }}>
              <FaSeedling style={{ fontSize: 10 }} /> Core Features
            </span>
            <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, color: '#111827', letterSpacing: '-1px', marginBottom: 16 }}>
              Everything your farm needs
            </h2>
            <p style={{ fontSize: 17, color: '#6b7280', lineHeight: 1.7, maxWidth: 540, margin: '0 auto' }}>
              From daily expense tracking to AI-powered crop recommendations — AgriBudget covers every aspect of farm management.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {features.map((f, i) => (
              <div
                key={i}
                style={{
                  background: '#fff',
                  border: `1.5px solid ${hoveredFeature === i ? '#e5e7eb' : '#f3f4f6'}`,
                  borderRadius: 18,
                  padding: '28px 26px',
                  cursor: 'default',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
                  transform: hoveredFeature === i ? 'translateY(-6px)' : 'none',
                  boxShadow: hoveredFeature === i ? '0 20px 50px rgba(0,0,0,0.10)' : '0 2px 8px rgba(0,0,0,0.04)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                {hoveredFeature === i && (
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: f.bg, borderRadius: '18px 18px 0 0' }} />
                )}
                <div style={{
                  width: 52, height: 52, background: f.bg,
                  borderRadius: 14, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', marginBottom: 18, fontSize: 22, color: f.color,
                  boxShadow: `0 4px 12px ${f.color}22`,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#111827', marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 13.5, color: '#6b7280', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ AI SECTION ════════════════════════════════════════ */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        padding: '96px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 300, height: 300, background: 'radial-gradient(circle, rgba(22,163,74,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div className="ab-container" style={{ display: 'flex', flexWrap: 'wrap', gap: 64, alignItems: 'center', position: 'relative', zIndex: 1 }}>
          {/* Left — Chat preview */}
          <div style={{ flex: '1 1 360px', minWidth: 0 }}>
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 20,
              padding: 24,
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ width: 42, height: 42, background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(124,58,237,0.4)' }}>
                  <FaRobot style={{ color: '#fff', fontSize: 18 }} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: '#f1f5f9' }}>AgriAI Assistant</div>
                  <div style={{ fontSize: 11, color: '#64748b', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 7, height: 7, background: '#22c55e', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
                    Powered by Gemini · Online
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '14px 14px 14px 4px', padding: '12px 16px', maxWidth: '85%', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.65 }}>🌱 Namaste! I'm AgriAI. I help with crop selection, disease detection, financial planning, and more.</div>
                </div>
                <div style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)', borderRadius: '14px 14px 4px 14px', padding: '12px 16px', maxWidth: '80%', alignSelf: 'flex-end', boxShadow: '0 4px 12px rgba(22,163,74,0.35)' }}>
                  <div style={{ fontSize: 13, color: '#fff', lineHeight: 1.65 }}>Which crop should I grow this Rabi season in Gujarat?</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '14px 14px 14px 4px', padding: '12px 16px', maxWidth: '88%', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.65 }}>Based on Gujarat's climate and your soil data, I recommend <strong style={{ color: '#4ade80' }}>Wheat or Mustard</strong>. Expected profit: <strong style={{ color: '#4ade80' }}>₹32,000–₹45,000/hectare</strong>.</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {aiFeatures.map((a, i) => (
                  <div key={i} style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 20, padding: '5px 12px',
                    fontSize: 11.5, color: '#94a3b8', cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                  >
                    {a.icon} {a.q}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right */}
          <div style={{ flex: '1 1 380px', minWidth: 0 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(124,58,237,0.2)', color: '#a78bfa',
              fontSize: 12, fontWeight: 700, padding: '5px 16px',
              borderRadius: 20, marginBottom: 20,
              border: '1px solid rgba(124,58,237,0.3)',
              textTransform: 'uppercase', letterSpacing: 1,
            }}>
              <FaRobot style={{ fontSize: 10 }} /> AI-Powered Farming
            </span>
            <h2 style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: 900, color: '#fff', letterSpacing: '-1px', marginBottom: 20, lineHeight: 1.15 }}>
              Your Personal<br />Agricultural AI Expert
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, marginBottom: 32 }}>
              AgriAI combines domain expertise with cutting-edge AI to give you contextualised, actionable advice for your farm — 24/7, in your language.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                ['🌱', 'Crop Recommendations', 'Data-driven crop suggestions based on soil, weather, and season.', '#4ade80'],
                ['🔬', 'Disease Detection', 'Upload a leaf photo and get instant AI disease diagnosis.', '#60a5fa'],
                ['💰', 'Financial Planning', 'Personalised cost reduction advice based on your farm data.', '#fbbf24'],
                ['📈', 'Market Intelligence', 'Know exactly when to sell your produce for maximum profit.', '#f472b6'],
              ].map(([emoji, title, desc, accent], i) => (
                <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: '14px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                >
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{emoji}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9', marginBottom: 3 }}>{title}</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.55 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ══════════════════════════════════════ */}
      <section style={{ background: '#fff', padding: '96px 24px', borderTop: '1px solid #f3f4f6' }}>
        <div className="ab-container">
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span style={{
              display: 'inline-block',
              background: '#fef3c7', color: '#d97706',
              fontSize: 12, fontWeight: 700, padding: '5px 16px',
              borderRadius: 20, marginBottom: 20,
              border: '1px solid #fde68a', textTransform: 'uppercase', letterSpacing: 1,
            }}>
              How It Works
            </span>
            <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, color: '#111827', letterSpacing: '-1px', marginBottom: 16 }}>
              Get started in 3 simple steps
            </h2>
            <p style={{ fontSize: 17, color: '#6b7280', lineHeight: 1.7, maxWidth: 480, margin: '0 auto' }}>
              No technical knowledge required. AgriBudget is designed for farmers, not accountants.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, position: 'relative' }}>
            {steps.map((step, i) => (
              <div key={i} style={{
                textAlign: 'center', padding: '40px 28px',
                background: '#fafafa', borderRadius: 20,
                border: '1.5px solid #f3f4f6',
                position: 'relative',
                transition: 'transform 0.25s, box-shadow 0.25s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{
                  position: 'absolute', top: -1, left: 0, right: 0, height: 3,
                  background: `linear-gradient(90deg, ${step.color}44, ${step.color})`,
                  borderRadius: '20px 20px 0 0',
                }} />
                <div style={{
                  position: 'absolute', top: 20, right: 20,
                  fontSize: 36, fontWeight: 900, color: `${step.color}15`,
                  letterSpacing: '-1px', lineHeight: 1,
                }}>{step.n}</div>
                <div style={{
                  width: 70, height: 70,
                  background: `linear-gradient(135deg, ${step.color}20, ${step.color}35)`,
                  border: `2px solid ${step.color}30`,
                  borderRadius: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 22px', fontSize: 28, color: step.color,
                  boxShadow: `0 4px 16px ${step.color}20`,
                }}>
                  {step.icon}
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, background: step.color, borderRadius: '50%', color: '#fff', fontSize: 11, fontWeight: 800, marginBottom: 14 }}>{i + 1}</div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#111827', marginBottom: 12 }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, maxWidth: 240, margin: '0 auto' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ══════════════════════════════════════ */}
      <section style={{ background: '#fafafa', padding: '96px 24px' }}>
        <div className="ab-container">
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#eff6ff', color: '#2563eb',
              fontSize: 12, fontWeight: 700, padding: '5px 16px',
              borderRadius: 20, marginBottom: 20,
              border: '1px solid #bfdbfe', textTransform: 'uppercase', letterSpacing: 1,
            }}>
              <FaStar style={{ fontSize: 10 }} /> Testimonials
            </span>
            <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, color: '#111827', letterSpacing: '-1px' }}>
              Trusted by farmers across India
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 22 }}>
            {testimonials.map((t, i) => (
              <div key={i}
                style={{
                  background: '#fff',
                  border: `1.5px solid ${hoveredTestimonial === i ? t.color + '30' : '#f3f4f6'}`,
                  borderRadius: 20,
                  padding: '30px 26px',
                  transition: 'all 0.25s ease',
                  transform: hoveredTestimonial === i ? 'translateY(-6px)' : 'none',
                  boxShadow: hoveredTestimonial === i ? `0 20px 50px ${t.color}15` : '0 2px 8px rgba(0,0,0,0.04)',
                  position: 'relative', overflow: 'hidden',
                }}
                onMouseEnter={() => setHoveredTestimonial(i)}
                onMouseLeave={() => setHoveredTestimonial(null)}
              >
                <div style={{
                  position: 'absolute', top: 0, right: 0,
                  width: 80, height: 80,
                  background: `radial-gradient(circle at top right, ${t.color}12, transparent 70%)`,
                }} />
                <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
                  {[...Array(5)].map((_, j) => <FaStar key={j} style={{ color: '#fbbf24', fontSize: 13 }} />)}
                </div>
                <FaQuoteLeft style={{ fontSize: 24, color: '#e5e7eb', marginBottom: 14 }} />
                <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.75, marginBottom: 24, fontStyle: 'italic' }}>{t.quote}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, borderTop: '1px solid #f3f4f6', paddingTop: 18 }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${t.color}30, ${t.color}60)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 15, fontWeight: 800, color: t.color,
                    border: `2px solid ${t.color}30`,
                  }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#111827' }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{t.role} · {t.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══════════════════════════════════════════════ */}
      <section style={{
        background: 'linear-gradient(135deg, #14532d 0%, #15803d 40%, #166534 100%)',
        padding: '96px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, background: 'rgba(255,255,255,0.05)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 400, height: 400, background: 'rgba(255,255,255,0.04)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div className="ab-container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.15)', color: '#fff',
            fontSize: 12, fontWeight: 700, padding: '6px 18px',
            borderRadius: 20, marginBottom: 24,
            border: '1px solid rgba(255,255,255,0.25)',
          }}>
            <GiWheat /> Start Your Journey
          </div>
          <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, color: '#fff', marginBottom: 18, letterSpacing: '-1px', lineHeight: 1.15 }}>
            Ready to transform your<br />farm's financial health?
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.75)', marginBottom: 44, maxWidth: 500, margin: '0 auto 44px', lineHeight: 1.7 }}>
            Join thousands of farmers already using AgriBudget to make smarter decisions every season.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: 9,
              background: '#fff', color: '#15803d',
              padding: '16px 36px', borderRadius: 12,
              fontWeight: 800, fontSize: 16, textDecoration: 'none',
              boxShadow: '0 8px 28px rgba(0,0,0,0.2)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(0,0,0,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.2)'; }}
            >
              Start for Free <FaArrowRight style={{ fontSize: 13 }} />
            </a>
            <a href="/about" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'transparent', color: '#fff',
              padding: '16px 32px', borderRadius: 12,
              fontWeight: 700, fontSize: 16, textDecoration: 'none',
              border: '2px solid rgba(255,255,255,0.4)',
              transition: 'background 0.2s, border-color 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; }}
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ════════════════════════════════════════════ */}
      <footer style={{ background: '#0f172a', color: '#e2e8f0', padding: '72px 24px 36px' }}>
        <div className="ab-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 48, marginBottom: 52 }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <div style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)', borderRadius: 10, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(22,163,74,0.3)' }}>
                <FaLeaf style={{ color: '#fff', fontSize: 17 }} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 18, color: '#fff', letterSpacing: '-0.3px' }}>AgriBudget</div>
                <div style={{ fontSize: 10.5, color: '#64748b', fontWeight: 500, letterSpacing: '0.5px' }}>SMART FARM FINANCE</div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.8, maxWidth: 220 }}>
              Intelligent farm finance management for modern farmers and agro-businesses across India.
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 22 }}>
              {[FaFacebook, FaTwitter, FaInstagram].map((Icon, i) => (
                <a key={i} href="#" aria-label="Social" style={{
                  width: 36, height: 36, background: '#1e293b',
                  border: '1px solid #334155', borderRadius: 9,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#64748b', textDecoration: 'none',
                  transition: 'background 0.15s, color 0.15s, border-color 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#16a34a22'; e.currentTarget.style.color = '#4ade80'; e.currentTarget.style.borderColor = '#16a34a44'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#334155'; }}>
                  <Icon style={{ fontSize: 14 }} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: 11.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 18 }}>Product</h4>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[['/', 'Home'], ['/about', 'About'], ['#features', 'Features'], ['/login', 'Login'], ['/login', 'Register']].map(([href, label]) => (
                <li key={label}><a href={href} style={{ fontSize: 13, color: '#64748b', textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => e.target.style.color = '#e2e8f0'}
                  onMouseLeave={e => e.target.style.color = '#64748b'}>{label}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: 11.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 18 }}>Support</h4>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['Help Center', 'FAQs', 'Privacy Policy', 'Terms of Service'].map(label => (
                <li key={label}><a href="#" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => e.target.style.color = '#e2e8f0'}
                  onMouseLeave={e => e.target.style.color = '#64748b'}>{label}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: 11.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 18 }}>Contact</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { icon: <FaEnvelope />, text: 'info@agribudget.com' },
                { icon: <FaPhone />, text: '+91 12345 67890' },
                { icon: <FaShieldAlt />, text: 'Bank-grade security' },
                { icon: <FaGlobe />, text: 'agribudget.in' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, color: '#64748b' }}>
                  <span style={{ color: '#16a34a', fontSize: 12 }}>{item.icon}</span> {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #1e293b', paddingTop: 28, display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 12.5, color: '#475569' }}>© {new Date().getFullYear()} AgriBudget. All rights reserved.</div>
          <div style={{ fontSize: 12.5, color: '#475569' }}>Made with ❤️ for Indian farmers</div>
        </div>
      </footer>

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            position: 'fixed', bottom: 28, right: 28, zIndex: 999,
            width: 46, height: 46,
            background: 'linear-gradient(135deg,#16a34a,#15803d)',
            border: 'none', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#fff',
            boxShadow: '0 6px 20px rgba(22,163,74,0.5)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            animation: 'slideIn 0.3s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
          aria-label="Scroll to top"
        >
          <FaArrowUp style={{ fontSize: 15 }} />
        </button>
      )}
    </div>
  );
};

export default Home;