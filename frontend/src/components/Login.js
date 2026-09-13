import React, { useState } from 'react';
import { FaLeaf, FaUser, FaBuilding, FaEye, FaEyeSlash, FaEnvelope, FaLock, FaCheck, FaChartLine, FaSeedling } from 'react-icons/fa';
import { GiPitchfork, GiFarmTractor } from 'react-icons/gi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
  const [isNewUser, setIsNewUser] = useState(false);
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
          setSuccessMessage('Welcome! Please update your profile information for a better experience.');
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
        setSuccessMessage('Logged in successfully. Redirecting...');
        setTimeout(() => navigate('/agro-dashboard'), 800);
      } else {
        setError('Unexpected response');
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
        setSuccessMessage('Account created successfully! You can now log in.');
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

  const inputStyle = {
    width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 9,
    padding: '11px 14px', fontSize: 14, color: '#111827',
    background: '#fff', outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit', transition: 'border-color 0.15s, box-shadow 0.15s',
  };
  const inputWithIconStyle = { ...inputStyle, paddingLeft: 42 };
  const labelStyle = { fontSize: 12.5, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>

      {/* ── MAIN CARD ─────────────────────────────────────── */}
      <div style={{
        width: '100%', maxWidth: 980,
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20,
        boxShadow: '0 20px 60px rgba(0,0,0,0.10)', overflow: 'hidden',
      }}>

        {/* LEFT: Form */}
        <div style={{ padding: '44px 40px 40px' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <div style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 10px rgba(22,163,74,0.3)' }}>
              <FaLeaf style={{ color: '#fff', fontSize: 16 }} />
            </div>
            <span style={{ fontWeight: 800, fontSize: 20, color: '#111827', letterSpacing: '-0.4px' }}>AgriBudget</span>
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 4, letterSpacing: '-0.4px' }}>
            Welcome back 👋
          </h2>
          <p style={{ fontSize: 13.5, color: '#9ca3af', marginBottom: 28 }}>
            Sign in to your account to continue
          </p>

          {/* User Type Toggle */}
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>I am a:</label>
            <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 10, padding: 4, gap: 4 }}>
              {[
                { id: 'farmer', icon: <GiFarmTractor style={{ fontSize: 14, color: userType === 'farmer' ? '#16a34a' : '#9ca3af' }} />, label: 'Farmer' },
                { id: 'agro-business', icon: <FaBuilding style={{ fontSize: 13, color: userType === 'agro-business' ? '#16a34a' : '#9ca3af' }} />, label: 'Agro-Business' },
              ].map(t => (
                <button key={t.id} type="button" onClick={() => setUserType(t.id)} style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  padding: '9px 14px', borderRadius: 7, border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 600,
                  background: userType === t.id ? '#fff' : 'transparent',
                  color: userType === t.id ? '#16a34a' : '#6b7280',
                  boxShadow: userType === t.id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s',
                }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 9, padding: '10px 14px', fontSize: 13, fontWeight: 600, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                ⚠️ {error}
              </div>
            )}
            {successMessage && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', borderRadius: 9, padding: '10px 14px', fontSize: 13, fontWeight: 600, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }} className="animate-fade-in-scale">
                ✓ {successMessage}
              </div>
            )}

            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="email" style={labelStyle}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <FaEnvelope style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 14 }} />
                <input
                  id="email" name="email" type="text" required
                  value={formData.email} onChange={handleInputChange}
                  style={inputWithIconStyle} placeholder="Enter your email"
                  aria-label="Email address"
                  onFocus={e => { e.target.style.borderColor = '#16a34a'; e.target.style.boxShadow = '0 0 0 3px rgba(22,163,74,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 22 }}>
              <label htmlFor="password" style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <FaLock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 14 }} />
                <input
                  id="password" name="password"
                  type={showPassword ? 'text' : 'password'} required
                  value={formData.password} onChange={handleInputChange}
                  style={{ ...inputWithIconStyle, paddingRight: 44 }}
                  placeholder="Enter your password"
                  aria-label="Password"
                  onFocus={e => { e.target.style.borderColor = '#16a34a'; e.target.style.boxShadow = '0 0 0 3px rgba(22,163,74,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <FaEyeSlash style={{ fontSize: 15 }} /> : <FaEye style={{ fontSize: 15 }} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', background: loading ? '#9ca3af' : 'linear-gradient(135deg, #16a34a, #15803d)',
              color: '#fff', padding: '12px 0', borderRadius: 9, border: 'none',
              fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.15s', marginBottom: 18, fontFamily: 'inherit',
              boxShadow: loading ? 'none' : '0 4px 14px rgba(22,163,74,0.3)',
            }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.9'; }}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              {loading ? '⏳ Signing in...' : 'Sign In →'}
            </button>
          </form>

          {/* Links */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#6b7280', fontWeight: 500, padding: 0, fontFamily: 'inherit' }}
              onClick={() => setShowForgot(true)}>
              Forgot password?
            </button>
            <a href="#register" style={{ fontSize: 13, color: '#16a34a', fontWeight: 600, textDecoration: 'none' }}
              onClick={e => { e.preventDefault(); setShowRegister(true); }}>
              Create account →
            </a>
          </div>
        </div>

        {/* RIGHT: Visual Panel */}
        <div className="hidden lg:flex" style={{
          background: 'linear-gradient(160deg, #15803d 0%, #166534 60%, #14532d 100%)',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '40px 36px', gap: 32, position: 'relative', overflow: 'hidden',
        }}>
          {/* Background decoration */}
          <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: -60, left: -40, width: 220, height: 220, background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />

          <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            {/* Icons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 28 }}>
              <div style={{ position: 'relative' }}>
                <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 16, width: 74, height: 74, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.2)' }}>
                  <FaUser style={{ color: '#fff', fontSize: 32 }} />
                </div>
                <div style={{ position: 'absolute', bottom: -7, right: -7, background: '#d97706', borderRadius: 9, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GiPitchfork style={{ color: '#fff', fontSize: 12 }} />
                </div>
              </div>
              <div style={{ position: 'relative' }}>
                <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 16, width: 74, height: 74, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.15)' }}>
                  <FaBuilding style={{ color: '#fff', fontSize: 30 }} />
                </div>
                <div style={{ position: 'absolute', bottom: -7, right: -7, background: '#2563eb', borderRadius: 9, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaChartLine style={{ color: '#fff', fontSize: 11 }} />
                </div>
              </div>
            </div>

            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 10, letterSpacing: '-0.3px' }}>AgriBudget</h3>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.65, maxWidth: 260, margin: '0 auto 28px' }}>
              AI-powered agricultural finance and decision platform for modern farmers.
            </p>

            {/* Feature checklist */}
            <div style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, padding: '18px 20px', textAlign: 'left' }}>
              {[
                'Track income & expenses',
                'AI crop recommendations',
                'Disease detection',
                'Smart budget alerts',
                'Marketplace access',
                'Weather & market data',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: i < 5 ? 10 : 0 }}>
                  <div style={{ width: 20, height: 20, background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FaCheck style={{ color: '#fff', fontSize: 9 }} />
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ REGISTRATION MODAL ═══════════════════════════════ */}
      {showRegister && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 18, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', width: '100%', maxWidth: 780, maxHeight: '90vh', overflowY: 'auto', position: 'relative' }} className="animate-fade-in-scale">
            <div style={{ padding: '26px 32px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', letterSpacing: '-0.3px' }}>
                  {userType === 'agro-business' ? '🏭 Create Agro-Business Account' : '🌱 Create Farmer Account'}
                </h2>
                <p style={{ fontSize: 12.5, color: '#9ca3af', marginTop: 3 }}>
                  {userType === 'agro-business' ? 'Register your agricultural business' : 'Register as a farmer'}
                </p>
              </div>
              <button onClick={() => setShowRegister(false)} aria-label="Close"
                style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 18, color: '#6b7280' }}>×</button>
            </div>

            <div style={{ padding: '24px 32px 32px' }}>
              {/* User type toggle inside register */}
              <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 10, padding: 4, gap: 4, marginBottom: 24 }}>
                {[
                  { id: 'farmer', label: '🌾 Farmer' },
                  { id: 'agro-business', label: '🏭 Agro-Business' },
                ].map(t => (
                  <button key={t.id} type="button" onClick={() => setUserType(t.id)} style={{
                    flex: 1, padding: '9px 14px', borderRadius: 7, border: 'none', cursor: 'pointer',
                    fontSize: 13, fontWeight: 600,
                    background: userType === t.id ? '#fff' : 'transparent',
                    color: userType === t.id ? '#16a34a' : '#6b7280',
                    boxShadow: userType === t.id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s', fontFamily: 'inherit',
                  }}>{t.label}</button>
                ))}
              </div>

              {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 9, padding: '10px 14px', fontSize: 13, fontWeight: 600, marginBottom: 18 }}>⚠️ {error}</div>}
              {successMessage && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', borderRadius: 9, padding: '10px 14px', fontSize: 13, fontWeight: 600, marginBottom: 18 }}>✓ {successMessage}</div>}

              {userType === 'agro-business' ? (
                <form onSubmit={handleRegister} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px 20px' }}>
                  {[
                    { label: 'Business Name *', type: 'text', val: agroRegisterData.agroName, key: 'agroName', req: true },
                    { label: 'Owner Name *', type: 'text', val: agroRegisterData.ownerName, key: 'ownerName', req: true },
                    { label: 'Email *', type: 'email', val: agroRegisterData.email, key: 'email', req: true },
                    { label: 'Phone / WhatsApp *', type: 'tel', val: agroRegisterData.phone, key: 'phone', req: true },
                    { label: 'Password *', type: 'password', val: agroRegisterData.password, key: 'password', req: true },
                    { label: 'Confirm Password *', type: 'password', val: agroRegisterData.confirmPassword, key: 'confirmPassword', req: true },
                    { label: 'City *', type: 'text', val: agroRegisterData.city, key: 'city', req: true },
                    { label: 'Location (link/coords)', type: 'text', val: agroRegisterData.location, key: 'location', req: false },
                    { label: 'GST / License Number *', type: 'text', val: agroRegisterData.gstNumber, key: 'gstNumber', req: true },
                    { label: 'Website / Social Links', type: 'text', val: agroRegisterData.socialLinks, key: 'socialLinks', req: false },
                    { label: 'Working Hours (e.g. 09:00-18:00)', type: 'text', val: agroRegisterData.workingHours, key: 'workingHours', req: false },
                  ].map(field => (
                    <div key={field.key}>
                      <label style={labelStyle}>{field.label}</label>
                      <input type={field.type} value={field.val} required={field.req}
                        onChange={e => setAgroRegisterData({ ...agroRegisterData, [field.key]: e.target.value })}
                        style={inputStyle}
                        onFocus={e => { e.target.style.borderColor = '#16a34a'; e.target.style.boxShadow = '0 0 0 3px rgba(22,163,74,0.12)'; }}
                        onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                      />
                      {field.key === 'password' && agroRegisterData.password && (
                        <>
                          <div style={{ height: 4, background: '#e5e7eb', borderRadius: 99, marginTop: 6 }}>
                            <div style={{ height: 4, borderRadius: 99, background: strengthColor(passwordStrength(agroRegisterData.password)), width: `${(passwordStrength(agroRegisterData.password) / 4) * 100}%`, transition: 'width 0.2s' }} />
                          </div>
                          <div style={{ fontSize: 10.5, color: strengthColor(passwordStrength(agroRegisterData.password)), marginTop: 3, fontWeight: 600 }}>
                            {strengthLabel(passwordStrength(agroRegisterData.password))} password
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Address *</label>
                    <input type="text" value={agroRegisterData.address} required onChange={e => setAgroRegisterData({ ...agroRegisterData, address: e.target.value })} style={inputStyle}
                      onFocus={e => { e.target.style.borderColor = '#16a34a'; e.target.style.boxShadow = '0 0 0 3px rgba(22,163,74,0.12)'; }}
                      onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Agro Type</label>
                    <select value={agroRegisterData.agroType} onChange={e => setAgroRegisterData({ ...agroRegisterData, agroType: e.target.value })} style={inputStyle}>
                      {['Supplier', 'Buyer', 'Machinery Provider', 'NGO', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Services Offered (comma separated)</label>
                    <input type="text" value={agroRegisterData.services.join(',')} onChange={e => setAgroRegisterData({ ...agroRegisterData, services: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} style={inputStyle} placeholder="e.g. Seeds, Fertilizers" />
                  </div>
                  <div>
                    <label style={labelStyle}>Profile Logo</label>
                    <input type="file" accept="image/*" style={{ ...inputStyle, padding: '8px 14px', cursor: 'pointer' }} onChange={e => { const f = e.target.files?.[0]; setAgroLogo(f); setAgroLogoPreview(f ? URL.createObjectURL(f) : null); }} />
                    {agroLogoPreview && <img src={agroLogoPreview} alt="logo preview" style={{ marginTop: 8, width: 52, height: 52, objectFit: 'cover', borderRadius: 8, border: '2px solid #dcfce7' }} />}
                  </div>
                  <div>
                    <label style={labelStyle}>ID Proof (optional)</label>
                    <input type="file" accept="image/*,.pdf" style={{ ...inputStyle, padding: '8px 14px', cursor: 'pointer' }} onChange={e => { const f = e.target.files?.[0]; setAgroIdProof(f); setAgroIdPreview(f ? URL.createObjectURL(f) : null); }} />
                    {agroIdPreview && <div style={{ fontSize: 12, color: '#16a34a', marginTop: 6, fontWeight: 600 }}>✓ File selected</div>}
                  </div>
                  <div style={{ gridColumn: '1 / -1', paddingTop: 8 }}>
                    <button type="submit" disabled={loading} style={{ width: '100%', background: loading ? '#9ca3af' : 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff', padding: '12px 0', borderRadius: 9, border: 'none', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: '0 3px 12px rgba(22,163,74,0.25)' }}>
                      {loading ? '⏳ Creating account...' : 'Create Business Account →'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 440 }}>
                  {[
                    { label: 'Full Name *', type: 'text', name: 'name', val: registerData.name, ph: 'Your full name' },
                    { label: 'Email Address *', type: 'email', name: 'email', val: registerData.email, ph: 'your@email.com' },
                    { label: 'Password *', type: 'password', name: 'password', val: registerData.password, ph: 'Create a strong password' },
                    { label: 'Confirm Password *', type: 'password', name: 'confirmPassword', val: registerData.confirmPassword, ph: 'Repeat your password' },
                  ].map(f => (
                    <div key={f.name}>
                      <label style={labelStyle}>{f.label}</label>
                      <input type={f.type} name={f.name} value={f.val} onChange={handleRegisterInputChange} placeholder={f.ph} required style={inputStyle}
                        onFocus={e => { e.target.style.borderColor = '#16a34a'; e.target.style.boxShadow = '0 0 0 3px rgba(22,163,74,0.12)'; }}
                        onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                      />
                      {f.name === 'password' && registerData.password && (
                        <>
                          <div style={{ height: 4, background: '#e5e7eb', borderRadius: 99, marginTop: 6 }}>
                            <div style={{ height: 4, borderRadius: 99, background: strengthColor(passwordStrength(registerData.password)), width: `${(passwordStrength(registerData.password) / 4) * 100}%`, transition: 'width 0.2s' }} />
                          </div>
                          <div style={{ fontSize: 10.5, color: strengthColor(passwordStrength(registerData.password)), marginTop: 3, fontWeight: 600 }}>
                            {strengthLabel(passwordStrength(registerData.password))} password
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  <button type="submit" disabled={loading} style={{ background: loading ? '#9ca3af' : 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff', padding: '12px 0', borderRadius: 9, border: 'none', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 6, fontFamily: 'inherit', boxShadow: '0 3px 12px rgba(22,163,74,0.25)' }}>
                    {loading ? '⏳ Creating account...' : 'Create Account →'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══ FORGOT PASSWORD MODAL ════════════════════════════ */}
      {showForgot && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 18, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', width: '100%', maxWidth: 440, position: 'relative' }} className="animate-fade-in-scale">
            <div style={{ padding: '24px 28px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111827', letterSpacing: '-0.3px' }}>🔒 Reset Password</h3>
                <p style={{ fontSize: 12.5, color: '#9ca3af', marginTop: 3 }}>Enter your email to receive a reset token</p>
              </div>
              <button onClick={() => setShowForgot(false)} aria-label="Close"
                style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 18, color: '#6b7280' }}>×</button>
            </div>
            <div style={{ padding: '22px 28px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 9, padding: '10px 14px', fontSize: 13, fontWeight: 600 }}>⚠️ {error}</div>}
              {successMessage && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', borderRadius: 9, padding: '10px 14px', fontSize: 13, fontWeight: 600 }}>✓ {successMessage}</div>}
              <div>
                <label style={labelStyle}>Registered Email</label>
                <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} style={inputStyle} placeholder="you@example.com"
                  onFocus={e => { e.target.style.borderColor = '#16a34a'; e.target.style.boxShadow = '0 0 0 3px rgba(22,163,74,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <button onClick={async () => {
                try { setError(''); setSuccessMessage(''); const res = await axios.post('/api/user/agro/forgot', { email: forgotEmail }); setSuccessMessage('Reset token sent.'); setResetToken(res.data.token); } catch (err) { setError(err.response?.data?.message || 'Failed'); }
              }} style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff', padding: '11px 0', borderRadius: 9, border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                Send Reset Token
              </button>
              {resetToken && <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 9, padding: '10px 14px', fontSize: 12, color: '#6b7280', wordBreak: 'break-all' }}>Token: {resetToken}</div>}
              <div>
                <label style={labelStyle}>New Password</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#16a34a'; e.target.style.boxShadow = '0 0 0 3px rgba(22,163,74,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <div>
                <label style={labelStyle}>Confirm New Password</label>
                <input type="password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#16a34a'; e.target.style.boxShadow = '0 0 0 3px rgba(22,163,74,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <button onClick={async () => {
                if (!resetToken) { setError('Reset token required'); return; }
                if (!newPassword || newPassword !== confirmNewPassword) { setError('Passwords do not match'); return; }
                try { setError(''); await axios.post('/api/user/agro/reset', { token: resetToken, password: newPassword }); setSuccessMessage('Password updated!'); setShowForgot(false); setResetToken(''); setNewPassword(''); setConfirmNewPassword(''); } catch (err) { setError(err.response?.data?.message || 'Failed'); }
              }} style={{ background: '#d97706', color: '#fff', padding: '11px 0', borderRadius: 9, border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;