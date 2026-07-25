import React from 'react';

export default function LoadingSkeleton({ type = 'card' }) {
  if (type === 'dashboard') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
        {/* Shimmering Title */}
        <div className="skeleton" style={{ height: '38px', width: '30%', marginBottom: '1rem' }}></div>
        
        {/* Shimmering Layout Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="card" style={{ padding: '1.5rem', height: '200px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="skeleton" style={{ height: '24px', width: '60%' }}></div>
              <div className="skeleton" style={{ height: '16px', width: '100%' }}></div>
              <div className="skeleton" style={{ height: '16px', width: '80%' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
                <div className="skeleton" style={{ height: '32px', width: '80px', borderRadius: '4px' }}></div>
                <div className="skeleton" style={{ height: '20px', width: '100px' }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'guide') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
        <div className="skeleton" style={{ height: '32px', width: '40%' }}></div>
        <div className="skeleton" style={{ height: '18px', width: '90%' }}></div>
        <div className="skeleton" style={{ height: '18px', width: '75%' }}></div>
        <hr style={{ borderColor: 'rgba(255,255,255,0.05)', margin: '1rem 0' }} />
        {[1, 2].map(i => (
          <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div className="skeleton" style={{ height: '36px', width: '36px', borderRadius: '50%', flexShrink: '0' }}></div>
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="skeleton" style={{ height: '24px', width: '30%' }}></div>
              <div className="skeleton" style={{ height: '60px', width: '100%' }}></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'chat') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <div className="skeleton" style={{ height: '32px', width: '32px', borderRadius: '50%' }}></div>
          <div className="skeleton" style={{ height: '64px', width: '70%', borderRadius: '4px 12px 12px 12px' }}></div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', alignSelf: 'flex-end', flexDirection: 'row-reverse' }}>
          <div className="skeleton" style={{ height: '32px', width: '32px', borderRadius: '50%' }}></div>
          <div className="skeleton" style={{ height: '40px', width: '55%', borderRadius: '12px 4px 12px 12px' }}></div>
        </div>
      </div>
    );
  }

  // Single default card skeleton
  return (
    <div className="card" style={{ padding: '1.5rem', minHeight: '150px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div className="skeleton" style={{ height: '20px', width: '40%' }}></div>
      <div className="skeleton" style={{ height: '14px', width: '100%' }}></div>
      <div className="skeleton" style={{ height: '14px', width: '85%' }}></div>
    </div>
  );
}
