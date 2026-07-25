import React, { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { Send, Sparkles, Trash2, ArrowUpRight, MessageSquareDashed } from 'lucide-react';
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

  // Helper to parse Markdown inline tokens (**bold**, *italic*, `code`) cleanly into React nodes
  const renderFormattedText = (text) => {
    if (!text) return null;

    const lines = text.split('\n');

    return lines.map((line, lIdx) => {
      const tokens = [];
      let tokenKey = 0;

      // Regex matching **bold**, *italic*, or `code`
      const regex = /(\*\*(.*?)\*\*|\*(.*?)\*|`(.*?)`)/g;
      let lastIndex = 0;
      let match;

      while ((match = regex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          tokens.push(<span key={tokenKey++}>{line.substring(lastIndex, match.index)}</span>);
        }

        const fullMatch = match[0];
        if (fullMatch.startsWith('**')) {
          tokens.push(
            <strong key={tokenKey++} style={{ color: '#fff', fontWeight: '700' }}>
              {match[2]}
            </strong>
          );
        } else if (fullMatch.startsWith('`')) {
          tokens.push(
            <code
              key={tokenKey++}
              style={{
                background: 'rgba(6, 182, 212, 0.1)',
                color: 'var(--secondary)',
                padding: '0.15rem 0.35rem',
                borderRadius: '4px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                border: '1px solid rgba(6, 182, 212, 0.2)'
              }}
            >
              {match[4]}
            </code>
          );
        } else if (fullMatch.startsWith('*')) {
          tokens.push(
            <em key={tokenKey++} style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
              {match[3]}
            </em>
          );
        }

        lastIndex = regex.lastIndex;
      }

      if (lastIndex < line.length) {
        tokens.push(<span key={tokenKey++}>{line.substring(lastIndex)}</span>);
      }

      return (
        <p key={lIdx} style={{ margin: '0.25rem 0', whiteSpace: 'pre-wrap', lineHeight: '1.5', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
          {tokens}
        </p>
      );
    });
  };

  // Render content with code block and inline markdown formatting
  const renderMessageContent = (content) => {
    if (!content.includes('```')) {
      return renderFormattedText(content);
    }

    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        // Extract code lines (remove backticks and optional language label)
        const lines = part.slice(3, -3).trim().split('\n');
        const firstLine = lines[0].toLowerCase();
        const hasLang = ['javascript', 'js', 'html', 'css', 'bash', 'json'].includes(firstLine);
        const codeText = hasLang ? lines.slice(1).join('\n') : lines.join('\n');
        
        return (
          <div key={index} className="chat-code-block" style={{
            background: '#07070f',
            border: '1px solid #1c1c30',
            borderRadius: '6px',
            margin: '0.5rem 0',
            overflowX: 'auto',
            padding: '0.75rem'
          }}>
            <pre style={{ fontFamily: 'var(--font-mono)', fontSize: '0.775rem', color: '#a7f3d0', whiteSpace: 'pre' }}>
              <code>{codeText}</code>
            </pre>
          </div>
        );
      }
      return <div key={index}>{renderFormattedText(part)}</div>;
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
