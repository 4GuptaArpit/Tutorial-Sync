import React, { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { copyToClipboard } from '../utils/export';
import { Send, Sparkles, Trash2, ArrowUpRight, MessageSquareDashed, Copy, Check } from 'lucide-react';
import LoadingSkeleton from './LoadingSkeleton';

export default function ChatAssistant({ projectId }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const chatEndRef = useRef(null);

  const suggestedQuestions = [
    'What dependencies are deprecated?',
    'Show me the new v9 Firebase syntax',
    'How do I handle useNavigate in Route V6?'
  ];

  useEffect(() => {
    fetchHistory();
  }, [projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const fetchHistory = async () => {
    try {
      setInitialLoading(true);
      const data = await api.get(`/api/chat/${projectId}`);
      setMessages(data.messages || []);
    } catch (err) {
      console.error(err);
    } finally {
      setInitialLoading(false);
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e, textOverride = '') => {
    if (e) e.preventDefault();
    const messageText = textOverride || inputText;

    if (!messageText.trim() || loading) return;

    // Clear input
    if (!textOverride) setInputText('');

    // Push local user message immediately
    const tempUserMsg = {
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const data = await api.post(`/api/chat/${projectId}`, { content: messageText });
      
      // Update message list with AI reply
      setMessages(prev => [...prev, data.reply]);
    } catch (err) {
      const tempErrorMsg = {
        role: 'assistant',
        content: `[AI Mentor Error]: ${err.message || 'Failed to send message.'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, tempErrorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Clear all conversation history in this mentoring session?')) {
      return;
    }
    try {
      await api.delete(`/api/chat/${projectId}`);
      setMessages([]);
    } catch (err) {
      console.error(err);
    }
  };

  // Parse inline Markdown tokens (**bold**, *italic*, `code`) cleanly into React nodes
  const renderInlineFormatted = (text) => {
    if (!text) return null;

    const tokens = [];
    let tokenKey = 0;

    // Pattern matching `code`, **bold**, __bold__, *italic*, _italic_
    const regex = /(`([^`]+)`|\*\*([^*]+)\*\*|__([^_]+)__|(?<!\*)\*([^*]+)\*(?!\*)|\b_([^_]+)_\b)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        tokens.push(<span key={tokenKey++}>{text.substring(lastIndex, match.index)}</span>);
      }

      const fullMatch = match[0];
      if (fullMatch.startsWith('`')) {
        const codeText = match[2];
        tokens.push(
          <code
            key={tokenKey++}
            style={{
              background: 'rgba(6, 182, 212, 0.12)',
              color: '#38bdf8',
              padding: '0.15rem 0.4rem',
              borderRadius: '4px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              border: '1px solid rgba(6, 182, 212, 0.25)',
              margin: '0 0.15rem'
            }}
          >
            {codeText}
          </code>
        );
      } else if (fullMatch.startsWith('**') || fullMatch.startsWith('__')) {
        const boldText = match[3] || match[4];
        tokens.push(
          <strong key={tokenKey++} style={{ color: '#ffffff', fontWeight: '700' }}>
            {boldText}
          </strong>
        );
      } else if (fullMatch.startsWith('*') || fullMatch.startsWith('_')) {
        const italicText = match[5] || match[6];
        tokens.push(
          <em key={tokenKey++} style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
            {italicText}
          </em>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      tokens.push(<span key={tokenKey++}>{text.substring(lastIndex)}</span>);
    }

    return tokens;
  };

  // Render complete message content with block-level markdown and code blocks
  const renderMessageContent = (content) => {
    if (!content) return null;

    // Split content into code blocks vs text blocks
    const codeBlockRegex = /(```[\s\S]*?```)/g;
    const parts = content.split(codeBlockRegex);

    return parts.map((part, pIdx) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const rawContent = part.slice(3, -3).trim();
        const firstLineEnd = rawContent.indexOf('\n');
        let language = '';
        let codeText = rawContent;

        if (firstLineEnd !== -1) {
          const possibleLang = rawContent.substring(0, firstLineEnd).trim().toLowerCase();
          if (['javascript', 'js', 'jsx', 'ts', 'typescript', 'html', 'css', 'bash', 'sh', 'json', 'python'].includes(possibleLang)) {
            language = possibleLang;
            codeText = rawContent.substring(firstLineEnd + 1);
          }
        }

        return (
          <div
            key={pIdx}
            style={{
              background: '#07070f',
              border: '1px solid rgba(124, 58, 237, 0.25)',
              borderRadius: '8px',
              margin: '0.75rem 0',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center',
                padding: '0.35rem 0.75rem',
                background: 'rgba(255,255,255,0.03)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                fontSize: '0.7rem',
                color: 'var(--text-muted)'
              }}
            >
              <span>{language || 'code'}</span>
              <button
                onClick={() => copyToClipboard(codeText, 'Code snippet copied!')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--secondary)',
                  cursor: 'pointer',
                  fontSize: '0.7rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <Copy size={12} /> Copy
              </button>
            </div>
            <pre style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#a7f3d0', padding: '0.75rem', margin: 0, overflowX: 'auto', whiteSpace: 'pre' }}>
              <code>{codeText}</code>
            </pre>
          </div>
        );
      }

      // Process normal text block line by line for Markdown headers, lists, dividers
      const lines = part.split('\n');
      const renderedLines = [];

      lines.forEach((line, lIdx) => {
        const trimmed = line.trim();

        // 1. Horizontal Rule: --- or ***
        if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
          renderedLines.push(
            <hr
              key={`hr-${lIdx}`}
              style={{
                border: 'none',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                margin: '0.75rem 0'
              }}
            />
          );
          return;
        }

        // 2. Headers: #, ##, ###, ####
        const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);
        if (headerMatch) {
          const level = headerMatch[1].length;
          const headerText = headerMatch[2];
          const fontSize = level === 1 ? '1.1rem' : level === 2 ? '1.02rem' : level === 3 ? '0.95rem' : '0.875rem';
          const marginTop = lIdx === 0 ? '0.25rem' : '0.75rem';

          renderedLines.push(
            <div
              key={`h-${lIdx}`}
              style={{
                fontSize,
                fontWeight: '700',
                color: '#ffffff',
                marginTop,
                marginBottom: '0.4rem',
                lineHeight: '1.3'
              }}
            >
              {renderInlineFormatted(headerText)}
            </div>
          );
          return;
        }

        // 3. Bullet list item: * Item, - Item, + Item
        const bulletMatch = line.match(/^(\s*)[*+-]\s+(.*)$/);
        if (bulletMatch) {
          const itemText = bulletMatch[2];
          renderedLines.push(
            <div
              key={`b-${lIdx}`}
              style={{
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'flex-start',
                margin: '0.25rem 0 0.25rem 0.5rem',
                lineHeight: '1.5'
              }}
            >
              <span style={{ color: 'var(--primary-light)', fontSize: '0.9rem', lineHeight: '1.4' }}>•</span>
              <div style={{ flex: 1 }}>{renderInlineFormatted(itemText)}</div>
            </div>
          );
          return;
        }

        // 4. Numbered list item: 1. Item, 2. Item
        const numMatch = line.match(/^(\s*)(\d+)\.\s+(.*)$/);
        if (numMatch) {
          const num = numMatch[2];
          const itemText = numMatch[3];
          renderedLines.push(
            <div
              key={`n-${lIdx}`}
              style={{
                display: 'flex',
                gap: '0.4rem',
                alignItems: 'flex-start',
                margin: '0.25rem 0 0.25rem 0.5rem',
                lineHeight: '1.5'
              }}
            >
              <span style={{ color: 'var(--secondary)', fontWeight: '600', fontSize: '0.825rem' }}>{num}.</span>
              <div style={{ flex: 1 }}>{renderInlineFormatted(itemText)}</div>
            </div>
          );
          return;
        }

        // 5. Empty line (paragraph break)
        if (!trimmed) {
          renderedLines.push(<div key={`sp-${lIdx}`} style={{ height: '0.4rem' }} />);
          return;
        }

        // 6. Normal paragraph text
        renderedLines.push(
          <p
            key={`p-${lIdx}`}
            style={{
              margin: '0.25rem 0',
              lineHeight: '1.55',
              wordBreak: 'break-word',
              overflowWrap: 'anywhere'
            }}
          >
            {renderInlineFormatted(line)}
          </p>
        );
      });

      return <div key={`block-${pIdx}`}>{renderedLines}</div>;
    });
  };

  if (initialLoading) {
    return <LoadingSkeleton type="chat" />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      {/* Sidebar Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 1.25rem',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(255,255,255,0.01)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={16} style={{ color: 'var(--secondary)' }} />
          <h2 style={{ fontSize: '0.95rem', fontWeight: '700' }}>AI Coding Mentor</h2>
        </div>
        {messages.length > 0 && (
          <button 
            onClick={handleClearHistory}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            aria-label="Clear chat history"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Messages Scroll View */}
      <div style={{ flex: '1', overflowY: 'auto', overflowX: 'hidden', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }} aria-live="polite">
        {messages.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'var(--text-muted)',
            textAlign: 'center',
            gap: '1rem'
          }}>
            <MessageSquareDashed size={40} strokeWidth={1.5} />
            <div>
              <h3 style={{ fontSize: '0.9rem', color: '#fff', marginBottom: '0.25rem' }}>Ask your Mentor</h3>
              <p style={{ fontSize: '0.8rem', maxWidth: '240px' }}>Paste errors, review modern syntax, or seek advice to stay on track.</p>
            </div>
            {/* Suggested prompts list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', marginTop: '1rem' }}>
              {suggestedQuestions.map((q, idx) => (
                <button 
                  key={idx}
                  onClick={(e) => handleSend(e, q)}
                  style={{
                    background: 'rgba(12, 12, 24, 0.6)',
                    border: '1px solid #1c1c30',
                    borderRadius: '8px',
                    padding: '0.6rem 0.75rem',
                    fontSize: '0.775rem',
                    textAlign: 'left',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  className="chat-suggested-btn"
                >
                  <span>{q}</span>
                  <ArrowUpRight size={12} />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div 
              key={i} 
              style={{
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start',
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                maxWidth: '92%',
                wordBreak: 'break-word',
                overflowWrap: 'anywhere'
              }}
            >
              {/* Bubble */}
              <div style={{
                background: msg.role === 'user' ? 'var(--primary-gradient)' : 'rgba(18, 18, 32, 0.85)',
                color: msg.role === 'user' ? '#fff' : 'var(--text-main)',
                border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.05)',
                padding: '0.75rem 1rem',
                borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                fontSize: '0.875rem',
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
                maxWidth: '100%'
              }}>
                {renderMessageContent(msg.content)}
              </div>
            </div>
          ))
        )}

        {/* Blinking Typing Indicator */}
        {loading && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', maxWidth: '85%' }}>
            <div style={{
              background: 'rgba(18, 18, 32, 0.85)',
              border: '1px solid rgba(255,255,255,0.05)',
              padding: '0.75rem 1.25rem',
              borderRadius: '12px 12px 12px 4px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
              <span className="dot" style={{ width: '6px', height: '6px', background: 'var(--text-muted)', borderRadius: '50%', animation: 'blink 1.4s infinite' }}></span>
              <span className="dot" style={{ width: '6px', height: '6px', background: 'var(--text-muted)', borderRadius: '50%', animation: 'blink 1.4s infinite 0.2s' }}></span>
              <span className="dot" style={{ width: '6px', height: '6px', background: 'var(--text-muted)', borderRadius: '50%', animation: 'blink 1.4s infinite 0.4s' }}></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form Footer */}
      <form onSubmit={handleSend} style={{
        padding: '1rem',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(255,255,255,0.01)',
        display: 'flex',
        gap: '0.5rem'
      }}>
        <textarea
          className="input"
          placeholder="Ask a doubt or paste error..."
          rows="1"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend(e);
            }
          }}
          style={{
            resize: 'none',
            minHeight: '40px',
            maxHeight: '120px',
            padding: '0.65rem 0.75rem',
            borderRadius: '8px',
            background: '#07070f'
          }}
        />
        <button 
          className="btn btn-primary"
          type="submit"
          style={{ padding: '0 1rem', height: '40px', borderRadius: '8px' }}
          disabled={loading || !inputText.trim()}
          aria-label="Send message"
        >
          <Send size={16} />
        </button>
      </form>

      <style>{`
        .chat-suggested-btn {
          transition: all var(--transition-fast);
        }
        .chat-suggested-btn:hover {
          border-color: var(--secondary) !important;
          color: #fff !important;
          background: rgba(6, 182, 212, 0.03) !important;
        }
        @keyframes blink {
          0%, 100% { opacity: 0.2; }
          20% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
