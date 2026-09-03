import React from 'react';
import { FaLeaf, FaChartLine, FaWallet, FaBell, FaCloudSun, FaQuoteLeft, FaFacebook, FaTwitter, FaInstagram, FaEnvelope, FaPhone, FaArrowRight, FaCheck } from 'react-icons/fa';
import { GiWheat, GiFarmTractor } from 'react-icons/gi';
import { SiFirebase, SiMongodb, SiJsonwebtokens } from 'react-icons/si';

const features = [
  {
    icon: <FaWallet style={{ fontSize: 22, color: '#16a34a' }} />,
    title: 'Income & Expense Tracking',
    desc: 'Monitor all your farm finances in one place with real-time updates.',
  },
  {
    icon: <GiWheat style={{ fontSize: 22, color: '#d97706' }} />,
    title: 'Crop-wise Budgeting',
    desc: 'Plan and compare budgets for each crop with detailed analytics.',
  },
  {
    icon: <FaBell style={{ fontSize: 22, color: '#2563eb' }} />,
    title: 'Budget Alerts',
    desc: 'Get instant alerts when you exceed your budget with smart notifications.',
  },
  {
    icon: <FaCloudSun style={{ fontSize: 22, color: '#7c3aed' }} />,
    title: 'Weather & Market API',
    desc: 'Stay updated with weather forecasts and real-time market prices.',
  },
];

const analytics = [
  { title: 'Monthly Income', value: '₹48,000', change: '+12%', accent: '#16a34a' },
  { title: 'Total Expenses', value: '₹32,000', change: '+3%',  accent: '#d97706' },
  { title: 'Budget Usage',   value: '80%',     change: '',     accent: '#2563eb' },
  { title: 'Crop Performance', value: '95%',   change: '+5%',  accent: '#7c3aed' },
];

const testimonials = [
  {
    quote: 'AgriBudget made it so easy to track my farm expenses and plan ahead. Highly recommended!',
    name: 'Ravi Patel',
    location: 'Gujarat, India',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    quote: 'The budget alerts and analytics help me make smarter decisions every season.',
    name: 'Sunita Sharma',
    location: 'Punjab, India',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    quote: 'Love the mobile-friendly design and easy-to-use dashboard!',
    name: 'John M.',
    location: 'Nairobi, Kenya',
    avatar: 'https://randomuser.me/api/portraits/men/65.jpg',
  },
];

const techs = [
  { icon: <SiFirebase style={{ fontSize: 28, color: '#f97316' }} />, name: 'Firebase' },
  { icon: <FaCloudSun style={{ fontSize: 28, color: '#3b82f6' }} />, name: 'OpenWeather' },
  { icon: <SiMongodb style={{ fontSize: 28, color: '#16a34a' }} />, name: 'MongoDB' },
  { icon: <SiJsonwebtokens style={{ fontSize: 28, color: '#d97706' }} />, name: 'JWT' },
];

const highlights = [
  'Works on any device, any time',
  'Secure data storage',
  'Real-time market updates',
  'Multi-language support',
];

