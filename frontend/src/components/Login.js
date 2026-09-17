import React, { useState } from 'react';
import { FaLeaf, FaUser, FaBuilding, FaEye, FaEyeSlash, FaEnvelope, FaLock, FaCheck, FaChartLine, FaArrowRight, FaShieldAlt } from 'react-icons/fa';
import { GiPitchfork, GiFarmTractor } from 'react-icons/gi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

/* ── Shared input styles ─────────────────────────────────── */
const inputBase = {
  width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10,
  padding: '12px 14px', fontSize: 14, color: '#111827',
  background: '#fff', outline: 'none', boxSizing: 'border-box',
  fontFamily: 'inherit', transition: 'border-color 0.2s, box-shadow 0.2s',
};
const inputWithIcon = { ...inputBase, paddingLeft: 44 };
const labelStyle = { fontSize: 12.5, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6, letterSpacing: '0.2px' };

const focusStyle = (e) => {
  e.target.style.borderColor = '#16a34a';
  e.target.style.boxShadow = '0 0 0 3px rgba(22,163,74,0.12)';
};
const blurStyle = (e) => {
  e.target.style.borderColor = '#e5e7eb';
  e.target.style.boxShadow = 'none';
};

const Login = () => {
  const [userType, setUserType] = useState('farmer');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const [showRegister, setShowRegister] = React.useState(false);
  const [registerData, setRegisterData] = React.useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [agroRegisterData, setAgroRegisterData] = React.useState({
    agroName: '', ownerName: '', email: '', phone: '', password: '', confirmPassword: '',
    city: '', address: '', location: '', agroType: 'Supplier', services: [],
    gstNumber: '', socialLinks: '', workingHours: '',
  });
  const [agroLogo, setAgroLogo] = React.useState(null);
  const [agroIdProof, setAgroIdProof] = React.useState(null);
  const [agroLogoPreview, setAgroLogoPreview] = React.useState(null);
  const [agroIdPreview, setAgroIdPreview] = React.useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleRegisterInputChange = (e) => setRegisterData({ ...registerData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccessMessage('');
    if (!formData.email || !formData.password) return;
    setLoading(true);
    try {
      const res = await axios.post('/api/user/auth/login', { email: formData.email, password: formData.password });
      if (res.data?.role === 'farmer') {
        const data = res.data;
        localStorage.setItem('userName', data.name);
        localStorage.setItem('userEmail', data.email);
        localStorage.setItem('role', 'farmer');
        const isFirstLogin = localStorage.getItem('isFirstLogin') === null;
        if (isFirstLogin) {
          localStorage.setItem('isFirstLogin', 'true');
          setSuccessMessage('Welcome! Setting up your dashboard...');
          setTimeout(() => navigate('/farmer-dashboard'), 1200);
        } else {
          navigate('/farmer-dashboard');
        }
      } else if (res.data?.role === 'agro') {
        const data = res.data;
        localStorage.setItem('role', 'agro');
        localStorage.setItem('agroId', data._id);
        localStorage.setItem('agroName', data.agroName);
        localStorage.setItem('agroEmail', data.email);
        setSuccessMessage('Logged in! Redirecting...');
        setTimeout(() => navigate('/agro-dashboard'), 800);
      } else {
        setError('Unexpected response from server.');
      }
    } catch (err) {
      if (err.response?.status === 404) setError('No account found with this email.');
      else if (err.response?.status === 401) setError('Incorrect password. Please try again.');
      else setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); setSuccessMessage('');
    if (userType === 'farmer') {
      if (!registerData.name || !registerData.email || !registerData.password) { setError('Please fill in all required fields.'); return; }
      if (registerData.password !== registerData.confirmPassword) { setError('Passwords do not match.'); return; }
      setLoading(true);
      try {
        await axios.post('/api/user/register', { name: registerData.name, email: registerData.email, password: registerData.password, userType: 'farmer' });
        localStorage.setItem('userName', registerData.name);
        localStorage.setItem('userEmail', registerData.email);
        localStorage.setItem('isFirstLogin', 'true');
        setShowRegister(false);
        setError('');
        setFormData({ email: registerData.email, password: registerData.password });
        setUserType('farmer');
        setSuccessMessage('Account created successfully! You can now log in.');
      } catch (err) {
        setError(err.response?.data?.message || 'Registration failed');
      } finally { setLoading(false); }
    } else if (userType === 'agro-business') {
      if (!agroRegisterData.password || agroRegisterData.password !== agroRegisterData.confirmPassword) { setError('Passwords do not match'); return; }
      setLoading(true);
      try {
        const fd = new FormData();
        Object.entries({
          agroName: agroRegisterData.agroName, ownerName: agroRegisterData.ownerName,
          email: agroRegisterData.email, phone: agroRegisterData.phone,
          password: agroRegisterData.password, city: agroRegisterData.city,
          address: agroRegisterData.address, location: agroRegisterData.location,
          agroType: agroRegisterData.agroType, services: agroRegisterData.services.join(','),
          gstNumber: agroRegisterData.gstNumber, socialLinks: agroRegisterData.socialLinks,
          workingHours: agroRegisterData.workingHours ? JSON.stringify({ range: agroRegisterData.workingHours }) : ''
        }).forEach(([k, v]) => fd.append(k, v));
        if (agroLogo) fd.append('logo', agroLogo);
        if (agroIdProof) fd.append('idProof', agroIdProof);
        await axios.post('/api/user/agro/register', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        setShowRegister(false);
        setSuccessMessage('Business account created! You can now log in.');
      } catch (err) {
        setError(err.response?.data?.message || 'Agro registration failed');
      } finally { setLoading(false); }
    }
  };

  const passwordStrength = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };
  const strengthLabel = (s) => ['', 'Weak', 'Fair', 'Good', 'Strong'][s] || '';
  const strengthColor = (s) => ['', '#dc2626', '#d97706', '#2563eb', '#16a34a'][s] || '#e5e7eb';

  const PwStrength = ({ pwd }) => {
    const s = passwordStrength(pwd);
    if (!pwd) return null;
    return (
      <div style={{ marginTop: 6 }}>
        <div style={{ display: 'flex', gap: 3 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i <= s ? strengthColor(s) : '#e5e7eb', transition: 'background 0.25s' }} />
          ))}
        </div>
        <div style={{ fontSize: 11, color: strengthColor(s), marginTop: 4, fontWeight: 700 }}>{strengthLabel(s)} password</div>
      </div>
    );
  };

  const AlertBox = ({ type, msg }) => !msg ? null : (
    <div style={{
      background: type === 'error' ? '#fef2f2' : '#f0fdf4',
      border: `1px solid ${type === 'error' ? '#fecaca' : '#bbf7d0'}`,
      color: type === 'error' ? '#b91c1c' : '#15803d',
      borderRadius: 10, padding: '11px 15px', fontSize: 13.5,
      fontWeight: 600, marginBottom: 20,
      display: 'flex', alignItems: 'center', gap: 9,
      animation: 'fadeIn 0.25s ease',
    }}>
      {type === 'error' ? '⚠️' : '✓'} {msg}
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #eff6ff 50%, #fefce8 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '32px 16px', fontFamily: "'Inter', sans-serif",
    }}>
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .login-card { animation: slideUp 0.4s ease; }
      `}</style>

      {/* ── MAIN CARD ─────────────────────────────────────────── */}
      <div className="login-card" style={{
        width: '100%', maxWidth: 1000,
        display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 24,
        boxShadow: '0 32px 80px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)',
        overflow: 'hidden',
      }}>

        {/* LEFT — Form ──────────────────────────────────────── */}
        <div style={{ padding: '48px 44px 44px' }}>
          {/* Logo */}
          <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 36, textDecoration: 'none' }}>
            <div style={{
              background: 'linear-gradient(135deg,#16a34a,#15803d)',
              borderRadius: 11, width: 38, height: 38,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(22,163,74,0.35)',
            }}>
              <FaLeaf style={{ color: '#fff', fontSize: 17 }} />
            </div>
            <span style={{ fontWeight: 900, fontSize: 20, color: '#111827', letterSpacing: '-0.5px' }}>AgriBudget</span>
          </a>

          <h2 style={{ fontSize: 26, fontWeight: 900, color: '#111827', marginBottom: 6, letterSpacing: '-0.5px' }}>
            Welcome back 👋
          </h2>
          <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 28, fontWeight: 500 }}>
            Sign in to continue to your dashboard
          </p>

          {/* User Type Toggle */}
          <div style={{ marginBottom: 26 }}>
            <label style={labelStyle}>I am a:</label>
            <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 12, padding: 5, gap: 4 }}>
              {[
                { id: 'farmer', icon: <GiFarmTractor style={{ fontSize: 14 }} />, label: 'Farmer' },
                { id: 'agro-business', icon: <FaBuilding style={{ fontSize: 13 }} />, label: 'Agro-Business' },
              ].map(t => (
                <button key={t.id} type="button" onClick={() => setUserType(t.id)} style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  padding: '10px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 700,
                  background: userType === t.id ? '#fff' : 'transparent',
                  color: userType === t.id ? '#16a34a' : '#6b7280',
                  boxShadow: userType === t.id ? '0 2px 8px rgba(0,0,0,0.10)' : 'none',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                }}>
                  <span style={{ color: userType === t.id ? '#16a34a' : '#9ca3af', transition: 'color 0.2s' }}>{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <AlertBox type="error" msg={error} />
            <AlertBox type="success" msg={successMessage} />

            <div style={{ marginBottom: 18 }}>
              <label htmlFor="login-email" style={labelStyle}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <FaEnvelope style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 14 }} />
                <input
                  id="login-email" name="email" type="email" required
                  value={formData.email} onChange={handleInputChange}
                  style={inputWithIcon} placeholder="your@email.com"
                  aria-label="Email address"
                  onFocus={focusStyle} onBlur={blurStyle}
                />
              </div>
            </div>

            <div style={{ marginBottom: 8 }}>
              <label htmlFor="login-password" style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <FaLock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 14 }} />
                <input
                  id="login-password" name="password"
                  type={showPassword ? 'text' : 'password'} required
                  value={formData.password} onChange={handleInputChange}
                  style={{ ...inputWithIcon, paddingRight: 46 }}
                  placeholder="Enter your password"
                  aria-label="Password"
                  onFocus={focusStyle} onBlur={blurStyle}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <FaEyeSlash style={{ fontSize: 15 }} /> : <FaEye style={{ fontSize: 15 }} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
              <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#16a34a', fontWeight: 600, padding: 0, fontFamily: 'inherit' }}
                onClick={() => setShowForgot(true)}>
                Forgot password?
              </button>
            </div>

            <button type="submit" id="login-submit" disabled={loading} style={{
              width: '100%',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #16a34a, #15803d)',
              color: '#fff', padding: '13px 0', borderRadius: 11, border: 'none',
              fontSize: 15, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.2s, transform 0.2s', marginBottom: 18, fontFamily: 'inherit',
              boxShadow: loading ? 'none' : '0 6px 20px rgba(22,163,74,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              letterSpacing: '0.2px',
            }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.opacity = '0.92'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none'; }}
            >
              {loading ? '⏳ Signing in...' : <>Sign In <FaArrowRight style={{ fontSize: 12 }} /></>}
            </button>
          </form>

          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 13.5, color: '#9ca3af' }}>Don't have an account? </span>
            <a href="#register" style={{ fontSize: 13.5, color: '#16a34a', fontWeight: 700, textDecoration: 'none' }}
              onClick={e => { e.preventDefault(); setShowRegister(true); }}>
              Create one free →
            </a>
          </div>
        </div>

        {/* RIGHT — Visual Panel ─────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(155deg, #0f172a 0%, #1a2d1a 50%, #14532d 100%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '48px 36px', gap: 32, position: 'relative', overflow: 'hidden',
        }}>
          {/* Background orbs */}
          <div style={{ position: 'absolute', top: -60, right: -60, width: 260, height: 260, background: 'radial-gradient(circle, rgba(22,163,74,0.25) 0%, transparent 70%)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: -80, left: -60, width: 300, height: 300, background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', top: '45%', left: '30%', width: 180, height: 180, background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />

          <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, width: '100%' }}>
            {/* Icon pair */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 28 }}>
              {[
                { bg: 'rgba(22,163,74,0.18)', border: 'rgba(22,163,74,0.3)', icon: <GiFarmTractor style={{ color: '#4ade80', fontSize: 28 }} />, badge: <GiPitchfork style={{ color: '#fff', fontSize: 11 }} />, badgeBg: '#16a34a' },
                { bg: 'rgba(37,99,235,0.15)', border: 'rgba(37,99,235,0.25)', icon: <FaBuilding style={{ color: '#60a5fa', fontSize: 26 }} />, badge: <FaChartLine style={{ color: '#fff', fontSize: 10 }} />, badgeBg: '#2563eb' },
              ].map((item, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <div style={{
                    background: item.bg, border: `1.5px solid ${item.border}`,
                    borderRadius: 18, width: 76, height: 76,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  }}>
                    {item.icon}
                  </div>
                  <div style={{
                    position: 'absolute', bottom: -8, right: -8,
                    background: item.badgeBg, borderRadius: 9,
                    width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 3px 10px rgba(0,0,0,0.3)',
                    border: '2px solid rgba(255,255,255,0.15)',
                  }}>
                    {item.badge}
                  </div>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 10, letterSpacing: '-0.5px' }}>AgriBudget</h3>
            <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, maxWidth: 260, margin: '0 auto 28px' }}>
              AI-powered agricultural finance platform for modern farmers and agro-businesses.
            </p>

            {/* Feature checklist */}
            <div style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14, padding: '20px 22px',
              textAlign: 'left',
              backdropFilter: 'blur(10px)',
            }}>
              {[
                ['💰', 'Track income & expenses'],
                ['🤖', 'AI crop recommendations'],
                ['🔬', 'Disease detection'],
                ['🔔', 'Smart budget alerts'],
                ['🛒', 'Marketplace access'],
                ['🌤️', 'Weather & market data'],
              ].map(([emoji, item], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: i < 5 ? 12 : 0 }}>
                  <span style={{ fontSize: 15 }}>{emoji}</span>
                  <div style={{ width: 18, height: 18, background: 'rgba(22,163,74,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FaCheck style={{ color: '#4ade80', fontSize: 8, fontWeight: 700 }} />
                  </div>
                  {item}
                </div>
              ))}
            </div>

            <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
              <FaShieldAlt style={{ color: '#4ade80', fontSize: 13 }} />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Bank-grade security · End-to-end encrypted</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══ REGISTRATION MODAL ══════════════════════════════════ */}
      {showRegister && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{
            background: '#fff', borderRadius: 22,
            boxShadow: '0 32px 80px rgba(0,0,0,0.2)',
            width: '100%', maxWidth: 800, maxHeight: '90vh', overflowY: 'auto',
            position: 'relative', animation: 'slideUp 0.3s ease',
          }}>
            <div style={{ padding: '26px 32px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#fff', zIndex: 1, borderRadius: '22px 22px 0 0' }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: '#111827', letterSpacing: '-0.4px' }}>
                  {userType === 'agro-business' ? '🏭 Create Agro-Business Account' : '🌱 Create Farmer Account'}
                </h2>
                <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 3 }}>
                  {userType === 'agro-business' ? 'Register your agricultural business' : 'Start your farming journey — it\'s free'}
                </p>
              </div>
              <button onClick={() => setShowRegister(false)} aria-label="Close"
                style={{ background: '#f3f4f6', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 20, color: '#6b7280', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#e5e7eb'}
                onMouseLeave={e => e.currentTarget.style.background = '#f3f4f6'}
              >×</button>
            </div>

            <div style={{ padding: '24px 32px 36px' }}>
              <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 12, padding: 5, gap: 4, marginBottom: 26 }}>
                {[{ id: 'farmer', label: '🌾 Farmer' }, { id: 'agro-business', label: '🏭 Agro-Business' }].map(t => (
                  <button key={t.id} type="button" onClick={() => setUserType(t.id)} style={{
                    flex: 1, padding: '10px 14px', borderRadius: 9, border: 'none', cursor: 'pointer',
                    fontSize: 13, fontWeight: 700,
                    background: userType === t.id ? '#fff' : 'transparent',
                    color: userType === t.id ? '#16a34a' : '#6b7280',
                    boxShadow: userType === t.id ? '0 2px 8px rgba(0,0,0,0.10)' : 'none',
                    transition: 'all 0.2s', fontFamily: 'inherit',
                  }}>{t.label}</button>
                ))}
              </div>

              <AlertBox type="error" msg={error} />
              <AlertBox type="success" msg={successMessage} />

              {userType === 'agro-business' ? (
                <form onSubmit={handleRegister} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px 20px' }}>
                  {[
                    { label: 'Business Name *', type: 'text', val: agroRegisterData.agroName, key: 'agroName', req: true, ph: 'Your business name' },
                    { label: 'Owner Name *', type: 'text', val: agroRegisterData.ownerName, key: 'ownerName', req: true, ph: 'Owner full name' },
                    { label: 'Email *', type: 'email', val: agroRegisterData.email, key: 'email', req: true, ph: 'business@email.com' },
                    { label: 'Phone / WhatsApp *', type: 'tel', val: agroRegisterData.phone, key: 'phone', req: true, ph: '+91 xxxxx xxxxx' },
                    { label: 'Password *', type: 'password', val: agroRegisterData.password, key: 'password', req: true, ph: 'Create a strong password' },
                    { label: 'Confirm Password *', type: 'password', val: agroRegisterData.confirmPassword, key: 'confirmPassword', req: true, ph: 'Repeat password' },
                    { label: 'City *', type: 'text', val: agroRegisterData.city, key: 'city', req: true, ph: 'e.g. Ahmedabad' },
                    { label: 'Location (link/coords)', type: 'text', val: agroRegisterData.location, key: 'location', req: false, ph: 'Google Maps link or coordinates' },
                    { label: 'GST / License Number *', type: 'text', val: agroRegisterData.gstNumber, key: 'gstNumber', req: true, ph: 'GST number' },
                    { label: 'Website / Social Links', type: 'text', val: agroRegisterData.socialLinks, key: 'socialLinks', req: false, ph: 'https://...' },
                    { label: 'Working Hours', type: 'text', val: agroRegisterData.workingHours, key: 'workingHours', req: false, ph: 'e.g. 09:00-18:00' },
                  ].map(field => (
                    <div key={field.key}>
                      <label style={labelStyle}>{field.label}</label>
                      <input type={field.type} value={field.val} required={field.req} placeholder={field.ph}
                        onChange={e => setAgroRegisterData({ ...agroRegisterData, [field.key]: e.target.value })}
                        style={inputBase} onFocus={focusStyle} onBlur={blurStyle}
                      />
                      {field.key === 'password' && <PwStrength pwd={agroRegisterData.password} />}
                    </div>
                  ))}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Address *</label>
                    <input type="text" value={agroRegisterData.address} required placeholder="Full business address"
                      onChange={e => setAgroRegisterData({ ...agroRegisterData, address: e.target.value })}
                      style={inputBase} onFocus={focusStyle} onBlur={blurStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Agro Type</label>
                    <select value={agroRegisterData.agroType} onChange={e => setAgroRegisterData({ ...agroRegisterData, agroType: e.target.value })} style={inputBase}>
                      {['Supplier', 'Buyer', 'Machinery Provider', 'NGO', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Services Offered</label>
                    <input type="text" value={agroRegisterData.services.join(',')} placeholder="e.g. Seeds, Fertilizers"
                      onChange={e => setAgroRegisterData({ ...agroRegisterData, services: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                      style={inputBase} onFocus={focusStyle} onBlur={blurStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Profile Logo</label>
                    <input type="file" accept="image/*" style={{ ...inputBase, padding: '8px 14px', cursor: 'pointer' }}
                      onChange={e => { const f = e.target.files?.[0]; setAgroLogo(f); setAgroLogoPreview(f ? URL.createObjectURL(f) : null); }} />
                    {agroLogoPreview && <img src={agroLogoPreview} alt="logo" style={{ marginTop: 8, width: 52, height: 52, objectFit: 'cover', borderRadius: 10, border: '2px solid #dcfce7' }} />}
                  </div>
                  <div>
                    <label style={labelStyle}>ID Proof (optional)</label>
                    <input type="file" accept="image/*,.pdf" style={{ ...inputBase, padding: '8px 14px', cursor: 'pointer' }}
                      onChange={e => { const f = e.target.files?.[0]; setAgroIdProof(f); setAgroIdPreview(f ? URL.createObjectURL(f) : null); }} />
                    {agroIdPreview && <div style={{ fontSize: 12, color: '#16a34a', marginTop: 6, fontWeight: 700 }}>✓ File selected</div>}
                  </div>
                  <div style={{ gridColumn: '1 / -1', paddingTop: 8 }}>
                    <button type="submit" disabled={loading} style={{ width: '100%', background: loading ? '#9ca3af' : 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff', padding: '13px 0', borderRadius: 11, border: 'none', fontSize: 15, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(22,163,74,0.3)' }}>
                      {loading ? '⏳ Creating account...' : 'Create Business Account →'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 460 }}>
                  {[
                    { label: 'Full Name *', type: 'text', name: 'name', val: registerData.name, ph: 'Your full name' },
                    { label: 'Email Address *', type: 'email', name: 'email', val: registerData.email, ph: 'your@email.com' },
                    { label: 'Password *', type: 'password', name: 'password', val: registerData.password, ph: 'Create a strong password' },
                    { label: 'Confirm Password *', type: 'password', name: 'confirmPassword', val: registerData.confirmPassword, ph: 'Repeat your password' },
                  ].map(f => (
                    <div key={f.name}>
                      <label style={labelStyle}>{f.label}</label>
                      <input type={f.type} name={f.name} value={f.val} onChange={handleRegisterInputChange} placeholder={f.ph} required style={inputBase}
                        onFocus={focusStyle} onBlur={blurStyle}
                      />
                      {f.name === 'password' && <PwStrength pwd={registerData.password} />}
                    </div>
                  ))}
                  <button type="submit" disabled={loading} style={{ background: loading ? '#9ca3af' : 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff', padding: '13px 0', borderRadius: 11, border: 'none', fontSize: 15, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4, fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(22,163,74,0.3)' }}>
                    {loading ? '⏳ Creating account...' : 'Create Free Account →'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══ FORGOT PASSWORD MODAL ═══════════════════════════════ */}
      {showForgot && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 32px 80px rgba(0,0,0,0.2)', width: '100%', maxWidth: 460, animation: 'slideUp 0.3s ease' }}>
            <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: 19, fontWeight: 900, color: '#111827', letterSpacing: '-0.3px' }}>🔒 Reset Password</h3>
                <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 3 }}>Enter your email to receive a reset token</p>
              </div>
              <button onClick={() => setShowForgot(false)} aria-label="Close"
                style={{ background: '#f3f4f6', border: 'none', borderRadius: 9, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 20, color: '#6b7280' }}>×</button>
            </div>
            <div style={{ padding: '24px 28px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <AlertBox type="error" msg={error} />
              <AlertBox type="success" msg={successMessage} />
              <div>
                <label style={labelStyle}>Registered Email</label>
                <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} style={inputBase} placeholder="you@example.com" onFocus={focusStyle} onBlur={blurStyle} />
              </div>
              <button onClick={async () => {
                try { setError(''); setSuccessMessage(''); const res = await axios.post('/api/user/agro/forgot', { email: forgotEmail }); setSuccessMessage('Reset token sent to your email.'); setResetToken(res.data.token); } catch (err) { setError(err.response?.data?.message || 'Failed to send reset token'); }
              }} style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff', padding: '12px 0', borderRadius: 10, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 3px 12px rgba(22,163,74,0.3)' }}>
                Send Reset Token
              </button>
              {resetToken && <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#6b7280', wordBreak: 'break-all', fontFamily: 'monospace' }}>Token: {resetToken}</div>}
              <div>
                <label style={labelStyle}>New Password</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={inputBase} onFocus={focusStyle} onBlur={blurStyle} />
              </div>
              <div>
                <label style={labelStyle}>Confirm New Password</label>
                <input type="password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} style={inputBase} onFocus={focusStyle} onBlur={blurStyle} />
              </div>
              <button onClick={async () => {
                if (!resetToken) { setError('Reset token required'); return; }
                if (!newPassword || newPassword !== confirmNewPassword) { setError('Passwords do not match'); return; }
                try { setError(''); await axios.post('/api/user/agro/reset', { token: resetToken, password: newPassword }); setSuccessMessage('Password updated successfully!'); setShowForgot(false); setResetToken(''); setNewPassword(''); setConfirmNewPassword(''); } catch (err) { setError(err.response?.data?.message || 'Reset failed'); }
              }} style={{ background: 'linear-gradient(135deg,#d97706,#b45309)', color: '#fff', padding: '12px 0', borderRadius: 10, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;