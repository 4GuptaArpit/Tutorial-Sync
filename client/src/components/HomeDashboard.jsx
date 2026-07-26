import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { validateYouTubeURL } from '../utils/sanitize';
import { Play, BookOpen, Trash2, ArrowRight, Sparkles, Youtube, CheckSquare, Clock } from 'lucide-react';
import AuthModal from './AuthModal';
import LoadingSkeleton from './LoadingSkeleton';
import ConfirmModal from './ConfirmModal';

export default function HomeDashboard() {
  const { user } = useAuth();
  
  // Delete confirm modal state
  const [deleteProjectId, setDeleteProjectId] = useState(null);
  const [deletingProject, setDeletingProject] = useState(false);
  
  // Link Refresh mode states
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [urlLoading, setUrlLoading] = useState(false);

  // Tech Guide mode states
  const [guideTopic, setGuideTopic] = useState('');
  const [guideError, setGuideError] = useState('');
  const [guideLoading, setGuideLoading] = useState(false);

  // Projects list states
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (user) {
      fetchProjects(page);
    }
  }, [user, page]);

  const fetchProjects = async (pageNum) => {
    try {
      setLoadingProjects(true);
      const data = await api.get(`/api/projects?page=${pageNum}&limit=6`);
      setProjects(data.projects || []);
      setTotalPages(data.pagination.pages || 1);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoadingProjects(false);
    }
  };

  // Submit YouTube Link (Mode 1)
  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    setUrlError('');

    if (!user) {
      window.dispatchEvent(new CustomEvent('open-login-modal'));
      return;
    }

    if (!validateYouTubeURL(youtubeUrl)) {
      setUrlError('Please enter a valid YouTube video URL');
      return;
    }

    try {
      setUrlLoading(true);
      const data = await api.post('/api/projects', {
        type: 'tutorial-refresh',
        sourceUrl: youtubeUrl
      });
      
      // Navigate to project analysis workspace
      window.location.hash = `#/project/${data.project._id}`;
    } catch (err) {
      setUrlError(err.message || 'Failed to create project workspace');
    } finally {
      setUrlLoading(false);
    }
  };

  // Submit Tech Guide Topic (Mode 2)
  const handleGuideSubmit = async (e, topicOverride = '') => {
    if (e) e.preventDefault();
    setGuideError('');
    const finalTopic = topicOverride || guideTopic;

    if (!finalTopic.trim()) return;

    if (!user) {
      window.dispatchEvent(new CustomEvent('open-login-modal'));
      return;
    }

    try {
      setGuideLoading(true);
      const data = await api.post('/api/projects', {
        type: 'tech-guide',
        title: finalTopic,
        topic: finalTopic
      });

      // Navigate to project analysis workspace
      window.location.hash = `#/project/${data.project._id}`;
    } catch (err) {
      console.error(err);
      setGuideError(err.message || 'Failed to create tech guide workspace');
    } finally {
      setGuideLoading(false);
    }
  };

  // Delete Project Workspace
  const handleOpenDeleteModal = (id, event) => {
    event.stopPropagation();
    setDeleteProjectId(id);
  };

  const handleConfirmDeleteProject = async () => {
    if (!deleteProjectId) return;
    setDeletingProject(true);
    try {
      await api.delete(`/api/projects/${deleteProjectId}`);
      fetchProjects(page);
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingProject(false);
      setDeleteProjectId(null);
    }
  };

  // Demo Project shortcut for Guest view
  const handleDemoClick = (templateType, title, url = '') => {
    if (!user) {
      window.dispatchEvent(new CustomEvent('open-login-modal'));
      return;
    }
    
    // Auto-fill inputs and submit
    if (templateType === 'tutorial-refresh') {
      setYoutubeUrl(url);
      // Wait a tick then submit
      setTimeout(() => {
        const fakeEvent = { preventDefault: () => {} };
        // Trigger manually
        api.post('/api/projects', { type: 'tutorial-refresh', sourceUrl: url }).then(data => {
          window.location.hash = `#/project/${data.project._id}`;
        });
      }, 100);
    } else {
      setGuideTopic(title);
      setTimeout(() => {
        api.post('/api/projects', { type: 'tech-guide', title, topic: title }).then(data => {
          window.location.hash = `#/project/${data.project._id}`;
        });
      }, 100);
    }
  };

  return (
    <div className="container" style={{ marginTop: '3.5rem', display: 'flex', flexDirection: 'column', gap: '4rem' }}>
      
      {/* Hero Section */}
      <section style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'slideUp var(--transition-normal) forwards' }}>
        <div style={{ display: 'inline-flex', alignSelf: 'center', alignItems: 'center', gap: '0.5rem', background: 'rgba(124, 58, 237, 0.08)', border: '1px solid rgba(124, 58, 237, 0.2)', padding: '0.5rem 1rem', borderRadius: '9999px', fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '600' }}>
          <Sparkles size={14} style={{ color: 'var(--secondary)' }} />
          <span>Vibrant 2026 Ready Developer Platform</span>
        </div>
        <h1 style={{ fontSize: '3.25rem', fontWeight: '800', lineHeight: '1.15', letterSpacing: '-0.04em' }}>
          Tutorials go out of date.<br />
          <span style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            We modernize them.
          </span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', maxWidth: '600px', margin: '0 auto' }}>
          Paste any YouTube tutorial URL or enter a technology topic. Get updated split-code diffs, dependency blueprints, and an active AI mentor to guide your implementation.
        </p>
      </section>

      {/* Modes Grid */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Mode 1: YouTube Refresh */}
        <div className="card" style={{ padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)' }}>
              <Youtube size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem' }}>Refresh YouTube Video</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Analyze tutorial tech stacks for deprecations</p>
            </div>
          </div>
          <form onSubmit={handleUrlSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: 'auto' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <input 
                className="input" 
                type="text" 
                placeholder="https://www.youtube.com/watch?v=..." 
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                required
              />
              {urlError && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{urlError}</span>}
            </div>
            <button className="btn btn-primary" type="submit" disabled={urlLoading}>
              {urlLoading ? 'Extracting Metadata...' : 'Analyze Video'} <ArrowRight size={16} />
            </button>
          </form>
        </div>

        {/* Mode 2: Tech Guides */}
        <div className="card" style={{ padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }}>
              <BookOpen size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem' }}>Interactive Tech Guides</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Generate structured setup, models & skills rules</p>
            </div>
          </div>
          <form onSubmit={handleGuideSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: 'auto' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <input 
                className="input" 
                type="text" 
                placeholder="Google Antigravity 2.0, Next.js 15..." 
                value={guideTopic}
                onChange={(e) => setGuideTopic(e.target.value)}
                required
              />
              {guideError && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{guideError}</span>}
            </div>
            <button className="btn btn-secondary" type="submit" disabled={guideLoading}>
              {guideLoading ? 'Generating Guide...' : 'Generate Tech Guide'} <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </section>

      {/* User Dashboard / Recent Projects */}
      {user ? (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Recent Workspaces</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-ghost" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => fetchProjects(page)} disabled={loadingProjects}>
                Refresh List
              </button>
            </div>
          </div>

          {loadingProjects ? (
            <LoadingSkeleton type="dashboard" />
          ) : projects.length > 0 ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
                {projects.map((proj) => (
                  <div 
                    key={proj._id} 
                    className="card" 
                    onClick={() => window.location.hash = `#/project/${proj._id}`}
                    style={{ padding: '1.5rem', minHeight: '180px', display: 'flex', flexDirection: 'column', gap: '1rem', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                      <span className={`badge ${proj.type === 'tech-guide' ? 'badge-current' : 'badge-deprecated'}`} style={{ fontSize: '0.65rem' }}>
                        {proj.type === 'tech-guide' ? 'Tech Guide' : 'Tutorial Video'}
                      </span>
                      <button 
                        onClick={(e) => handleOpenDeleteModal(proj._id, e)}
                        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', transition: 'color 0.2s' }}
                        className="delete-icon-btn"
                        aria-label="Delete workspace"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', lineBreak: 'anywhere' }}>{proj.title}</h3>

                    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <CheckSquare size={12} /> {proj.progress}% Done
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={12} /> {new Date(proj.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${proj.progress}%`, height: '100%', background: 'linear-gradient(90deg, #7c3aed, #06b6d4)', borderRadius: '2px', transition: 'width 0.3s' }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
                  <button className="btn btn-ghost" onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}>
                    Prev
                  </button>
                  <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>Page {page} of {totalPages}</span>
                  <button className="btn btn-ghost" onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages}>
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <p>No active workspaces found. Paste a video link or choose a template below to get started.</p>
            </div>
          )}
        </section>
      ) : null}

      {/* Pre-loaded Templates Section (Interactive Seed Shortcuts) */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Quick Templates & Demo Studies</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          
          <div 
            className="card" 
            onClick={() => handleDemoClick('tutorial-refresh', 'Firebase v8 Auth Tutorial', 'https://www.youtube.com/watch?v=un9vSDFW8B4')}
            style={{ padding: '1.5rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
          >
            <div style={{ color: 'var(--danger)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Youtube size={20} />
              <span className="badge badge-deprecated">v8 → v9 modular</span>
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>Firebase Auth v8 Upgrade Study</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Upgrade instance-based auth triggers to modular functional SDK imports.</p>
          </div>

          <div 
            className="card" 
            onClick={() => handleDemoClick('tutorial-refresh', 'React Router v5 SPA', 'https://www.youtube.com/watch?v=lawju352qrc')}
            style={{ padding: '1.5rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
          >
            <div style={{ color: 'var(--danger)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Youtube size={20} />
              <span className="badge badge-deprecated">v5 → v6 routes</span>
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>React Router v5 Routing Study</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Refactor nested Switches, element props, redirects, and navigation hooks.</p>
          </div>

          <div 
            className="card" 
            onClick={() => handleDemoClick('tech-guide', 'Google Antigravity 2.0 Guide')}
            style={{ padding: '1.5rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
          >
            <div style={{ color: 'var(--secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <BookOpen size={20} />
              <span className="badge badge-current">New SDK 2.0</span>
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>Google Antigravity 2.0 Guide</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Master class-based initialization, skills, workspace definitions, and model selections.</p>
          </div>

        </div>
      </section>

      {/* Embedded CSS overrides for hover icons */}
      <style>{`
        .delete-icon-btn:hover {
          color: var(--danger) !important;
        }
      `}</style>

      {/* Auth Modal Mount */}
      <AuthModal />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteProjectId)}
        onClose={() => setDeleteProjectId(null)}
        onConfirm={handleConfirmDeleteProject}
        title="Delete Workspace"
        message="Are you sure you want to delete this project workspace and all associated chat logs? This action cannot be undone."
        confirmText="Delete Workspace"
        cancelText="Cancel"
        variant="danger"
        isLoading={deletingProject}
      />
    </div>
  );
}
