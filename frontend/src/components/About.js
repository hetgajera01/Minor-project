import React, { useState } from 'react';
import { FaLeaf, FaHeart, FaLightbulb, FaUsers, FaSeedling, FaChartLine, FaShieldAlt, FaArrowRight, FaLinkedin, FaGithub } from 'react-icons/fa';
import { GiWheat, GiFarmTractor } from 'react-icons/gi';

/* ── Team data ────────────────────────────────────────────── */
const team = [
  { initials: 'DJ', name: 'Dhruvrajsinh Jadeja', role: 'Founder & Full-Stack Dev', color: '#16a34a', bg: 'linear-gradient(135deg,#dcfce7,#bbf7d0)', desc: 'Architected the entire MERN stack platform with a focus on farmer-first UX.' },
  { initials: 'KS', name: 'Keval Shah', role: 'Backend & Database', color: '#2563eb', bg: 'linear-gradient(135deg,#dbeafe,#bfdbfe)', desc: 'Designed the scalable MongoDB schemas, API architecture, and authentication system.' },
  { initials: 'HG', name: 'Het Gajera', role: 'Frontend & UI/UX', color: '#7c3aed', bg: 'linear-gradient(135deg,#ede9fe,#ddd6fe)', desc: 'Crafted the premium design system and immersive user experience across all dashboards.' },
  { initials: 'MJ', name: 'Meet Jani', role: 'AI & ML Integration', color: '#d97706', bg: 'linear-gradient(135deg,#fef3c7,#fde68a)', desc: 'Integrated Gemini AI, crop ML models, and the disease detection vision system.' },
];

