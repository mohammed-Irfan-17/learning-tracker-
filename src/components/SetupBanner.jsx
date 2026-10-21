import React from 'react';

/**
 * Top alert banner informing the user that the Google Sheets backend needs to be connected.
 */
export default function SetupBanner({ onOpenSetup }) {
  return (
    <div className="setup-banner">
      <div className="setup-banner__content">
        <span className="setup-banner__icon">⚡</span>
        <div className="setup-banner__text">
          <strong>Google Sheets Connection Needed:</strong> Connect your Google Apps Script Web App URL to enable live persistence for investments, learning history, and daily concepts.
        </div>
      </div>
      <button type="button" className="btn btn--sm btn--primary" onClick={onOpenSetup}>
        Connect Google Sheets
      </button>
    </div>
  );
}
