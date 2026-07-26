import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { User, ShieldAlert, KeyRound, Info, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ConfirmModal from './ConfirmModal';

export default function SettingsPanel() {
  const { user, logout, updateProfile } = useAuth();
  
  // Profile update form
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password update form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  // Delete account confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !email.trim()) return;

    try {
      setProfileLoading(true);
      await updateProfile(username, email);
    } catch (err) {
      console.error(err);
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) return;

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      setPwdLoading(true);
      await api.put('/api/auth/password', { currentPassword, newPassword });
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setPwdLoading(false);
    }
  };

  const confirmDeleteAccount = async () => {
    try {
      setIsDeletingAccount(true);
      await api.delete('/api/auth/account');
      toast.success('Your account has been deleted.');
      window.location.hash = '#/';
      // Reload page to clear any remaining in-memory caches
      window.location.reload();
    } catch (err) {
      toast.error(err.message || 'Failed to delete account');
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="container" style={{ marginTop: '3rem', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Account Settings</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Manage your profile credentials and account configuration.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.5rem' }}>
        
        {/* Profile Details Panel */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
            <User size={20} style={{ color: 'var(--secondary)' }} />
            <h2 style={{ fontSize: '1.25rem' }}>Profile Information</h2>
          </div>

          <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="input-group">
              <label className="input-label" htmlFor="settings-username">Username</label>
              <input 
                id="settings-username"
                className="input" 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={user?.authProvider === 'google'}
              />
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="settings-email">Email Address</label>
              <input 
                id="settings-email"
                className="input" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={user?.authProvider === 'google'}
              />
            </div>

            {user?.authProvider === 'google' && (
              <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.1)', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <Info size={16} style={{ color: 'var(--secondary)', flexShrink: 0, marginTop: '0.1rem' }} />
                <span>This profile is managed through Google Sign-In. Email and username changes are disabled.</span>
              </div>
            )}

            {user?.authProvider !== 'google' && (
              <button className="btn btn-primary" type="submit" style={{ alignSelf: 'flex-start' }} disabled={profileLoading}>
                {profileLoading ? 'Saving...' : 'Save Profile'}
              </button>
            )}
          </form>
        </div>

        {/* Change Password Panel */}
        {user?.authProvider === 'local' && (
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
              <KeyRound size={20} style={{ color: 'var(--primary)' }} />
              <h2 style={{ fontSize: '1.25rem' }}>Change Password</h2>
            </div>

            <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="input-group">
                <label className="input-label" htmlFor="settings-current-pwd">Current Password</label>
                <input 
                  id="settings-current-pwd"
                  className="input" 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="settings-new-pwd">New Password</label>
                <input 
                  id="settings-new-pwd"
                  className="input" 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="settings-confirm-pwd">Confirm New Password</label>
                <input 
                  id="settings-confirm-pwd"
                  className="input" 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button className="btn btn-primary" type="submit" style={{ alignSelf: 'flex-start' }} disabled={pwdLoading}>
                {pwdLoading ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}

        {/* Danger Zone Panel */}
        <div className="card" style={{ padding: '2rem', border: '1px solid rgba(244, 63, 94, 0.25)', background: 'rgba(244, 63, 94, 0.02)' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
            <ShieldAlert size={20} style={{ color: 'var(--danger)' }} />
            <h2 style={{ fontSize: '1.25rem', color: 'var(--danger)' }}>Danger Zone</h2>
          </div>
          
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Deleting your account will permanently wipe your user credentials, active project workspaces, step checkpoints, and mentoring chat logs. This action is immediate and irreversible.
          </p>

          <button className="btn btn-danger" onClick={() => setShowDeleteModal(true)} style={{ display: 'inline-flex', gap: '0.5rem' }}>
            <Trash2 size={16} /> Delete Account
          </button>
        </div>

      </div>

      {/* Account Deletion Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteAccount}
        title="Delete Account"
        message="WARNING: Deleting your account will permanently wipe your credentials, active project workspaces, step checkpoints, and chat logs. This action CANNOT be undone."
        confirmText="Permanently Delete Account"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeletingAccount}
      />
    </div>
  );
}
