import React from 'react';

/**
 * Reusable confirmation dialog for dangerous actions like deletion.
 */
export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Delete', isBusy = false }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-box modal-box--confirm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title modal-title--danger">{title || 'Confirm Action'}</h3>
          <button className="modal-close-btn" onClick={onCancel} disabled={isBusy} aria-label="Close">
            &times;
          </button>
        </div>
        <div className="modal-body">
          <p className="modal-message">{message || 'Are you sure you want to proceed?'}</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn--outline" onClick={onCancel} disabled={isBusy}>
            Cancel
          </button>
          <button className="btn btn--danger" onClick={onConfirm} disabled={isBusy}>
            {isBusy ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
