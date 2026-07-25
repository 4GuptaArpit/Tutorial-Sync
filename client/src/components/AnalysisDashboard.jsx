import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { downloadMarkdown } from '../utils/export';
import { ArrowLeft, MessageSquare, Code, Download, PlayCircle, Settings2, Trash2 } from 'lucide-react';
import LoadingSkeleton from './LoadingSkeleton';

// Sub panels
import OverviewPanel from './OverviewPanel';
import DiffViewer from './DiffViewer';
import StepGuide from './StepGuide';
import ChatAssistant from './ChatAssistant';
import CodePlayground from './CodePlayground';

export default function AnalysisDashboard({ projectId }) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Interactive Panels toggles
  const [chatOpen, setChatOpen] = useState(true);
  const [playgroundOpen, setPlaygroundOpen] = useState(false);

  const analyzingRef = React.useRef(false);

  useEffect(() => {
    analyzingRef.current = false;
    fetchProjectAndAnalyze();
  }, [projectId]);

  const fetchProjectAndAnalyze = async () => {
    try {
      setLoading(true);
      setError('');
      
      // 1. Fetch project meta
      let data = await api.get(`/api/projects/${projectId}`);
      setProject(data.project);

      // 2. If status is pending, trigger Gemini analysis immediately (guard against duplicate calls)
      if (data.project.status === 'pending' && !analyzingRef.current) {
        analyzingRef.current = true;
        const analyzeData = await api.post(`/api/projects/${projectId}/analyze`, {});
        setProject(analyzeData.project);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch project workspace');
    } finally {
      setLoading(false);
    }
  };

  // Sync checklist changes with Mongoose backend
  const handleStepToggle = async (stepId, completed) => {
    if (!project) return;
    
    // Optimistic local state update for snappy UI
    const updatedSteps = project.steps.map(step => 
      step._id === stepId ? { ...step, completed } : step
    );
    setProject({ ...project, steps: updatedSteps });

    try {
      const res = await api.put(`/api/projects/${projectId}`, {
        steps: [{ _id: stepId, completed }]
      });
      if (res && res.project) {
        setProject(res.project);
      }
    } catch (err) {
      console.error('Failed to sync step state:', err);
      // Revert if error
      fetchProjectAndAnalyze();
    }
  };

  // Trigger server-side Markdown compilation
  const handleExport = async () => {
    try {
      const markdown = await api.get(`/api/projects/${projectId}/export`);
      downloadMarkdown(markdown, projectId, project.title);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ marginTop: '3rem' }}>
        <LoadingSkeleton type="guide" />
      </div>
    );
  }

  if (error || (project && project.status === 'error')) {
    const rawError = error || project?.errorMessage || 'An error occurred during the analysis.';
    const isRateLimit = rawError.includes('Rate Limit') || rawError.includes('429') || rawError.includes('Quota');

    return (
      <div className="container" style={{ marginTop: '4rem', maxWidth: '600px' }}>
        <div className="card" style={{ 
          padding: '2.5rem 2rem', 
          border: isRateLimit ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(244, 63, 94, 0.2)', 
          textAlign: 'center', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1.5rem' 
        }}>
          <h2 style={{ color: isRateLimit ? '#f59e0b' : 'var(--danger)' }}>
            {isRateLimit ? '⏳ Gemini API Quota Limit Reached' : 'Analysis Failed'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
            {isRateLimit 
              ? 'Google Gemini free tier allows ~15-20 requests per minute. You reached the temporary quota limit. Please wait ~30 seconds and click Try Again.' 
              : rawError}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn btn-ghost" onClick={() => window.location.hash = '#/'}>
              <ArrowLeft size={16} /> Back Dashboard
            </button>
            <button className="btn btn-primary" onClick={fetchProjectAndAnalyze}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (project && project.status === 'analyzing') {
    return (
      <div className="container" style={{ marginTop: '5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
        <div style={{ position: 'relative' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '4px solid rgba(124, 58, 237, 0.1)', borderTopColor: 'var(--primary)', animation: 'spin 1s linear infinite' }}></div>
        </div>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>AI Workspace Analyzing</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem', maxWidth: '400px' }}>
            Gemini is scanning the tutorial dependencies, mapping deprecated APIs, and generating modernized code structures...
          </p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 70px)', overflow: 'hidden' }}>
      
      {/* Left Workspace Panel */}
      <div style={{ flex: '1', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '1.5rem' }}>
        
        {/* Workspace Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', overflow: 'hidden' }}>
            <button 
              className="btn btn-ghost" 
              onClick={() => window.location.hash = '#/'}
              style={{ padding: '0.5rem', borderRadius: '50%' }}
              aria-label="Back to dashboard"
            >
              <ArrowLeft size={18} />
            </button>
            <div style={{ overflow: 'hidden' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: '800', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{project.title}</h1>
              {project.sourceUrl && (
                <a href={project.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  Original YouTube Link <PlayCircle size={12} />
                </a>
              )}
            </div>
          </div>

          {/* Action Tools */}
          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
            <button className="btn btn-ghost" onClick={() => setPlaygroundOpen(!playgroundOpen)} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              <Code size={16} /> Playground
            </button>
            <button className="btn btn-ghost" onClick={handleExport} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              <Download size={16} /> Export
            </button>
            <button 
              className={`btn ${chatOpen ? 'btn-primary' : 'btn-ghost'}`} 
              onClick={() => setChatOpen(!chatOpen)}
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              <MessageSquare size={16} /> AI Mentor
            </button>
          </div>
        </div>

        {/* Dynamic Tab Bar */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
          {['overview', 'code-diffs', 'steps', 'resources'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.5rem 1rem',
                color: activeTab === tab ? '#fff' : 'var(--text-muted)',
                fontWeight: '600',
                cursor: 'pointer',
                borderBottom: activeTab === tab ? '2px solid var(--primary)' : 'none',
                textTransform: 'capitalize'
              }}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Scrollable Document Area */}
        <div style={{ flex: '1', overflowY: 'auto', paddingRight: '0.5rem' }}>
          {activeTab === 'overview' && <OverviewPanel overview={project.overview} />}
          {activeTab === 'code-diffs' && <DiffViewer diffs={project.diffs} />}
          {activeTab === 'steps' && <StepGuide steps={project.steps} onToggle={handleStepToggle} />}
          {activeTab === 'resources' && (
            <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h2>Useful Resources</h2>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', listStyle: 'none' }}>
                {project.resources.map((r, i) => (
                  <li key={i}>
                    <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
                      {r.title} <span style={{ fontSize: '0.75rem', padding: '0.1rem 0.4rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', textTransform: 'uppercase' }}>{r.type}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Code Playground Split Screen Overlay Drawer */}
      {playgroundOpen && (
        <div style={{
          position: 'fixed',
          top: '70px',
          right: chatOpen ? '400px' : '0',
          width: '500px',
          height: 'calc(100vh - 70px)',
          background: 'rgba(12,12,24,0.98)',
          borderLeft: '1px solid rgba(255,255,255,0.05)',
          zIndex: 90,
          animation: 'slideUp var(--transition-fast) forwards'
        }}>
          <CodePlayground onClose={() => setPlaygroundOpen(false)} />
        </div>
      )}

      {/* Collapsible right sidebar assistant */}
      {chatOpen && (
        <div style={{
          width: '400px',
          height: '100%',
          borderLeft: '1px solid rgba(255,255,255,0.05)',
          background: '#0a0a14',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0
        }}>
          <ChatAssistant projectId={projectId} />
        </div>
      )}
    </div>
  );
}