const Home = () => {
  return (
    <div style={{ background: '#fafafa', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>

      {/* ===== HERO ===== */}
      <section style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '72px 24px 64px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 48 }}>
          {/* Left */}
          <div style={{ flex: '1 1 420px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#dcfce7', color: '#15803d', borderRadius: 9999, padding: '4px 14px', fontSize: 13, fontWeight: 600, marginBottom: 24 }}>
              <FaLeaf style={{ fontSize: 11 }} /> Farm Finance Platform
            </span>
            <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, color: '#111827', lineHeight: 1.15, letterSpacing: '-1px', marginBottom: 20 }}>
              Empower Your<br />Agricultural Finances
            </h1>
            <p style={{ fontSize: 17, color: '#6b7280', lineHeight: 1.7, marginBottom: 32, maxWidth: 460 }}>
              Track expenses, plan budgets, and harvest insights with AgriBudget's intelligent farming management platform.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a
                href="/login"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#16a34a', color: '#fff', padding: '12px 28px', borderRadius: 8, fontWeight: 700, fontSize: 15, textDecoration: 'none', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#15803d'}
                onMouseLeave={e => e.currentTarget.style.background = '#16a34a'}
                aria-label="Get Started"
              >
                Get Started <FaArrowRight style={{ fontSize: 13 }} />
              </a>
              <a
                href="#features"
                style={{ display: 'inline-flex', alignItems: 'center', background: '#fff', color: '#374151', padding: '12px 24px', borderRadius: 8, fontWeight: 600, fontSize: 15, textDecoration: 'none', border: '1px solid #e5e7eb', transition: 'border-color 0.15s' }}
              >
                See Features
              </a>
            </div>
            <ul style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {highlights.map((h, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#6b7280' }}>
                  <FaCheck style={{ color: '#16a34a', fontSize: 12, flexShrink: 0 }} /> {h}
                </li>
              ))}
            </ul>
          </div>

          {/* Right — visual block */}
          <div style={{ flex: '1 1 360px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 16, padding: 32, width: '100%', maxWidth: 380 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{ background: '#16a34a', borderRadius: 10, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GiFarmTractor style={{ color: '#fff', fontSize: 22 }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>Farmer Dashboard</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Farm overview</div>
                </div>
              </div>
              {[
                { label: 'Total Income',   val: '₹48,000', color: '#16a34a', pct: 72 },
                { label: 'Total Expenses', val: '₹32,000', color: '#d97706', pct: 48 },
                { label: 'Net Profit',     val: '₹16,000', color: '#2563eb', pct: 24 },
              ].map((row, i) => (
                <div key={i} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>{row.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: row.color }}>{row.val}</span>
                  </div>
                  <div style={{ height: 6, background: '#e5e7eb', borderRadius: 99 }}>
                    <div style={{ height: 6, width: `${row.pct}%`, background: row.color, borderRadius: 99 }} />
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 20, padding: '12px 16px', background: '#dcfce7', borderRadius: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#15803d' }}>🌱 Crop season: Kharif 2024</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" style={{ padding: '72px 24px', background: '#fafafa' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: 48, textAlign: 'center' }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: '#111827', letterSpacing: '-0.5px', marginBottom: 12 }}>Core Features</h2>
            <p style={{ fontSize: 16, color: '#6b7280', maxWidth: 500, margin: '0 auto' }}>Everything you need to manage your farm finances efficiently.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="pro-card pro-card-hover"
                style={{ padding: '28px 24px', transition: 'all 0.2s ease' }}
              >
                <div style={{ width: 44, height: 44, background: '#f3f4f6', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 8 }}>{feature.title}</h3>
                <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ANALYTICS ===== */}
      <section style={{ padding: '72px 24px', background: '#fff', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: 48, textAlign: 'center' }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: '#111827', letterSpacing: '-0.5px', marginBottom: 12 }}>Analytics at a Glance</h2>
            <p style={{ fontSize: 16, color: '#6b7280', maxWidth: 480, margin: '0 auto' }}>Real-time numbers to keep your farm finances on track.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {analytics.map((item, idx) => (
              <div key={idx} className="pro-card" style={{ padding: '24px 20px', borderLeft: `4px solid ${item.accent}` }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#111827', marginBottom: 4 }}>{item.value}</div>
                <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>{item.title}</div>
                {item.change && (
                  <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, marginTop: 6 }}>↑ {item.change} this month</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section style={{ padding: '72px 24px', background: '#fafafa' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: 48, textAlign: 'center' }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: '#111827', letterSpacing: '-0.5px', marginBottom: 12 }}>What Our Users Say</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {testimonials.map((t, idx) => (
              <div key={idx} className="pro-card pro-card-hover" style={{ padding: '28px 24px', transition: 'all 0.2s ease' }}>
                <FaQuoteLeft style={{ fontSize: 18, color: '#d1d5db', marginBottom: 14 }} />
                <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>{t.quote}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid #f3f4f6', paddingTop: 16 }}>
                  <img src={t.avatar} alt={t.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>{t.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TECH STACK ===== */}
      <section style={{ padding: '48px 24px', background: '#fff', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 28 }}>Powered by Proven Technologies</p>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 40, flexWrap: 'wrap' }}>
            {techs.map((tech, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 52, height: 52, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {tech.icon}
                </div>
                <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>{tech.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section style={{ padding: '64px 24px', background: '#16a34a' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 30, fontWeight: 800, color: '#fff', marginBottom: 14, letterSpacing: '-0.4px' }}>Ready to Take Control of Your Farm Finances?</h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', marginBottom: 32 }}>Join thousands of farmers already using AgriBudget.</p>
          <a
            href="/login"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: '#16a34a', padding: '13px 32px', borderRadius: 8, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}
            aria-label="Start for Free"
          >
            Start for Free <FaArrowRight style={{ fontSize: 13 }} />
          </a>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{ background: '#111827', color: '#e5e7eb', padding: '56px 24px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 40 }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ background: '#16a34a', borderRadius: 7, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaLeaf style={{ color: '#fff', fontSize: 14 }} />
              </div>
              <span style={{ fontWeight: 800, fontSize: 17, color: '#fff' }}>AgriBudget</span>
            </div>
            <p style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.7 }}>Intelligent farm finance management for modern farmers and agro-businesses.</p>
          </div>

          {/* Links */}
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 14 }}>Product</h4>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[['#', 'Home'], ['#about', 'About'], ['#features', 'Features'], ['/login', 'Login']].map(([href, label]) => (
                <li key={label}><a href={href} style={{ fontSize: 13, color: '#9ca3af', textDecoration: 'none', transition: 'color 0.15s' }} onMouseEnter={e => e.target.style.color='#e5e7eb'} onMouseLeave={e => e.target.style.color='#9ca3af'}>{label}</a></li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 14 }}>Support</h4>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Help Center', 'FAQs', 'Privacy Policy', 'Terms of Service'].map(label => (
                <li key={label}><a href="#" style={{ fontSize: 13, color: '#9ca3af', textDecoration: 'none' }} onMouseEnter={e => e.target.style.color='#e5e7eb'} onMouseLeave={e => e.target.style.color='#9ca3af'}>{label}</a></li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 14 }}>Connect</h4>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              {[FaFacebook, FaTwitter, FaInstagram].map((Icon, i) => (
                <a key={i} href="#" aria-label="Social" style={{ width: 34, height: 34, background: '#1f2937', border: '1px solid #374151', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', textDecoration: 'none', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background='#374151'} onMouseLeave={e => e.currentTarget.style.background='#1f2937'}>
                  <Icon style={{ fontSize: 14 }} />
                </a>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#9ca3af', marginBottom: 8 }}>
              <FaEnvelope style={{ fontSize: 12, color: '#16a34a' }} /> info@agribudget.com
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#9ca3af' }}>
              <FaPhone style={{ fontSize: 12, color: '#16a34a' }} /> +91 12345 67890
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #1f2937', paddingTop: 24, textAlign: 'center', fontSize: 12, color: '#6b7280' }}>
          &copy; {new Date().getFullYear()} AgriBudget. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;