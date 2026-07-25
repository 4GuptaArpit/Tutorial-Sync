import React from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, ArrowRightLeft, BookOpen } from 'lucide-react';

export default function OverviewPanel({ overview }) {
  if (!overview) return null;

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'hard': return 'var(--danger)';
      case 'medium': return 'var(--warning)';
      default: return 'var(--success)';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* Tech Stack Comparison grid */}
      <div>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowRightLeft size={18} style={{ color: 'var(--primary)' }} /> Tech Stack Version Shifts
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Outdated Stack Card */}
          <div className="card" style={{ padding: '1.5rem', border: '1px solid rgba(244, 63, 94, 0.15)', background: 'rgba(244, 63, 94, 0.01)' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--danger)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={16} /> Tutorial Dependencies
            </h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', listStyle: 'none' }}>
              {overview.originalStack.map((dep, i) => (
                <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.15)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                  <span style={{ fontWeight: '600' }}>{dep.name}</span>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{dep.version}</span>
                    <span className="badge badge-deprecated">{dep.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Upgraded Modernized Stack Card */}
          <div className="card" style={{ padding: '1.5rem', border: '1px solid rgba(16, 185, 129, 0.15)', background: 'rgba(16, 185, 129, 0.01)' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--success)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={16} /> Modern Equivalents
            </h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', listStyle: 'none' }}>
              {overview.currentStack.map((dep, i) => (
                <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.15)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                  <span style={{ fontWeight: '600' }}>{dep.name}</span>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{dep.version}</span>
                    {dep.docUrl && (
                      <a href={dep.docUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: 'var(--secondary)', display: 'inline-flex', alignItems: 'center' }}>
                        Docs
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Migration Recommendations */}
      <div>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={18} style={{ color: 'var(--warning)' }} /> Architectural Migration Recommendations
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {overview.recommendations.map((rec, i) => (
            <div key={i} className="card" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span className="badge badge-deprecated" style={{ fontSize: '0.7rem' }}>Instead of</span>
                <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--danger)', background: 'rgba(244, 63, 94, 0.05)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>{rec.instead}</code>
                <span className="badge badge-current" style={{ fontSize: '0.7rem' }}>Use</span>
                <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--success)', background: 'rgba(16, 185, 129, 0.05)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>{rec.use}</code>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>{rec.reason}</p>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
