import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaLeaf } from 'react-icons/fa';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('userName'));

  useEffect(() => {
    const handleStorage = () => {
      setIsLoggedIn(!!localStorage.getItem('userName'));
    };
    window.addEventListener('storage', handleStorage);
    // Also update on route change
    handleStorage();
    return () => window.removeEventListener('storage', handleStorage);
  }, [location.pathname]);

  const hidePublicLinks = isLoggedIn && (location.pathname.startsWith('/farmer-dashboard') || location.pathname.startsWith('/agro-dashboard') || location.pathname.startsWith('/marketplace') || location.pathname.startsWith('/my-orders'));

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 64 }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ background: '#16a34a', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaLeaf style={{ color: '#fff', fontSize: 16 }} />
            </div>
            <span style={{ fontWeight: 800, fontSize: 20, color: '#111827', letterSpacing: '-0.4px' }}>
              AgriBudget
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: 32 }}>
            {!hidePublicLinks && (
              <Link
                to="/"
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: location.pathname === '/' ? '#16a34a' : '#374151',
                  textDecoration: 'none',
                  borderBottom: location.pathname === '/' ? '2px solid #16a34a' : '2px solid transparent',
                  paddingBottom: 2,
                  transition: 'color 0.15s',
                }}
              >
                Home
              </Link>
            )}
            {!hidePublicLinks && (
              <>
                <Link
                  to="/about"
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: location.pathname === '/about' ? '#16a34a' : '#374151',
                    textDecoration: 'none',
                    borderBottom: location.pathname === '/about' ? '2px solid #16a34a' : '2px solid transparent',
                    paddingBottom: 2,
                    transition: 'color 0.15s',
                  }}
                >
                  About
                </Link>
                <Link
                  to="/login"
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#374151',
                    textDecoration: 'none',
                    transition: 'color 0.15s',
                  }}
                >
                  Login
                </Link>
                <Link
                  to="/login"
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#fff',
                    background: '#16a34a',
                    borderRadius: 8,
                    padding: '8px 18px',
                    textDecoration: 'none',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#15803d'}
                  onMouseLeave={e => e.currentTarget.style.background = '#16a34a'}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151', padding: 4 }}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              {isOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div
            className="md:hidden"
            style={{ borderTop: '1px solid #f3f4f6', paddingBottom: 16 }}
          >
            {!hidePublicLinks && (
              <Link
                to="/"
                style={{ display: 'block', padding: '12px 4px', fontSize: 15, fontWeight: 500, color: '#111827', textDecoration: 'none' }}
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
            )}
            {!hidePublicLinks && (
              <>
                <Link
                  to="/about"
                  style={{ display: 'block', padding: '12px 4px', fontSize: 15, fontWeight: 500, color: '#111827', textDecoration: 'none' }}
                  onClick={() => setIsOpen(false)}
                >
                  About
                </Link>
                <Link
                  to="/login"
                  style={{ display: 'block', padding: '12px 4px', fontSize: 15, fontWeight: 500, color: '#111827', textDecoration: 'none' }}
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/login"
                  style={{
                    display: 'inline-block',
                    marginTop: 12,
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#fff',
                    background: '#16a34a',
                    borderRadius: 8,
                    padding: '9px 20px',
                    textDecoration: 'none',
                  }}
                  onClick={() => setIsOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;