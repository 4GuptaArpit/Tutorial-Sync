import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error('ErrorBoundary caught an unhandled rendering crash:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#06060a',
          color: '#fafafa',
          padding: '2rem',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textAlign: 'center'
        }}>
          <div className="card" style={{
            maxWidth: '600px',
            width: '100%',
            padding: '2.5rem',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            background: 'rgba(244, 63, 94, 0.03)',
            boxShadow: '0 8px 32px rgba(244, 63, 94, 0.05)'
          }}>
            <svg style={{ color: '#f43f5e', width: '48px', height: '48px', marginBottom: '1rem' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>Application Render Crash</h1>
            <p style={{ color: '#a1a1c7', marginBottom: '1.5rem', fontSize: '0.975rem' }}>
              React encountered a rendering error. Please try reloading the application. If the problem persists, clear your browser cookies and log back in.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                className="btn btn-primary" 
                onClick={() => window.location.reload()}
                style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)', boxShadow: '0 4px 14px rgba(244, 63, 94, 0.2)' }}
              >
                Reload Application
              </button>
              <button 
                className="btn btn-ghost" 
                onClick={() => window.location.hash = '#/'}
              >
                Return Home
              </button>
            </div>
            
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <details style={{ marginTop: '2rem', textAlign: 'left', background: '#07070f', border: '1px solid #1c1c30', padding: '1rem', borderRadius: '6px' }}>
                <summary style={{ cursor: 'pointer', color: '#f43f5e', fontWeight: '600', fontSize: '0.85rem' }}>Error Stack Trace</summary>
                <pre style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#a1a1c7', marginTop: '0.5rem', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
