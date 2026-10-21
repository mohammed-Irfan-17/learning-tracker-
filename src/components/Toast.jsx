import React from 'react';

/**
 * Toast notification component
 */
export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const typeClass = toast.type === 'error' ? 'toast--error' : toast.type === 'info' ? 'toast--info' : 'toast--success';
  const icon = toast.type === 'error' ? '⚠️' : toast.type === 'info' ? 'ℹ️' : '✅';

  return (
    <div className={`toast ${typeClass}`} role="alert">
      <span className="toast__icon">{icon}</span>
      <span className="toast__message">{toast.message}</span>
      <button className="toast__close" onClick={onClose} aria-label="Close notification">
        &times;
      </button>
    </div>
  );
}
