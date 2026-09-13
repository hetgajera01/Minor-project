import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaLeaf, FaUserCircle, FaBell, FaChevronDown } from 'react-icons/fa';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('userName'));
  const userName = localStorage.getItem('userName');
  const role = localStorage.getItem('role');

  useEffect(() => {
    const handleStorage = () => setIsLoggedIn(!!localStorage.getItem('userName'));
    window.addEventListener('storage', handleStorage);
    handleStorage();
    return () => window.removeEventListener('storage', handleStorage);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Hide global nav on dashboard pages (they have their own sidebar nav)
  const isDashboard = isLoggedIn && (
    location.pathname.startsWith('/farmer-dashboard') ||
    location.pathname.startsWith('/agro-dashboard')
  );
  if (isDashboard) return null;

  const hidePublicLinks = isLoggedIn && (
    location.pathname.startsWith('/marketplace') ||
    location.pathname.startsWith('/my-orders') ||
    location.pathname.startsWith('/settings')
  );

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    ['userName', 'userEmail', 'role', 'isFirstLogin', 'agroId', 'agroName', 'agroEmail']
      .forEach(k => localStorage.removeItem(k));
    window.location.href = '/';
  };

  return (
    <nav style={{
      background: '#fff',
      borderBottom: scrolled ? '1px solid #e5e7eb' : '1px solid transparent',
      position: 'sticky', top: 0, zIndex: 50,
      boxShadow: scrolled ? '0 1px 8px rgba(0,0,0,0.06)' : 'none',
      transition: 'box-shadow 0.2s, border-color 0.2s',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 64 }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
            <div style={{
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              borderRadius: 9, width: 34, height: 34,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(22,163,74,0.3)',
            }}>
              <FaLeaf style={{ color: '#fff', fontSize: 16 }} />
            </div>
            <div>
              <span style={{ fontWeight: 800, fontSize: 18, color: '#111827', letterSpacing: '-0.4px', lineHeight: 1 }}>
                AgriBudget
              </span>
              <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 500, letterSpacing: '0.4px', marginTop: -1 }}>
                Smart Farm Finance
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: 6 }}>
            {!hidePublicLinks && navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  fontSize: 14, fontWeight: 500, padding: '6px 14px', borderRadius: 8,
                  color: isActive(link.to) ? '#16a34a' : '#374151',
                  background: isActive(link.to) ? '#f0fdf4' : 'transparent',
                  textDecoration: 'none', transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={e => { if (!isActive(link.to)) e.currentTarget.style.background = '#f9fafb'; }}
                onMouseLeave={e => { if (!isActive(link.to)) e.currentTarget.style.background = 'transparent'; }}
              >
                {link.label}
              </Link>
            ))}

            {!isLoggedIn ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 8 }}>
                <Link
                  to="/login"
                  style={{
                    fontSize: 14, fontWeight: 500, padding: '7px 16px', borderRadius: 8,
                    color: '#374151', border: '1px solid #e5e7eb', background: '#fff',
                    textDecoration: 'none', transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  Sign In
                </Link>
                <Link
                  to="/login"
                  style={{
                    fontSize: 14, fontWeight: 600, padding: '8px 18px', borderRadius: 8,
                    background: 'linear-gradient(135deg, #16a34a, #15803d)',
                    color: '#fff', textDecoration: 'none',
                    boxShadow: '0 2px 8px rgba(22,163,74,0.25)',
                    transition: 'box-shadow 0.15s, opacity 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  Get Started →
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8 }}>
                {/* Dashboard link */}
                <Link
                  to={role === 'agro' ? '/agro-dashboard' : '/farmer-dashboard'}
                  style={{
                    fontSize: 13.5, fontWeight: 600, padding: '7px 14px', borderRadius: 8,
                    background: '#f0fdf4', color: '#15803d', textDecoration: 'none',
                    border: '1px solid #bbf7d0', transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#dcfce7'}
                  onMouseLeave={e => e.currentTarget.style.background = '#f0fdf4'}
                >
                  Dashboard
                </Link>

                {/* User badge */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: '#f9fafb', border: '1px solid #e5e7eb',
                  borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
                }} onClick={handleLogout} title="Click to logout">
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #16a34a, #15803d)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <FaUserCircle style={{ color: '#fff', fontSize: 17 }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                    {userName?.split(' ')[0]}
                  </span>
                  <span style={{ fontSize: 10, color: '#9ca3af' }}>▼</span>
                </div>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              style={{
                background: isOpen ? '#f3f4f6' : 'none', border: 'none',
                cursor: 'pointer', color: '#374151', padding: '7px',
                borderRadius: 8, display: 'flex', alignItems: 'center',
              }}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div
            className="md:hidden animate-slide-in-top"
            style={{
              borderTop: '1px solid #f3f4f6', paddingBottom: 20, paddingTop: 8,
            }}
          >
            {!hidePublicLinks && navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  display: 'flex', alignItems: 'center', padding: '11px 4px',
                  fontSize: 15, fontWeight: 500, color: isActive(link.to) ? '#16a34a' : '#111827',
                  textDecoration: 'none', borderBottom: '1px solid #f9fafb',
                }}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {!isLoggedIn ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
                <Link to="/login" onClick={() => setIsOpen(false)}
                  style={{ display: 'block', textAlign: 'center', padding: '10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14, fontWeight: 500, color: '#374151', textDecoration: 'none' }}>
                  Sign In
                </Link>
                <Link to="/login" onClick={() => setIsOpen(false)}
                  style={{ display: 'block', textAlign: 'center', padding: '10px', borderRadius: 8, background: '#16a34a', fontSize: 14, fontWeight: 600, color: '#fff', textDecoration: 'none' }}>
                  Get Started
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
                <Link to={role === 'agro' ? '/agro-dashboard' : '/farmer-dashboard'} onClick={() => setIsOpen(false)}
                  style={{ display: 'block', textAlign: 'center', padding: '10px', borderRadius: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: 14, fontWeight: 600, color: '#15803d', textDecoration: 'none' }}>
                  Go to Dashboard
                </Link>
                <button onClick={handleLogout}
                  style={{ background: '#fff', border: '1px solid #fecaca', borderRadius: 8, padding: '10px', fontSize: 14, fontWeight: 600, color: '#dc2626', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;