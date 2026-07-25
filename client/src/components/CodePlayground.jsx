import React, { useState, useEffect } from 'react';
import { copyToClipboard } from '../utils/export';
import { Copy, Save, X, Play, Code, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CodePlayground({ onClose }) {
  const [editorText, setEditorText] = useState('// Paste modernized code snippets here and test adjustments...');
  const [savedSnippets, setSavedSnippets] = useState([]);
  const [activeSnippetIdx, setActiveSnippetIdx] = useState(null);

  useEffect(() => {
    // Load local snippets on mount
    const local = localStorage.getItem('devrefresh-playground-snippets');
    if (local) {
      setSavedSnippets(JSON.parse(local));
    }
  }, []);

  const handleSave = () => {
    const title = window.prompt('Enter a snippet name:', `Snippet ${savedSnippets.length + 1}`);
    if (!title) return;

    const newSnippet = {
      title,
      code: editorText,
      timestamp: new Date().toISOString()
    };

    const updated = [...savedSnippets, newSnippet];
    setSavedSnippets(updated);
    localStorage.setItem('devrefresh-playground-snippets', JSON.stringify(updated));
    toast.success('Snippet saved locally!');
  };

  const handleLoadSnippet = (idx) => {
    setEditorText(savedSnippets[idx].code);
    setActiveSnippetIdx(idx);
    toast.success(`Loaded "${savedSnippets[idx].title}"`);
  };

  const handleDeleteSnippet = (idx, e) => {
    e.stopPropagation();
    const updated = savedSnippets.filter((_, i) => i !== idx);
    setSavedSnippets(updated);
    localStorage.setItem('devrefresh-playground-snippets', JSON.stringify(updated));
    if (activeSnippetIdx === idx) {
      setActiveSnippetIdx(null);
    }
    toast.success('Snippet removed');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      {/* Playground Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 1.25rem',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(255,255,255,0.01)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Code size={18} style={{ color: 'var(--secondary)' }} />
          <h2 style={{ fontSize: '0.95rem', fontWeight: '700' }}>Workspace Playground</h2>
        </div>
        <button 
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          aria-label="Close playground"
        >
          <X size={18} />
        </button>
      </div>

      {/* Main Sandbox Layout */}
      <div style={{ flex: '1', display: 'flex', flexDirection: 'column', padding: '1rem', gap: '1rem' }}>
        
        {/* Actions panel */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-ghost" onClick={handleSave} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', gap: '0.25rem' }}>
            <Save size={14} /> Save Snippet
          </button>
          <button 
            className="btn btn-ghost" 
            onClick={() => copyToClipboard(editorText, 'Sandbox code copied!')}
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', gap: '0.25rem' }}
          >
            <Copy size={14} /> Copy Sandbox
          </button>
        </div>

        {/* Code Input Monospace Pane */}
        <div style={{ flex: '1', position: 'relative', display: 'flex', flexDirection: 'column' }}>
          <textarea
            value={editorText}
            onChange={(e) => setEditorText(e.target.value)}
            style={{
              flex: '1',
              width: '100%',
              background: '#07070f',
              border: '1px solid #1c1c30',
              borderRadius: '8px',
              padding: '1rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.825rem',
              color: '#fafafa',
              resize: 'none',
              outline: 'none'
            }}
            spellCheck="false"
          />
        </div>

        {/* Local Saved Snippets tray */}
        {savedSnippets.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Saved Snippets</span>
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
              {savedSnippets.map((snip, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleLoadSnippet(idx)}
                  style={{
                    background: activeSnippetIdx === idx ? 'rgba(6, 182, 212, 0.1)' : 'rgba(255,255,255,0.02)',
                    border: activeSnippetIdx === idx ? '1px solid var(--secondary)' : '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '6px',
                    padding: '0.4rem 0.75rem',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    whiteSpace: 'nowrap'
                  }}
                  className="snippet-badge"
                >
                  <span>{snip.title}</span>
                  <button 
                    onClick={(e) => handleDeleteSnippet(idx, e)}
                    style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer' }}
                    className="delete-snip-btn"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .snippet-badge {
          transition: all var(--transition-fast);
        }
        .snippet-badge:hover {
          border-color: var(--secondary) !important;
          background: rgba(6, 182, 212, 0.05) !important;
        }
        .delete-snip-btn:hover {
          color: var(--danger) !important;
        }
      `}</style>
    </div>
  );
}
