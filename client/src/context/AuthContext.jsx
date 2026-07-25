import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../utils/api';
import { toast } from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on initial load
  const checkAuth = async () => {
    try {
      const data = await api.get('/api/auth/me');
      if (data && data.user) {
        setUser(data.user);
      }
    } catch (err) {
      // Quiet fail - means user has no active session cookie
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    // Listen for global unauthorized intercepts from api.js
    const handleAuthExpired = () => {
      setUser(null);
      toast.error('Session expired. Please log in again.');
    };

    window.addEventListener('auth-expired', handleAuthExpired);
    return () => {
      window.removeEventListener('auth-expired', handleAuthExpired);
    };
  }, []);

  const signup = async (username, email, password) => {
    try {
      setLoading(true);
      const data = await api.post('/api/auth/signup', { username, email, password });
      setUser(data.user);
      toast.success(data.message || 'Account created successfully!');
      return data.user;
    } catch (err) {
      toast.error(err.message || 'Signup failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const data = await api.post('/api/auth/login', { email, password });
      setUser(data.user);
      toast.success(data.message || 'Logged in successfully!');
      return data.user;
    } catch (err) {
      toast.error(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (idToken) => {
    try {
      setLoading(true);
      const data = await api.post('/api/auth/google', { idToken });
      setUser(data.user);
      toast.success(data.message || 'Signed in with Google!');
      return data.user;
    } catch (err) {
      toast.error(err.message || 'Google authentication failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout', {});
      setUser(null);
      toast.success('Logged out successfully');
    } catch (err) {
      toast.error('Failed to log out');
    }
  };

  const updateProfile = async (username, email) => {
    try {
      const data = await api.put('/api/auth/profile', { username, email });
      setUser(data.user);
      toast.success('Profile updated successfully');
      return data.user;
    } catch (err) {
      toast.error(err.message || 'Profile update failed');
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signup,
        login,
        googleLogin,
        logout,
        updateProfile,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
export default AuthContext;
