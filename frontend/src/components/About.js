import React from 'react';
import { FaLeaf, FaHeart, FaLightbulb, FaUsers, FaSeedling, FaChartLine, FaShieldAlt } from 'react-icons/fa';
import { GiWheat, GiFarmTractor } from 'react-icons/gi';

/* ── Team data ─────────────────────────────────────────────────── */
const team = [
  { initials: 'DJ', name: 'Dhruvrajsinh Jadeja', role: 'Founder & Full-Stack Dev', color: '#16a34a' },
  { initials: 'KS', name: 'Keval Shah',          role: 'Backend & Database',       color: '#2563eb' },
  { initials: 'HG', name: 'Het Gajera',          role: 'Frontend & UI/UX',         color: '#7c3aed' },
  { initials: 'MJ', name: 'Meet Jani',           role: 'AI & ML Integration',      color: '#d97706' },
];

/* ── Value cards ────────────────────────────────────────────────── */
const values = [
  {
    icon: <FaHeart />,
    title: 'Sustainability',
    desc: 'We promote eco-friendly farming practices that protect the environment and ensure long-term agricultural success for future generations.',
    color: '#16a34a',
    bg: '#f0fdf4',
    border: '#bbf7d0',
  },
  {
    icon: <FaLightbulb />,
    title: 'Innovation',
    desc: 'We continuously bring cutting-edge AI and data solutions that address the ever-evolving challenges faced by modern farmers.',
    color: '#d97706',
    bg: '#fffbeb',
    border: '#fde68a',
  },
  {
    icon: <FaUsers />,
    title: 'Community',
    desc: 'We build a strong, supportive network of farmers who share knowledge, experiences, and insights for collective growth.',
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
  },
  {
    icon: <FaShieldAlt />,
    title: 'Trust',
    desc: 'We are committed to data privacy, transparency, and building reliable tools that farmers can depend on every season.',
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#ddd6fe',
  },
];

/* ── Stats ──────────────────────────────────────────────────────── */
const stats = [
  { value: '10,000+', label: 'Farmers Served',    icon: <GiFarmTractor /> },
  { value: '25+',     label: 'Crops Supported',   icon: <GiWheat />       },
  { value: '98%',     label: 'Satisfaction Rate', icon: <FaChartLine />   },
  { value: '3 States',label: 'Coverage Area',     icon: <FaSeedling />    },
];

