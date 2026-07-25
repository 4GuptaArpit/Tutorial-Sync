import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import { api } from './utils/api';

// Core UI Layout
import Navbar from './components/Navbar';
import LoadingSkeleton from './components/LoadingSkeleton';

// Pages & Modals (Standard Load)
import HomeDashboard from './components/HomeDashboard';
import SettingsPanel from './components/SettingsPanel';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './components/NotFound';

// Heavy Interactive Panels (Lazy Loaded)
const AnalysisDashboard = lazy(() => import('./components/AnalysisDashboard'));

export default function App() {
  const { checkAuth } = useAuth();
  const [currentRoute, setCurrentRoute] = useState(window.location.hash || '#/');
  const [serverWaking, setServerWaking] = useState(false);

  // Parse routing parameters
  const getRouteInfo = (hash) => {
    if (hash.startsWith('#/project/')) {
      const parts = hash.split('/');
      return { page: 'project', id: parts[2] };
    }
    if (hash === '#/settings') {
      return { page: 'settings' };
    }
    if (hash === '#/' || hash === '') {
      return { page: 'home' };
    }
    return { page: '404' };
  };

  useEffect(() => {
    // 1. Health check to handle Render cold starts
    let wakeToastId = null;
    const checkServerHealth = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        setServerWaking(true);
        wakeToastId = toast.loading('Waking up server & cloud database (Render Free Tier)... This may take 30-40 seconds.', {
          duration: Infinity,
          position: 'top-center'
        });
      }, 2500);

      try {
        await api.get('/api/health');
        clearTimeout(timeoutId);
        if (wakeToastId) {
          toast.dismiss(wakeToastId);
          toast.success('Connected to backend API server successfully!');
        }
        setServerWaking(false);
      } catch (err) {
        clearTimeout(timeoutId);
        console.error('Server health check failed:', err);
      }
    };

    checkServerHealth();

    // 2. Routing listener
    const handleHashChange = () => {
      setCurrentRoute(window.location.hash || '#/');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const route = getRouteInfo(currentRoute);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      {/* Global Toast Stack */}
      <Toaster 
        toastOptions={{
          className: 'toast-custom',
          style: {
            background: '#121226',
            color: '#fafafa',
            border: '1px solid rgba(124, 58, 237, 0.25)',
            borderRadius: '8px'
          }
        }}
      />

      <main style={{ flex: '1', display: 'flex', flexDirection: 'column', paddingBottom: '3rem' }}>
        <Suspense fallback={
          <div className="container" style={{ marginTop: '2rem' }}>
            <LoadingSkeleton type="dashboard" />
          </div>
        }>
          {route.page === 'home' && <HomeDashboard />}
          
          {route.page === 'project' && (
            <ProtectedRoute>
              <AnalysisDashboard projectId={route.id} />
            </ProtectedRoute>
          )}

          {route.page === 'settings' && (
            <ProtectedRoute>
              <SettingsPanel />
            </ProtectedRoute>
          )}

          {route.page === '404' && <NotFound />}
        </Suspense>
      </main>
    </div>
  );
}
