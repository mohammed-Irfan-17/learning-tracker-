import React, { useState } from 'react';

/**
 * Top Navigation Header with Mobile Hamburger Menu
 */
export default function Navbar({
  activeTab,
  onTabChange,
  isApiConfigured,
  onOpenLogModal,
  onOpenConceptsModal,
  onOpenSettingsModal
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const handleTabClick = (tab) => {
    onTabChange(tab);
    setIsMobileMenuOpen(false);
  };

  const handleActionClick = (actionFn) => {
    actionFn();
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="app-header">
      <div className="app-header__container">
        {/* Brand Logo & Title */}
        <div className="app-header__brand" onClick={() => handleTabClick('dashboard')}>
          <span className="app-header__logo">📚</span>
          <div className="app-header__titles">
            <span className="app-header__title">LearnerTracker</span>
            <span className="app-header__subtitle">Google Sheets Edition</span>
          </div>
        </div>

        {/* Mobile Hamburger Toggle Button (3 horizontal lines) */}
        <button
          type="button"
          className={`hamburger-btn ${isMobileMenuOpen ? 'hamburger-btn--open' : ''}`}
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMobileMenuOpen}
        >
          <span className="hamburger-bar"></span>
          <span className="hamburger-bar"></span>
          <span className="hamburger-bar"></span>
        </button>

        {/* Header Menu Content (Desktop inline / Mobile toggleable) */}
        <div className={`app-header__menu ${isMobileMenuOpen ? 'app-header__menu--open' : ''}`}>
          {/* Navigation Links */}
          <nav className="app-header__nav">
            <button
              type="button"
              className={`nav-link ${activeTab === 'dashboard' ? 'nav-link--active' : ''}`}
              onClick={() => handleTabClick('dashboard')}
            >
              Dashboard
            </button>
            <button
              type="button"
              className={`nav-link ${activeTab === 'investments' ? 'nav-link--active' : ''}`}
              onClick={() => handleTabClick('investments')}
            >
              Investments
            </button>
            <button
              type="button"
              className={`nav-link ${activeTab === 'history' ? 'nav-link--active' : ''}`}
              onClick={() => handleTabClick('history')}
            >
              Learning History
            </button>
          </nav>

          {/* Header Right Actions */}
          <div className="app-header__right">
            {/* Connection Status Button */}
            <button
              type="button"
              className={`status-pill ${isApiConfigured ? 'status-pill--connected' : 'status-pill--warning'}`}
              onClick={() => handleActionClick(onOpenSettingsModal)}
              title={
                isApiConfigured
                  ? 'Google Sheets API Connected - Click to configure'
                  : 'Google Sheets API Setup Needed - Click to configure'
              }
            >
              <span className="status-pill__dot"></span>
              <span className="status-pill__text">
                {isApiConfigured ? 'Sheets Connected' : 'Setup Sheets'}
              </span>
            </button>

            {/* Quick Action Buttons */}
            <div className="app-header__actions">
              <button
                type="button"
                className="btn btn--outline btn--sm btn--header-action"
                onClick={() => handleActionClick(onOpenConceptsModal)}
              >
                💡 Add Concepts
              </button>
              <button
                type="button"
                className="btn btn--primary btn--sm btn--header-action"
                onClick={() => handleActionClick(onOpenLogModal)}
              >
                ⏱️ Log Time
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
