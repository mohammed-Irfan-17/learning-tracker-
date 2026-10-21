import React, { useState } from 'react';
import { getScriptUrl, setScriptUrl } from '../services/storageConfig';
import { pingApi } from '../services/api';

/**
 * Settings & Connection modal to configure and test Google Apps Script Web App URL
 */
export default function SetupModal({ isOpen, onClose, onConfigSaved }) {
  const [url, setUrl] = useState(getScriptUrl());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!url.trim()) {
      setTestResult({ success: false, message: 'Please enter a Google Apps Script Web App URL first.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await pingApi(url.trim());
      setTestResult({
        success: true,
        message: res.message || 'Successfully connected to Google Apps Script Web App!'
      });
    } catch (err) {
      setTestResult({
        success: false,
        message: err.message || 'Failed to connect. Ensure your Web App is deployed with Access: "Anyone".'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    setScriptUrl(url.trim());
    if (onConfigSaved) onConfigSaved(url.trim());
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box modal-box--wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">⚙️ Google Sheets & Apps Script Connection</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-lead">
            The Personal Learner Tracker stores all records live in your Google Sheets database via a Google Apps Script Web App.
          </p>

          <div className="setup-guide-box">
            <h4 className="setup-guide-box__title">Quick 3-Minute Setup:</h4>
            <ol className="setup-guide-box__steps">
              <li>
                Create a new Google Sheet at{' '}
                <a href="https://sheets.new" target="_blank" rel="noopener noreferrer">
                  sheets.new ↗
                </a>
              </li>
              <li>
                In the Sheet menu, open <strong>Extensions &gt; Apps Script</strong> and paste the contents of{' '}
                <code>apps-script/Code.gs</code>.
              </li>
              <li>
                Click <strong>Deploy &gt; New deployment</strong>, select <strong>Web app</strong>, set <strong>Who has access: Anyone</strong>, click <strong>Deploy</strong>, and copy the Web App URL.
              </li>
            </ol>
          </div>

          <div className="form-group">
            <label htmlFor="script-url" className="form-label">
              Google Apps Script Web App URL:
            </label>
            <input
              id="script-url"
              type="url"
              placeholder="https://script.google.com/macros/s/AKfycb.../exec"
              className="form-input"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setTestResult(null);
              }}
            />
            <span className="form-hint">
              This can also be configured in <code>.env</code> as <code>VITE_GOOGLE_SCRIPT_URL</code>.
            </span>
          </div>

          {testResult && (
            <div className={`alert-banner ${testResult.success ? 'alert-banner--success' : 'alert-banner--error'}`}>
              <span>{testResult.success ? '✅' : '❌'}</span>
              <span>{testResult.message}</span>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={handleTestConnection}
            disabled={isTesting || !url.trim()}
          >
            {isTesting ? 'Testing Connection...' : '🔌 Test Connection'}
          </button>
          <div style={{ flex: 1 }}></div>
          <button type="button" className="btn btn--outline" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn--primary" onClick={handleSave}>
            Save & Connect
          </button>
        </div>
      </div>
    </div>
  );
}