/* ── Values ─────────────────────────────────────────────────── */
const values = [
  { icon: <FaHeart />, title: 'Sustainability', desc: 'We promote eco-friendly farming practices that protect the environment for future generations.', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  { icon: <FaLightbulb />, title: 'Innovation', desc: 'We bring cutting-edge AI and data solutions to the ever-evolving challenges of modern farming.', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  { icon: <FaUsers />, title: 'Community', desc: 'We build a strong, supportive network where farmers share knowledge and grow together.', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  { icon: <FaShieldAlt />, title: 'Trust', desc: 'We are committed to data privacy, transparency, and building tools farmers can always depend on.', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
];

/* ── Stats ───────────────────────────────────────────────────── */
const stats = [
  { value: '10,000+', label: 'Farmers Served', icon: <GiFarmTractor /> },
  { value: '25+', label: 'Crops Supported', icon: <GiWheat /> },
  { value: '98%', label: 'Satisfaction Rate', icon: <FaChartLine /> },
  { value: '3 States', label: 'Coverage Area', icon: <FaSeedling /> },
];

/* ── Timeline ────────────────────────────────────────────────── */
const timeline = [
  { year: '2023', title: 'The Idea', desc: 'Four engineering students noticed farmers struggling with finance tracking — and decided to build a solution.' },
  { year: 'Early 2024', title: 'MVP Launch', desc: 'Launched the core finance tracker with income, expenses, and crop-wise budgeting. First 100 farmers onboarded.' },
  { year: 'Mid 2024', title: 'AI Integration', desc: 'Added AgriAI chat powered by Gemini, crop disease detection, and intelligent yield prediction.' },
  { year: 'Late 2024', title: 'Marketplace', desc: 'Launched the agro-business marketplace connecting farmers with suppliers and buyers across 3 states.' },
];

/* ── Component ───────────────────────────────────────────────── */
const About = () => {
  const [hoveredTeam, setHoveredTeam] = useState(null);
  const [hoveredValue, setHoveredValue] = useState(null);

  return (
    <div style={{ background: '#fafafa', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes slideIn { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #14532d 100%)',
        padding: '100px 24px 80px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Orbs */}
        <div style={{ position: 'absolute', top: -80, left: -80, width: 400, height: 400, background: 'radial-gradient(circle, rgba(22,163,74,0.18) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -100, right: -60, width: 500, height: 500, background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '30%', right: '20%', width: 200, height: 200, background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 720, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.3)',
            color: '#4ade80', fontSize: 12.5, fontWeight: 700,
            padding: '6px 18px', borderRadius: 20, marginBottom: 28,
            backdropFilter: 'blur(10px)',
            textTransform: 'uppercase', letterSpacing: 1,
          }}>
            <FaLeaf style={{ fontSize: 10 }} /> Our Story
          </div>

          <h1 style={{
            fontSize: 'clamp(2.2rem, 5.5vw, 3.5rem)',
            fontWeight: 900, lineHeight: 1.1, color: '#fff',
            margin: '0 0 24px', letterSpacing: '-1.5px',
          }}>
            Empowering Farmers with{' '}
            <span style={{ background: 'linear-gradient(135deg,#4ade80,#22c55e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Smart Technology
            </span>
          </h1>

          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, margin: '0 auto 40px', maxWidth: 560 }}>
            Agri-Sathi bridges the gap between traditional farming and modern technology, giving every farmer the tools they need to grow smarter and earn more.
          </p>

          <a href="/login" style={{
            display: 'inline-flex', alignItems: 'center', gap: 9,
            background: 'linear-gradient(135deg,#16a34a,#15803d)',
            color: '#fff', padding: '14px 32px', borderRadius: 12,
            fontWeight: 800, fontSize: 15, textDecoration: 'none',
            boxShadow: '0 6px 24px rgba(22,163,74,0.45)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(22,163,74,0.55)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(22,163,74,0.45)'; }}
          >
            Get Started Free <FaArrowRight style={{ fontSize: 12 }} />
          </a>
        </div>

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(to bottom, transparent, #fafafa)', pointerEvents: 'none' }} />
      </section>

      {/* ── STATS STRIP ──────────────────────────────────────── */}
      <section style={{
        background: '#fff',
        borderBottom: '1px solid #f3f4f6',
        padding: '40px 24px',
      }}>
        <div style={{
          maxWidth: 960, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 24,
        }}>
          {stats.map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ fontSize: 26, color: '#16a34a', marginBottom: 8, display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#111827', letterSpacing: '-0.5px', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6, fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── MISSION ──────────────────────────────────────────── */}
      <section style={{ padding: '96px 24px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 64, alignItems: 'center' }}>
          <div>
            <span style={{
              display: 'inline-block', background: '#dcfce7', color: '#15803d',
              fontSize: 11, fontWeight: 800, padding: '4px 14px', borderRadius: 20,
              marginBottom: 20, letterSpacing: 1.5, textTransform: 'uppercase',
              border: '1px solid #bbf7d0',
            }}>Our Mission</span>
            <h2 style={{ fontSize: 'clamp(24px,3.5vw,38px)', fontWeight: 900, color: '#111827', margin: '0 0 20px', lineHeight: 1.2, letterSpacing: '-0.8px' }}>
              Technology in the hands of every farmer
            </h2>
            <p style={{ fontSize: 16, color: '#374151', lineHeight: 1.85, marginBottom: 18 }}>
              Agri-Sathi is dedicated to revolutionising agriculture through AI-powered crop recommendations, real-time market prices, smart budget tracking, and community-driven insights — all in one place.
            </p>
            <p style={{ fontSize: 16, color: '#374151', lineHeight: 1.85 }}>
              We believe that modern tools should be accessible to every farmer regardless of their technical background, which is why we built Agri-Sathi to be simple, regional, and reliable.
            </p>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #1a3a1a 100%)',
            borderRadius: 24, padding: 40, textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'radial-gradient(circle, rgba(22,163,74,0.2) 0%, transparent 70%)', borderRadius: '50%' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ animation: 'float 4s ease-in-out infinite' }}>
                <FaLeaf style={{ fontSize: 72, color: '#4ade80', filter: 'drop-shadow(0 4px 16px rgba(74,222,128,0.5))', marginBottom: 20 }} />
              </div>
              <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontStyle: 'italic' }}>
                "Combining <strong style={{ color: '#4ade80' }}>AI, data analytics</strong> and{' '}
                <strong style={{ color: '#60a5fa' }}>community wisdom</strong> to help Indian farmers thrive in every season."
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TIMELINE ─────────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '96px 24px', borderTop: '1px solid #f3f4f6' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span style={{ display: 'inline-block', background: '#fef3c7', color: '#d97706', fontSize: 11, fontWeight: 800, padding: '4px 14px', borderRadius: 20, marginBottom: 16, letterSpacing: 1.5, textTransform: 'uppercase', border: '1px solid #fde68a' }}>Our Journey</span>
            <h2 style={{ fontSize: 'clamp(24px,3.5vw,38px)', fontWeight: 900, color: '#111827', letterSpacing: '-0.8px' }}>From idea to impact</h2>
          </div>
          <div style={{ position: 'relative', paddingLeft: 36 }}>
            <div style={{ position: 'absolute', left: 15, top: 0, bottom: 0, width: 2, background: 'linear-gradient(180deg,#16a34a,#2563eb,#7c3aed,#d97706)' }} />
            {timeline.map((item, i) => (
              <div key={i} style={{ position: 'relative', marginBottom: 48, paddingLeft: 28 }}>
                <div style={{
                  position: 'absolute', left: -21, top: 4,
                  width: 18, height: 18, borderRadius: '50%',
                  background: ['#16a34a','#2563eb','#7c3aed','#d97706'][i],
                  border: '3px solid #fff',
                  boxShadow: `0 0 0 3px ${['#dcfce7','#dbeafe','#ede9fe','#fef3c7'][i]}`,
                }} />
                <div style={{ display: 'inline-block', background: ['#dcfce7','#dbeafe','#ede9fe','#fef3c7'][i], color: ['#15803d','#1d4ed8','#5b21b6','#b45309'][i], fontSize: 11, fontWeight: 800, padding: '3px 12px', borderRadius: 20, marginBottom: 10, letterSpacing: 0.5 }}>
                  {item.year}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: 14.5, color: '#6b7280', lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES ───────────────────────────────────────────── */}
      <section style={{ background: '#fafafa', padding: '96px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span style={{ display: 'inline-block', background: '#eff6ff', color: '#2563eb', fontSize: 11, fontWeight: 800, padding: '4px 14px', borderRadius: 20, marginBottom: 16, letterSpacing: 1.5, textTransform: 'uppercase', border: '1px solid #bfdbfe' }}>What We Stand For</span>
            <h2 style={{ fontSize: 'clamp(24px,3.5vw,38px)', fontWeight: 900, color: '#111827', letterSpacing: '-0.8px' }}>Our Core Values</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 22 }}>
            {values.map((v, i) => (
              <div key={i}
                style={{
                  background: hoveredValue === i ? v.bg : '#fff',
                  border: `1.5px solid ${hoveredValue === i ? v.border : '#f3f4f6'}`,
                  borderRadius: 20, padding: '30px 26px',
                  transition: 'all 0.25s ease',
                  transform: hoveredValue === i ? 'translateY(-6px)' : 'none',
                  boxShadow: hoveredValue === i ? `0 20px 50px ${v.color}18` : '0 2px 8px rgba(0,0,0,0.04)',
                  cursor: 'default',
                }}
                onMouseEnter={() => setHoveredValue(i)}
                onMouseLeave={() => setHoveredValue(null)}
              >
                <div style={{
                  width: 54, height: 54, borderRadius: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `${v.color}18`, marginBottom: 18,
                  fontSize: 24, color: v.color,
                  transition: 'all 0.25s',
                  border: `2px solid ${v.color}25`,
                  transform: hoveredValue === i ? 'scale(1.1)' : 'scale(1)',
                }}>
                  {v.icon}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#111827', margin: '0 0 10px' }}>{v.title}</h3>
                <p style={{ fontSize: 13.5, color: '#6b7280', lineHeight: 1.75, margin: 0 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ─────────────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '96px 24px', borderTop: '1px solid #f3f4f6' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span style={{ display: 'inline-block', background: '#f5f3ff', color: '#7c3aed', fontSize: 11, fontWeight: 800, padding: '4px 14px', borderRadius: 20, marginBottom: 16, letterSpacing: 1.5, textTransform: 'uppercase', border: '1px solid #ddd6fe' }}>The Builders</span>
            <h2 style={{ fontSize: 'clamp(24px,3.5vw,38px)', fontWeight: 900, color: '#111827', margin: '0 0 14px', letterSpacing: '-0.8px' }}>Meet Our Team</h2>
            <p style={{ fontSize: 16, color: '#6b7280', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
              A passionate group of developers and tech enthusiasts on a mission to modernise Indian agriculture.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 22 }}>
            {team.map((member, i) => (
              <div key={i}
                style={{
                  background: '#fff', border: `1.5px solid ${hoveredTeam === i ? member.color + '35' : '#f3f4f6'}`,
                  borderRadius: 22, padding: '36px 24px 28px', textAlign: 'center',
                  transition: 'all 0.25s ease',
                  transform: hoveredTeam === i ? 'translateY(-8px)' : 'none',
                  boxShadow: hoveredTeam === i ? `0 24px 60px ${member.color}20` : '0 2px 8px rgba(0,0,0,0.04)',
                  position: 'relative', overflow: 'hidden',
                }}
                onMouseEnter={() => setHoveredTeam(i)}
                onMouseLeave={() => setHoveredTeam(null)}
              >
                {hoveredTeam === i && (
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: member.bg }} />
                )}

                {/* Avatar */}
                <div style={{
                  width: 88, height: 88, borderRadius: '50%',
                  background: member.bg,
                  border: `3px solid ${member.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: 28, fontWeight: 900, color: member.color,
                  boxShadow: `0 6px 20px ${member.color}25`,
                  transition: 'transform 0.25s',
                  transform: hoveredTeam === i ? 'scale(1.08)' : 'scale(1)',
                }}>
                  {member.initials}
                </div>

                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#111827', margin: '0 0 6px', lineHeight: 1.3 }}>{member.name}</h3>
                <span style={{
                  display: 'inline-block', fontSize: 11.5, fontWeight: 700,
                  color: member.color, background: `${member.color}15`,
                  padding: '4px 12px', borderRadius: 20, marginBottom: 14,
                  border: `1px solid ${member.color}25`,
                }}>
                  {member.role}
                </span>
                <p style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.65, margin: 0 }}>{member.desc}</p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 18 }}>
                  {[FaLinkedin, FaGithub].map((Icon, j) => (
                    <a key={j} href="#" style={{
                      width: 32, height: 32, borderRadius: 9,
                      background: `${member.color}12`, border: `1px solid ${member.color}25`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: member.color, textDecoration: 'none', fontSize: 14,
                      transition: 'background 0.15s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = `${member.color}25`}
                      onMouseLeave={e => e.currentTarget.style.background = `${member.color}12`}
                    >
                      <Icon />
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, #14532d 0%, #15803d 50%, #166534 100%)',
        padding: '80px 24px', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 380, height: 380, background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />
        <div style={{ maxWidth: 600, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ animation: 'float 3s ease-in-out infinite', display: 'inline-block', marginBottom: 20 }}>
            <GiWheat style={{ fontSize: 52, color: '#4ade80', filter: 'drop-shadow(0 4px 12px rgba(74,222,128,0.4))' }} />
          </div>
          <h2 style={{ fontSize: 'clamp(24px,3.5vw,38px)', fontWeight: 900, color: '#fff', margin: '0 0 16px', letterSpacing: '-0.8px', lineHeight: 1.2 }}>
            Join thousands of farmers growing smarter
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.75)', marginBottom: 36, lineHeight: 1.7 }}>
            Start your journey with Agri-Sathi today — free, simple, and built for you.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: 9,
              background: '#fff', color: '#15803d',
              fontWeight: 800, fontSize: 15, padding: '14px 32px',
              borderRadius: 12, textDecoration: 'none',
              boxShadow: '0 8px 28px rgba(0,0,0,0.2)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(0,0,0,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.2)'; }}
            >
              Get Started Free <FaArrowRight style={{ fontSize: 12 }} />
            </a>
            <a href="/" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'transparent', color: '#fff',
              fontWeight: 700, fontSize: 15, padding: '14px 28px',
              borderRadius: 12, textDecoration: 'none',
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
    </div>
  );
};

export default About;