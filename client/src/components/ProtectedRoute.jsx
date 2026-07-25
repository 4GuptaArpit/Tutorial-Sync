import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import LoadingSkeleton from './LoadingSkeleton';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      // If unauthorized, redirect to home page hash and dispatch event to pop Auth Modal
      window.location.hash = '#/';
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('open-login-modal'));
      }, 100);
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="container" style={{ marginTop: '3rem' }}>
        <LoadingSkeleton type="dashboard" />
      </div>
    );
  }

  // Only render children if user authenticated
  return user ? <>{children}</> : null;
}
