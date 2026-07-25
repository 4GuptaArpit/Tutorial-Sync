import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings, LogOut, User, Menu, X, ArrowUpRight } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAuthClick = () => {
    window.dispatchEvent(new CustomEvent('open-login-modal'));
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    window.location.hash = '#/';
  };

  const navigateTo = (hash) => {
    window.location.hash = hash;
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  };

  return (
    <nav style={{
      background: 'rgba(6, 6, 10, 0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      position: 'sticky',
      top: 0,
      zIndex: 999,
      height: '70px',
      display: 'flex',
      alignItems: 'center'
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%'
      }}>
        {/* Logo */}
        <div 
          onClick={() => navigateTo('#/')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        >
          {/* Logo Icon */}
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
          </div>
          <span style={{
            fontSize: '1.25rem',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #ffffff 0%, #a1a1c7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.03em'
          }}>
            Tutorial<span style={{ background: 'var(--secondary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Sync</span>
          </span>
        </div>

        {/* Desktop Menu */}
        <div style={{ display: 'none', alignItems: 'center', gap: '2rem', '@media (min-width: 768px)': { display: 'flex' } }} className="desktop-nav">
          <button 
            onClick={() => navigateTo('#/')}
            style={{ background: 'none', border: 'none', color: window.location.hash === '#/' || !window.location.hash ? '#fff' : 'var(--text-muted)', cursor: 'pointer', fontWeight: '500' }}
          >
            Dashboard
          </button>
          
          {user ? (
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  background: 'none',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                <img 
                  src={user.avatar} 
                  alt={user.username} 
                  style={{ width: '34px', height: '34px', borderRadius: '50%', border: '2px solid var(--primary)', objectFit: 'cover' }}
                />
              </button>

              {dropdownOpen && (
                <div className="card" style={{
                  position: 'absolute',
                  right: 0,
                  top: '45px',
                  width: '220px',
                  background: 'rgba(12, 12, 24, 0.95)',
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                  boxShadow: 'var(--shadow-md)',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '0.5rem' }}>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.username}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
                  </div>
                  
                  <button 
                    onClick={() => navigateTo('#/settings')}
                    style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', cursor: 'pointer', textAlign: 'left' }}
                    className="nav-dropdown-item"
                  >
                    <Settings size={16} /> Settings
                  </button>
                  <button 
                    onClick={handleLogout}
                    style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', cursor: 'pointer', textAlign: 'left', color: 'var(--danger)' }}
                    className="nav-dropdown-item"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              className="btn btn-primary"
              onClick={handleAuthClick}
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile menu triggers */}
        <div style={{ display: 'flex', '@media (min-width: 768px)': { display: 'none' } }} className="mobile-nav-trigger">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '70px',
          left: 0,
          width: '100vw',
          height: 'calc(100vh - 70px)',
          background: 'rgba(6, 6, 10, 0.95)',
          backdropFilter: 'blur(16px)',
          padding: '2rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          zIndex: 998,
          animation: 'fadeIn var(--transition-fast) forwards'
        }}>
          <button 
            onClick={() => navigateTo('#/')}
            style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.25rem', fontWeight: '600', textAlign: 'left', padding: '0.5rem 0' }}
          >
            Dashboard
          </button>
          
          {user ? (
            <>
              <button 
                onClick={() => navigateTo('#/settings')}
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.25rem', fontWeight: '600', textAlign: 'left', padding: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Settings size={20} /> Settings
              </button>
              <button 
                onClick={handleLogout}
                style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '1.25rem', fontWeight: '600', textAlign: 'left', padding: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 'auto' }}
              >
                <LogOut size={20} /> Sign Out
              </button>
            </>
          ) : (
            <button 
              className="btn btn-primary"
              onClick={handleAuthClick}
              style={{ width: '100%', marginTop: 'auto' }}
            >
              Sign In
            </button>
          )}
        </div>
      )}

      {/* Embedded Responsive Media Queries workaround for CSS-in-JS style tags */}
      <style>{`
        .desktop-nav {
          display: flex !important;
        }
        .mobile-nav-trigger {
          display: none !important;
        }
        @media (max-width: 767px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-nav-trigger {
            display: flex !important;
          }
        }
        .nav-dropdown-item {
          color: var(--text-muted);
          transition: all var(--transition-fast);
        }
        .nav-dropdown-item:hover {
          background: rgba(255, 255, 255, 0.05) !important;
          color: #fff !important;
        }
      `}</style>
    </nav>
  );
}
