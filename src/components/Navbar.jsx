import React from 'react';

/**
 * Top Navigation Header
 */
export default function Navbar({
  activeTab,
  onTabChange,
  isApiConfigured,
  onOpenLogModal,
  onOpenConceptsModal,
  onOpenSettingsModal
}) {
  return (
    <header className="app-header">
      <div className="app-header__container">
        <div className="app-header__left">
          <div className="app-header__brand" onClick={() => onTabChange('dashboard')}>
            <span className="app-header__logo">📚</span>
            <div className="app-header__titles">
              <span className="app-header__title">LearnerTracker</span>
              <span className="app-header__subtitle">Google Sheets Edition</span>
            </div>
          </div>

          <nav className="app-header__nav">
            <button
              type="button"
              className={`nav-link ${activeTab === 'dashboard' ? 'nav-link--active' : ''}`}
              onClick={() => onTabChange('dashboard')}
            >
              Dashboard
            </button>
            <button
              type="button"
              className={`nav-link ${activeTab === 'investments' ? 'nav-link--active' : ''}`}
              onClick={() => onTabChange('investments')}
            >
              Investments
            </button>
            <button
              type="button"
              className={`nav-link ${activeTab === 'history' ? 'nav-link--active' : ''}`}
              onClick={() => onTabChange('history')}
            >
              Learning History
            </button>
          </nav>
        </div>

        <div className="app-header__right">
          {/* Connection Status Button */}
          <button
            type="button"
            className={`status-pill ${isApiConfigured ? 'status-pill--connected' : 'status-pill--warning'}`}
            onClick={onOpenSettingsModal}
            title={isApiConfigured ? 'Google Sheets API Connected - Click to configure' : 'Google Sheets API Setup Needed - Click to configure'}
          >
            <span className="status-pill__dot"></span>
            <span className="status-pill__text">
              {isApiConfigured ? 'Sheets Connected' : 'Setup Sheets'}
            </span>
          </button>

          {/* Quick Action Buttons */}
          <button
            type="button"
            className="btn btn--outline btn--sm"
            onClick={onOpenConceptsModal}
          >
            💡 Add Concepts
          </button>
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={onOpenLogModal}
          >
            ⏱️ Log Time
          </button>
        </div>
      </div>
    </header>
  );
}
