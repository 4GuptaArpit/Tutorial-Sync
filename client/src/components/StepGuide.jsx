import React from 'react';
import { copyToClipboard } from '../utils/export';
import { Terminal, Copy, ExternalLink, FileCode } from 'lucide-react';

export default function StepGuide({ steps, onToggle }) {
  if (!steps || steps.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {steps.map((step, index) => (
        <div 
          key={step._id || index}
          className="card"
          style={{
            padding: '2rem',
            border: step.completed ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid var(--border-glow)',
            background: step.completed ? 'rgba(16, 185, 129, 0.01)' : 'var(--bg-surface)'
          }}
        >
          {/* Top Checkbox & Step Title Header */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            
            {/* Custom Checkbox */}
            <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', flexShrink: 0, marginTop: '0.15rem' }}>
              <input
                type="checkbox"
                checked={!!step.completed}
                onChange={() => onToggle(step._id, !step.completed)}
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '6px',
                  accentColor: 'var(--success)',
                  cursor: 'pointer'
                }}
              />
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <h3 style={{
                fontSize: '1.2rem',
                textDecoration: step.completed ? 'line-through' : 'none',
                color: step.completed ? 'var(--text-muted)' : '#fff'
              }}>
                Step {step.order}: {step.title}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>{step.description}</p>
            </div>
          </div>

          {/* Expanded Step Resources (Visible if not complete, or just always for reference) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem', paddingLeft: '2.5rem' }}>
            
            {/* Commands section */}
            {step.commands && step.commands.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                  <Terminal size={14} /> Terminal Installation
                </div>
                {step.commands.map((cmd, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#07070f',
                    border: '1px solid #1c1c30',
                    borderRadius: '6px',
                    padding: '0.75rem 1rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.825rem'
                  }}>
                    <code style={{ color: 'var(--secondary)' }}>{cmd}</code>
                    <button 
                      onClick={() => copyToClipboard(cmd, 'Command copied!')}
                      className="btn btn-ghost"
                      style={{ padding: '0.2rem 0.4rem', border: 'none', background: 'none' }}
                      aria-label="Copy command"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Code blocks section */}
            {step.codeBlocks && step.codeBlocks.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {step.codeBlocks.map((cb, idx) => (
                  <div key={idx} className="card" style={{ overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{cb.fileName}</span>
                      <button 
                        onClick={() => copyToClipboard(cb.code, 'Code snippet copied!')}
                        className="btn btn-ghost"
                        style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem' }}
                      >
                        <Copy size={12} /> Copy Code
                      </button>
                    </div>
                    <pre style={{
                      padding: '1rem',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.825rem',
                      overflowX: 'auto',
                      background: '#07070f',
                      color: '#fafafa',
                      whiteSpace: 'pre'
                    }}>
                      <code>{cb.code}</code>
                    </pre>
                  </div>
                ))}
              </div>
            )}

            {/* Reference Documentation links */}
            {step.docLinks && step.docLinks.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.25rem' }}>
                {step.docLinks.map((link, idx) => (
                  <a 
                    key={idx} 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}
                  >
                    {link.title} <ExternalLink size={12} />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