/* ── Component ──────────────────────────────────────────────────── */
const About = () => {
  return (
    <div style={{ background: '#fafafa', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>

      {/* ── Hero ── */}
      <section style={{
        background: 'linear-gradient(135deg, #f0fdf4 0%, #eff6ff 50%, #fefce8 100%)',
        borderBottom: '1px solid #e5e7eb',
        padding: '72px 24px 64px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#dcfce7', color: '#15803d', fontSize: 13, fontWeight: 600,
            padding: '4px 14px', borderRadius: 20, marginBottom: 20,
            border: '1px solid #bbf7d0',
          }}>
            <FaLeaf style={{ fontSize: 11 }} /> Our Story
          </span>

          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 800, lineHeight: 1.15,
            color: '#111827', margin: '0 0 20px',
          }}>
            Empowering Farmers with{' '}
            <span style={{
              background: 'linear-gradient(135deg, #16a34a, #2563eb)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Smart Technology
            </span>
          </h1>

          <p style={{
            fontSize: 18, color: '#6b7280', lineHeight: 1.75,
            margin: '0 auto', maxWidth: 560,
          }}>
            Agri-Sathi bridges the gap between traditional farming and modern technology,
            giving every farmer the tools they need to grow smarter and earn more.
          </p>
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <section style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '32px 24px' }}>
        <div style={{
          maxWidth: 960, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 24,
        }}>
          {stats.map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, color: '#16a34a', marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#111827', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Mission ── */}
      <section style={{ padding: '72px 24px', maxWidth: 960, margin: '0 auto' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 48, alignItems: 'center',
        }}>
          {/* Text */}
          <div>
            <span style={{
              display: 'inline-block', background: '#dcfce7', color: '#15803d',
              fontSize: 12, fontWeight: 700, padding: '3px 12px', borderRadius: 20,
              marginBottom: 16, letterSpacing: 1, textTransform: 'uppercase',
            }}>
              Our Mission
            </span>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: '#111827', margin: '0 0 16px', lineHeight: 1.2 }}>
              Technology in the hands of every farmer
            </h2>
            <p style={{ fontSize: 16, color: '#374151', lineHeight: 1.8, marginBottom: 16 }}>
              Agri-Sathi is dedicated to revolutionising agriculture through AI-powered crop recommendations,
              real-time market prices, smart budget tracking, and community-driven insights — all in one place.
            </p>
            <p style={{ fontSize: 16, color: '#374151', lineHeight: 1.8 }}>
              We believe that modern tools should be accessible to every farmer regardless of their
              technical background, which is why we built Agri-Sathi to be simple, regional, and reliable.
            </p>
          </div>

          {/* Visual card */}
          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4, #eff6ff)',
            border: '1px solid #e5e7eb', borderRadius: 20,
            padding: 40, textAlign: 'center',
          }}>
            <FaLeaf style={{ fontSize: 72, color: '#16a34a', marginBottom: 20 }} />
            <div style={{ fontSize: 15, color: '#374151', lineHeight: 1.7 }}>
              "Combining <strong>AI, data analytics</strong> and{' '}
              <strong>community wisdom</strong> to help Indian farmers
              thrive in every season."
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section style={{ background: '#fff', padding: '72px 24px', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{
              display: 'inline-block', background: '#eff6ff', color: '#2563eb',
              fontSize: 12, fontWeight: 700, padding: '3px 12px', borderRadius: 20,
              marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase',
            }}>
              What We Stand For
            </span>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: '#111827', margin: 0 }}>Our Core Values</h2>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: 24,
          }}>
            {values.map((v, i) => (
              <div key={i} style={{
                background: v.bg, border: `1px solid ${v.border}`,
                borderRadius: 16, padding: '28px 24px',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 12, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  background: '#fff', marginBottom: 16,
                  fontSize: 22, color: v.color,
                  boxShadow: `0 2px 8px ${v.color}22`,
                }}>
                  {v.icon}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: '0 0 10px' }}>{v.title}</h3>
                <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.75, margin: 0 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section style={{ padding: '72px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{
              display: 'inline-block', background: '#f5f3ff', color: '#7c3aed',
              fontSize: 12, fontWeight: 700, padding: '3px 12px', borderRadius: 20,
              marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase',
            }}>
              The Builders
            </span>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: '#111827', margin: '0 0 12px' }}>Meet Our Team</h2>
            <p style={{ fontSize: 16, color: '#6b7280', maxWidth: 480, margin: '0 auto' }}>
              A passionate group of developers and tech enthusiasts on a mission to modernise Indian agriculture.
            </p>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 24,
          }}>
            {team.map((member, i) => (
              <div key={i} style={{
                background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16,
                padding: '32px 20px', textAlign: 'center',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.09)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {/* Avatar */}
                <div style={{
                  width: 80, height: 80, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${member.color}33, ${member.color}66)`,
                  border: `2px solid ${member.color}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: 26, fontWeight: 800, color: member.color,
                }}>
                  {member.initials}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 6px', lineHeight: 1.3 }}>
                  {member.name}
                </h3>
                <span style={{
                  display: 'inline-block', fontSize: 12, fontWeight: 600,
                  color: member.color, background: `${member.color}15`,
                  padding: '3px 10px', borderRadius: 20,
                }}>
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{
        background: 'linear-gradient(135deg, #15803d, #1d4ed8)',
        padding: '56px 24px', textAlign: 'center',
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <GiWheat style={{ fontSize: 40, color: '#fff', marginBottom: 16 }} />
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 14px' }}>
            Join thousands of farmers growing smarter
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', marginBottom: 28, lineHeight: 1.7 }}>
            Start your journey with Agri-Sathi today — free, simple, and built for you.
          </p>
          <a href="/register" style={{
            display: 'inline-block', background: '#fff', color: '#15803d',
            fontWeight: 700, fontSize: 15, padding: '12px 32px',
            borderRadius: 10, textDecoration: 'none',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          }}>
            Get Started Free →
          </a>
        </div>
      </section>

    </div>
  );
};

export default About;