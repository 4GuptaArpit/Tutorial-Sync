import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { api } from '../utils/api';

export default function AuthModal() {
  const { login, signup, googleLogin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const modalRef = useRef(null);

  // Listen for login triggers
  useEffect(() => {
    const openModal = () => {
      setIsOpen(true);
      setErrors([]);
      setIsSignUp(false);
    };

    window.addEventListener('open-login-modal', openModal);
    return () => window.removeEventListener('open-login-modal', openModal);
  }, []);

  // Configure Google Sign-In Button dynamically when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const initializeGoogleSignIn = async () => {
      try {
        // Fetch Client ID dynamically from backend to keep configuration dry
        const { clientId } = await api.get('/api/auth/google-client-id');
        
        if (clientId && window.google) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response) => {
              try {
                setLoading(true);
                await googleLogin(response.credential);
                setIsOpen(false);
              } catch (err) {
                setErrors([{ field: 'google', message: err.message || 'Google Auth failed' }]);
              } finally {
                setLoading(false);
              }
            }
          });

          window.google.accounts.id.renderButton(
            document.getElementById('google-btn-container'),
            { 
              theme: 'dark', 
              size: 'large', 
              width: '100%',
              text: 'continue_with',
              shape: 'rectangular'
            }
          );
        }
      } catch (err) {
        console.error('Failed to initialize Google Sign-In:', err);
      }
    };

    // Wait a brief tick to ensure container element is rendered in DOM
    setTimeout(initializeGoogleSignIn, 150);
  }, [isOpen, isSignUp]);

  // Handle keyboard focus trap & closing
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setLoading(true);

    if (isSignUp) {
      if (password !== confirmPassword) {
        setErrors([{ field: 'confirmPassword', message: 'Passwords do not match' }]);
        setLoading(false);
        return;
      }

      try {
        await signup(username, email, password);
        setIsOpen(false);
      } catch (err) {
        if (err.errors) {
          setErrors(err.errors);
        } else {
          setErrors([{ field: 'general', message: err.message }]);
        }
      } finally {
        setLoading(false);
      }
    } else {
      try {
        await login(email, password);
        setIsOpen(false);
      } catch (err) {
        if (err.errors) {
          setErrors(err.errors);
        } else {
          setErrors([{ field: 'general', message: err.message }]);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const getErrorForField = (field) => {
    const err = errors.find(e => e.field === field);
    return err ? err.message : null;
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => setIsOpen(false)}>
      <div 
        className="card" 
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '2.5rem 2rem',
          background: '#0c0c18',
          border: '1px solid rgba(124, 58, 237, 0.25)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          boxShadow: 'var(--shadow-neon)',
          animation: 'slideUp var(--transition-fast) forwards'
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
      >
        {/* Close Button */}
        <button 
          onClick={() => setIsOpen(false)}
          style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <h2 id="auth-title" style={{ fontSize: '1.5rem', fontWeight: '800' }}>
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            {isSignUp ? 'Sign up to modernize code paths' : 'Sign in to access your projects'}
          </p>
        </div>

        {/* Global Error Banner */}
        {getErrorForField('general') && (
          <div style={{
            background: 'var(--danger-bg)',
            border: '1px solid rgba(244, 63, 94, 0.2)',
            color: 'var(--danger)',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} />
            <span>{getErrorForField('general')}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {isSignUp && (
            <div className="input-group">
              <label className="input-label" htmlFor="username-input">Username</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  id="username-input"
                  className="input" 
                  type="text" 
                  required 
                  placeholder="coder_john" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{ paddingLeft: '2.75rem' }}
                />
              </div>
              {getErrorForField('username') && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{getErrorForField('username')}</span>}
            </div>
          )}

          <div className="input-group">
            <label className="input-label" htmlFor="email-input">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                id="email-input"
                className="input" 
                type="email" 
                required 
                placeholder="john@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.75rem' }}
              />
            </div>
            {getErrorForField('email') && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{getErrorForField('email')}</span>}
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="password-input">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                id="password-input"
                className="input" 
                type={showPassword ? 'text' : 'password'} 
                required 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {getErrorForField('password') && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{getErrorForField('password')}</span>}
          </div>

          {isSignUp && (
            <div className="input-group">
              <label className="input-label" htmlFor="confirm-password-input">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  id="confirm-password-input"
                  className="input" 
                  type={showPassword ? 'text' : 'password'} 
                  required 
                  placeholder="••••••••" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ paddingLeft: '2.75rem' }}
                />
              </div>
              {getErrorForField('confirmPassword') && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{getErrorForField('confirmPassword')}</span>}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <hr style={{ flex: 1, borderColor: 'rgba(255, 255, 255, 0.05)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or continue with</span>
          <hr style={{ flex: 1, borderColor: 'rgba(255, 255, 255, 0.05)' }} />
        </div>

        {/* Google OAuth Button Mount */}
        <div id="google-btn-container" style={{ width: '100%', minHeight: '40px' }}></div>
        {getErrorForField('google') && <span style={{ color: 'var(--danger)', fontSize: '0.75rem', textAlign: 'center' }}>{getErrorForField('google')}</span>}

        {/* Toggle Mode */}
        <div style={{ textAlign: 'center', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          </span>
          <button 
            onClick={() => { setIsSignUp(!isSignUp); setErrors([]); }}
            style={{ background: 'none', border: 'none', color: 'var(--secondary)', fontWeight: '600', cursor: 'pointer' }}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
}
