import React from 'react';

export default function NotFound() {
  return (
    <div className="container" style={{
      flex: '1',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '4rem 1.5rem',
      animation: 'slideUp var(--transition-normal) forwards'
    }}>
      <div className="card" style={{
        maxWidth: '500px',
        padding: '3rem 2rem',
        border: '1px solid var(--border-glow)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem'
      }}>
        {/* Animated Glow Logo Ring */}
        <div style={{
          position: 'relative',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'rgba(124, 58, 237, 0.05)',
          border: '2px dashed var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'pulse 3s infinite'
        }}>
          <span style={{ fontSize: '3rem', fontWeight: '800', background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            404
          </span>
        </div>
        
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Page Not Found</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            The endpoint or resource you are looking for does not exist or has been migrated.
          </p>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => window.location.hash = '#/'}
          style={{ width: '100%' }}
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}
