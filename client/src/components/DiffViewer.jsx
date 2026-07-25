import React, { useState } from 'react';
import { copyToClipboard } from '../utils/export';
import { Copy, ChevronDown, ChevronUp, FileCode } from 'lucide-react';

export default function DiffViewer({ diffs }) {
  const [collapsedFiles, setCollapsedFiles] = useState({});

  if (!diffs || diffs.length === 0) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        No code changes detected or required for this topic.
      </div>
    );
  }

  const toggleCollapse = (index) => {
    setCollapsedFiles(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {diffs.map((diff, index) => {
        const isCollapsed = !!collapsedFiles[index];
        return (
          <div key={index} className="card" style={{ overflow: 'hidden' }}>
            
            {/* Header */}
            <div 
              onClick={() => toggleCollapse(index)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 1.5rem',
                background: 'rgba(255,255,255,0.02)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FileCode size={18} style={{ color: 'var(--secondary)' }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '600', fontSize: '0.95rem' }}>{diff.fileName}</span>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button 
                  onClick={(e) => { e.stopPropagation(); copyToClipboard(diff.newCode, 'Modernized code copied!'); }}
                  className="btn btn-ghost"
                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderRadius: '4px', display: 'flex', gap: '0.25rem' }}
                >
                  <Copy size={12} /> Copy Modern Code
                </button>
                {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
              </div>
            </div>

            {/* Content Body */}
            {!isCollapsed && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                
                {/* Side-by-Side Diff Panels */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', '@media (min-width: 1024px)': { gridTemplateColumns: '1fr 1fr' } }} className="diff-grid">
                  
                  {/* Left Column: Old Outdated Code */}
                  <div style={{ borderRight: '1px solid rgba(255,255,255,0.05)', background: 'rgba(244, 63, 94, 0.01)', padding: '1rem 1.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Outdated Code Syntax</div>
                    <pre style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.825rem',
                      overflowX: 'auto',
                      color: '#fca5a5',
                      whiteSpace: 'pre'
                    }}>
                      {diff.oldCode}
                    </pre>
                  </div>

                  {/* Right Column: New Modern Code */}
                  <div style={{ background: 'rgba(16, 185, 129, 0.01)', padding: '1rem 1.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Modern Upgraded Code</div>
                    <pre style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.825rem',
                      overflowX: 'auto',
                      color: '#a7f3d0',
                      whiteSpace: 'pre'
                    }}>
                      {diff.newCode}
                    </pre>
                  </div>
                </div>

                {/* Bottom Explanation Callout */}
                <div style={{ padding: '1.25rem 1.5rem', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <strong>Explanation:</strong> {diff.explanation}
                </div>
              </div>
            )}
          </div>
        );
      })}

      <style>{`
        .diff-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }
        @media (max-width: 1023px) {
          .diff-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
