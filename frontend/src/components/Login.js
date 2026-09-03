import React, { useState } from 'react';
import { FaLeaf, FaUser, FaBuilding, FaEye, FaEyeSlash, FaEnvelope, FaLock } from 'react-icons/fa';
import { GiPitchfork } from 'react-icons/gi';
import { useNavigate } from 'react-router-dom';
import axios from "axios";

const Login = () => {
  const [userType, setUserType] = useState('farmer');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const navigate = useNavigate();
  const [showRegister, setShowRegister] = React.useState(false);
  const [registerData, setRegisterData] = React.useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [agroRegisterData, setAgroRegisterData] = React.useState({
    agroName: '',
    ownerName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    city: '',
    address: '',
    location: '',
    agroType: 'Supplier',
    services: [],
    gstNumber: '',
    socialLinks: '',
    workingHours: '',
  });
  const [agroLogo, setAgroLogo] = React.useState(null);
  const [agroIdProof, setAgroIdProof] = React.useState(null);
  const [agroLogoPreview, setAgroLogoPreview] = React.useState(null);
  const [agroIdPreview, setAgroIdPreview] = React.useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    if (!formData.email || !formData.password) return;
    try {
      // Use shared auth for both
      const res = await axios.post('/api/user/auth/login', { email: formData.email, password: formData.password });
      if (res.data?.role === 'farmer') {
        const data = res.data;
        localStorage.setItem('userName', data.name);
        localStorage.setItem('userEmail', data.email);
        localStorage.setItem('role', 'farmer');
            const isFirstLogin = localStorage.getItem('isFirstLogin') === null;
            if (isFirstLogin) {
              localStorage.setItem('isFirstLogin', 'true');
              setSuccessMessage("Welcome! Please update your profile information for a better experience.");
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
      if (err.response?.status === 404) setError('User not found');
      else if (err.response?.status === 401) setError('Incorrect password');
      else setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleRegisterInputChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    if (userType === 'farmer') {
      if (!registerData.name || !registerData.email || !registerData.password) {
        setError("Please fill in all required fields.");
        return;
      }
      if (registerData.password !== registerData.confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      try {
        await axios.post("/api/user/register", {
          name: registerData.name,
          email: registerData.email,
          password: registerData.password,
          userType: "farmer",
        });
        localStorage.setItem("userName", registerData.name);
        localStorage.setItem("userEmail", registerData.email);
        localStorage.setItem("isFirstLogin", "true");
        setShowRegister(false);
        setError("");
        setFormData({ email: registerData.email, password: registerData.password });
        setUserType("farmer");
        setSuccessMessage("Account created successfully! You can now log in.");
      } catch (err) {
        setError(err.response?.data?.message || "Registration failed");
      }
    } else if (userType === 'agro-business') {
      // Agro registration
      if (!agroRegisterData.password || agroRegisterData.password !== agroRegisterData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      try {
        const fd = new FormData();
        Object.entries({
          agroName: agroRegisterData.agroName,
          ownerName: agroRegisterData.ownerName,
          email: agroRegisterData.email,
          phone: agroRegisterData.phone,
          password: agroRegisterData.password,
          city: agroRegisterData.city,
          address: agroRegisterData.address,
          location: agroRegisterData.location,
          agroType: agroRegisterData.agroType,
          services: agroRegisterData.services.join(',') ,
          gstNumber: agroRegisterData.gstNumber,
          socialLinks: agroRegisterData.socialLinks,
          workingHours: agroRegisterData.workingHours ? JSON.stringify({ range: agroRegisterData.workingHours }) : ''
        }).forEach(([k, v]) => fd.append(k, v));
        if (agroLogo) fd.append('logo', agroLogo);
        if (agroIdProof) fd.append('idProof', agroIdProof);
        await axios.post('/api/user/agro/register', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        setShowRegister(false);
        setSuccessMessage('Account created successfully! You can now log in.');
      } catch (err) {
        setError(err.response?.data?.message || 'Agro registration failed');
      }
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

  /* shared input style */
  const inputStyle = {
    width: '100%',
    border: '1px solid #d1d5db',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 14,
    color: '#111827',
    background: '#fff',
    outline: 'none',
    boxSizing: 'border-box',
  };
  const inputWithIconStyle = { ...inputStyle, paddingLeft: 40 };
  const labelStyle = { fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 };

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
      {/* ===== MAIN CARD ===== */}
      <div style={{ width: '100%', maxWidth: 960, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, boxShadow: '0 8px 30px rgba(0,0,0,0.08)', overflow: 'hidden' }}>

        {/* Left: Form */}
        <div style={{ padding: '40px 40px 36px' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
            <div style={{ background: '#16a34a', borderRadius: 8, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaLeaf style={{ color: '#fff', fontSize: 15 }} />
            </div>
            <span style={{ fontWeight: 800, fontSize: 20, color: '#111827', letterSpacing: '-0.3px' }}>AgriBudget</span>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Sign in to your account</h2>
          <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 28 }}>Empowering your harvest, empowering your future.</p>

          {/* User Type Toggle */}
          <div style={{ marginBottom: 22 }}>
            <label style={labelStyle}>I am a:</label>
            <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 8, padding: 3, gap: 3 }}>
              <button
                type="button"
                onClick={() => setUserType('farmer')}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  background: userType === 'farmer' ? '#fff' : 'transparent',
                  color: userType === 'farmer' ? '#16a34a' : '#6b7280',
                  boxShadow: userType === 'farmer' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                <FaUser style={{ fontSize: 12 }} />
                <GiPitchfork style={{ fontSize: 12, color: '#d97706' }} />
                Farmer
              </button>
              <button
                type="button"
                onClick={() => setUserType('agro-business')}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  background: userType === 'agro-business' ? '#fff' : 'transparent',
                  color: userType === 'agro-business' ? '#16a34a' : '#6b7280',
                  boxShadow: userType === 'agro-business' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                <FaBuilding style={{ fontSize: 12 }} />
                Agro-Business
              </button>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 8, padding: '10px 14px', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>{error}</div>
            )}
            {successMessage && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', borderRadius: 8, padding: '10px 14px', fontSize: 13, fontWeight: 600, marginBottom: 16 }} className="animate-fade-in-scale">{successMessage}</div>
            )}

            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="email" style={labelStyle}>Email or Phone Number</label>
              <div style={{ position: 'relative' }}>
                <FaEnvelope style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 14 }} />
                <input
                  id="email" name="email" type="text" required
                  value={formData.email} onChange={handleInputChange}
                  style={inputWithIconStyle}
                  placeholder="Enter your email or phone"
                  aria-label="Email or phone number"
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 20 }}>
              <label htmlFor="password" style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <FaLock style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 14 }} />
                <input
                  id="password" name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password} onChange={handleInputChange}
                  style={{ ...inputWithIconStyle, paddingRight: 40 }}
                  placeholder="Enter your password"
                  aria-label="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0 }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FaEyeSlash style={{ fontSize: 15 }} /> : <FaEye style={{ fontSize: 15 }} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              style={{ width: '100%', background: '#16a34a', color: '#fff', padding: '11px 0', borderRadius: 8, border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', transition: 'background 0.15s', marginBottom: 16 }}
              onMouseEnter={e => e.currentTarget.style.background='#15803d'}
              onMouseLeave={e => e.currentTarget.style.background='#16a34a'}
            >
              Sign In
            </button>
          </form>

          {/* Secondary Links */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#16a34a', fontWeight: 500, padding: 0 }}
              onClick={() => setShowForgot(true)}
            >
              Forgot Password?
            </button>
            <a
              href="#register"
              style={{ fontSize: 13, color: '#16a34a', fontWeight: 500, textDecoration: 'none' }}
              onClick={e => { e.preventDefault(); setShowRegister(true); }}
            >
              Create an account →
            </a>
          </div>
        </div>

        {/* Right: Visual Panel */}
        <div className="hidden lg:flex" style={{ background: '#f0fdf4', borderLeft: '1px solid #e5e7eb', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 32px', gap: 32 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 28 }}>
              <div style={{ position: 'relative' }}>
                <div style={{ background: '#16a34a', borderRadius: 14, width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(22,163,74,0.25)' }}>
                  <FaUser style={{ color: '#fff', fontSize: 30 }} />
                </div>
                <div style={{ position: 'absolute', bottom: -6, right: -6, background: '#d97706', borderRadius: 8, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GiPitchfork style={{ color: '#fff', fontSize: 12 }} />
                </div>
              </div>
              <div style={{ position: 'relative' }}>
                <div style={{ background: '#d97706', borderRadius: 14, width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(217,119,6,0.25)' }}>
                  <FaBuilding style={{ color: '#fff', fontSize: 30 }} />
                </div>
                <div style={{ position: 'absolute', bottom: -6, right: -6, background: '#16a34a', borderRadius: 8, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaLeaf style={{ color: '#fff', fontSize: 12 }} />
                </div>
              </div>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 10 }}>Welcome to AgriBudget</h3>
            <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, maxWidth: 260, margin: '0 auto 24px' }}>
              Manage your agricultural finances with precision and ease.
            </p>
            <div style={{ background: '#fff', border: '1px solid #d1fae5', borderRadius: 10, padding: '14px 18px', textAlign: 'left' }}>
              {['Track income & expenses', 'Crop-wise budgeting', 'Smart alerts & analytics', 'Weather & market data'].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151', marginBottom: i < 3 ? 8 : 0 }}>
                  <div style={{ width: 18, height: 18, background: '#dcfce7', borderRadius: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: '#16a34a', fontSize: 9, fontWeight: 700 }}>✓</span>
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== REGISTRATION MODAL ===== */}
      {showRegister && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', width: '100%', maxWidth: 760, maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setShowRegister(false)} aria-label="Close" style={{ position: 'absolute', top: 16, right: 18, background: 'none', border: 'none', fontSize: 22, color: '#9ca3af', cursor: 'pointer' }}>×</button>
            <div style={{ padding: '28px 32px 16px', borderBottom: '1px solid #f3f4f6' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>{userType === 'agro-business' ? 'Create Agro-Business Account' : 'Create Farmer Account'}</h2>
            </div>
            <div style={{ padding: '24px 32px 32px' }}>
              {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 8, padding: '10px 14px', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>{error}</div>}
              {successMessage && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', borderRadius: 8, padding: '10px 14px', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>{successMessage}</div>}

              {userType === 'agro-business' ? (
                <form onSubmit={handleRegister} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px 20px' }}>
                  {[
                    { label: 'Business Name', type: 'text', val: agroRegisterData.agroName, key: 'agroName', req: true },
                    { label: 'Owner Name', type: 'text', val: agroRegisterData.ownerName, key: 'ownerName', req: true },
                    { label: 'Email', type: 'email', val: agroRegisterData.email, key: 'email', req: true },
                    { label: 'Phone / WhatsApp', type: 'tel', val: agroRegisterData.phone, key: 'phone', req: true },
                    { label: 'Password', type: 'password', val: agroRegisterData.password, key: 'password', req: true },
                    { label: 'Confirm Password', type: 'password', val: agroRegisterData.confirmPassword, key: 'confirmPassword', req: true },
                    { label: 'City', type: 'text', val: agroRegisterData.city, key: 'city', req: true },
                    { label: 'Exact Location (link/coords)', type: 'text', val: agroRegisterData.location, key: 'location', req: false },
                    { label: 'GST / License Number', type: 'text', val: agroRegisterData.gstNumber, key: 'gstNumber', req: true },
                    { label: 'Website / Social Links', type: 'text', val: agroRegisterData.socialLinks, key: 'socialLinks', req: false },
                    { label: 'Working Hours (e.g. 09:00-18:00)', type: 'text', val: agroRegisterData.workingHours, key: 'workingHours', req: false },
                  ].map(field => (
                    <div key={field.key}>
                      <label style={labelStyle}>{field.label}</label>
                      <input type={field.type} value={field.val} required={field.req}
                        onChange={e => setAgroRegisterData({ ...agroRegisterData, [field.key]: e.target.value })}
                        style={inputStyle} />
                      {field.key === 'password' && (
                        <div style={{ height: 4, background: '#e5e7eb', borderRadius: 99, marginTop: 6 }}>
                          <div style={{ height: 4, borderRadius: 99, background: passwordStrength(agroRegisterData.password) >= 3 ? '#16a34a' : passwordStrength(agroRegisterData.password) === 2 ? '#d97706' : '#dc2626', width: `${(passwordStrength(agroRegisterData.password)/4)*100}%`, transition: 'width 0.2s' }} />
                        </div>
                      )}
                    </div>
                  ))}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Address</label>
                    <input type="text" value={agroRegisterData.address} required onChange={e => setAgroRegisterData({ ...agroRegisterData, address: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Agro Type</label>
                    <select value={agroRegisterData.agroType} onChange={e => setAgroRegisterData({ ...agroRegisterData, agroType: e.target.value })} style={inputStyle}>
                      {['Supplier','Buyer','Machinery Provider','NGO','Other'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Services Offered (comma separated)</label>
                    <input type="text" value={agroRegisterData.services.join(',')} onChange={e => setAgroRegisterData({ ...agroRegisterData, services: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} style={inputStyle} placeholder="e.g. Seeds, Fertilizers" />
                  </div>
                  <div>
                    <label style={labelStyle}>Profile Logo</label>
                    <input type="file" accept="image/*" style={{ ...inputStyle, padding: '7px 14px' }} onChange={e => { const f = e.target.files?.[0]; setAgroLogo(f); setAgroLogoPreview(f ? URL.createObjectURL(f) : null); }} />
                    {agroLogoPreview && <img src={agroLogoPreview} alt="logo preview" style={{ marginTop: 8, width: 56, height: 56, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }} />}
                  </div>
                  <div>
                    <label style={labelStyle}>ID Proof (optional)</label>
                    <input type="file" accept="image/*,.pdf" style={{ ...inputStyle, padding: '7px 14px' }} onChange={e => { const f = e.target.files?.[0]; setAgroIdProof(f); setAgroIdPreview(f ? URL.createObjectURL(f) : null); }} />
                    {agroIdPreview && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>File selected ✓</div>}
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <button type="submit" style={{ width: '100%', background: '#16a34a', color: '#fff', padding: '11px 0', borderRadius: 8, border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background='#15803d'}
                      onMouseLeave={e => e.currentTarget.style.background='#16a34a'}>
                      Create Account
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    { label: 'Name', type: 'text', name: 'name', val: registerData.name, ph: 'Enter your name' },
                    { label: 'Email', type: 'email', name: 'email', val: registerData.email, ph: 'Enter your email' },
                    { label: 'Password', type: 'password', name: 'password', val: registerData.password, ph: 'Create a password' },
                    { label: 'Confirm Password', type: 'password', name: 'confirmPassword', val: registerData.confirmPassword, ph: 'Confirm your password' },
                  ].map(f => (
                    <div key={f.name}>
                      <label style={labelStyle}>{f.label}</label>
                      <input type={f.type} name={f.name} value={f.val} onChange={handleRegisterInputChange} placeholder={f.ph} required style={inputStyle} />
                    </div>
                  ))}
                  <button type="submit" style={{ background: '#16a34a', color: '#fff', padding: '11px 0', borderRadius: 8, border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 4 }}
                    onMouseEnter={e => e.currentTarget.style.background='#15803d'}
                    onMouseLeave={e => e.currentTarget.style.background='#16a34a'}>
                    Create Account
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== FORGOT PASSWORD MODAL ===== */}
      {showForgot && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', width: '100%', maxWidth: 440, position: 'relative' }}>
            <button onClick={() => setShowForgot(false)} aria-label="Close" style={{ position: 'absolute', top: 16, right: 18, background: 'none', border: 'none', fontSize: 22, color: '#9ca3af', cursor: 'pointer' }}>×</button>
            <div style={{ padding: '24px 28px 16px', borderBottom: '1px solid #f3f4f6' }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>Reset Password</h3>
            </div>
            <div style={{ padding: '20px 28px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 8, padding: '10px 14px', fontSize: 13, fontWeight: 600 }}>{error}</div>}
              {successMessage && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', borderRadius: 8, padding: '10px 14px', fontSize: 13, fontWeight: 600 }}>{successMessage}</div>}

              <div>
                <label style={labelStyle}>Registered Email</label>
                <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} style={inputStyle} placeholder="you@example.com" />
              </div>
              <button
                onClick={async () => {
                  try {
                    setError('');
                    setSuccessMessage('');
                    const res = await axios.post('/api/user/agro/forgot', { email: forgotEmail });
                    setSuccessMessage('Reset token sent. For demo, token shown below.');
                    setResetToken(res.data.token);
                  } catch (err) {
                    setError(err.response?.data?.message || 'Failed to generate reset token');
                  }
                }}
                style={{ background: '#16a34a', color: '#fff', padding: '11px 0', borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
              >
                Get Reset Token
              </button>
              {resetToken && (
                <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#6b7280', wordBreak: 'break-all' }}>Token: {resetToken}</div>
              )}
              <div>
                <label style={labelStyle}>New Password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Confirm New Password</label>
                <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} style={inputStyle} />
              </div>
              <button
                onClick={async () => {
                  if (!resetToken) { setError('Reset token required'); return; }
                  if (!newPassword || newPassword !== confirmNewPassword) { setError('Passwords do not match'); return; }
                  try {
                    setError('');
                    await axios.post('/api/user/agro/reset', { token: resetToken, password: newPassword });
                    setSuccessMessage('Password updated. You can now log in.');
                    setShowForgot(false);
                    setResetToken('');
                    setNewPassword('');
                    setConfirmNewPassword('');
                  } catch (err) {
                    setError(err.response?.data?.message || 'Failed to reset password');
                  }
                }}
                style={{ background: '#d97706', color: '#fff', padding: '11px 0', borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
              >
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