import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Trash2, X, AlertCircle } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Delete",
  cancelText = "Cancel",
  variant = "danger", // 'danger' | 'warning' | 'primary'
  isLoading = false
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose, isLoading]);

  if (!isOpen) return null;

  const isDanger = variant === 'danger';
  const isWarning = variant === 'warning';

  return (
    <div className="modal-overlay" onClick={isLoading ? undefined : onClose}>
      <div
        className="card"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '2.25rem 2rem',
          background: '#0c0c18',
          border: isDanger
            ? '1px solid rgba(244, 63, 94, 0.35)'
            : isWarning
            ? '1px solid rgba(245, 158, 11, 0.35)'
            : '1px solid rgba(124, 58, 237, 0.35)',
          boxShadow: isDanger
            ? '0 0 30px rgba(244, 63, 94, 0.2), 0 20px 40px rgba(0, 0, 0, 0.6)'
            : '0 0 30px rgba(124, 58, 237, 0.2), 0 20px 40px rgba(0, 0, 0, 0.6)',
          borderRadius: 'var(--radius-md)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '1.25rem',
          animation: 'slideUp var(--transition-fast) forwards'
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        {/* Close Button */}
        {!isLoading && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              right: '1.25rem',
              top: '1.25rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            }}
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
        )}

        {/* Icon Header Badge */}
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: isDanger
            ? 'rgba(244, 63, 94, 0.12)'
            : isWarning
            ? 'rgba(245, 158, 11, 0.12)'
            : 'rgba(124, 58, 237, 0.12)',
          border: isDanger
            ? '1px solid rgba(244, 63, 94, 0.3)'
            : isWarning
            ? '1px solid rgba(245, 158, 11, 0.3)'
            : '1px solid rgba(124, 58, 237, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isDanger ? 'var(--danger)' : isWarning ? 'var(--warning)' : 'var(--primary)',
          boxShadow: isDanger
            ? '0 0 20px rgba(244, 63, 94, 0.25)'
            : '0 0 20px rgba(124, 58, 237, 0.25)'
        }}>
          {isDanger ? <Trash2 size={26} /> : isWarning ? <AlertTriangle size={26} /> : <AlertCircle size={26} />}
        </div>

        {/* Header Text */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h3 id="confirm-modal-title" style={{ fontSize: '1.3rem', fontWeight: '700', color: '#fff', letterSpacing: '-0.02em' }}>
            {title}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', width: '100%', marginTop: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            disabled={isLoading}
            style={{ flex: 1, padding: '0.75rem 1rem', fontSize: '0.9rem', borderRadius: 'var(--radius-sm)' }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={isDanger ? "btn btn-danger" : "btn btn-primary"}
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              fontSize: '0.9rem',
              fontWeight: '600',
              borderRadius: 'var(--radius-sm)',
              boxShadow: isDanger ? '0 4px 14px rgba(244, 63, 94, 0.35)' : undefined
            }}
          >
            {isLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                <span className="spinner-border" style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                Processing...
              </span>
            ) : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
