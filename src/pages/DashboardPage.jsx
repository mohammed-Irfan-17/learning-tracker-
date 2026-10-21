import React from 'react';
import SummaryCards from '../components/SummaryCards';
import MonthlyChart from '../components/MonthlyChart';
import { formatDateDisplay } from '../utils/dateUtils';
import { CATEGORY_COLORS } from '../utils/constants';

/**
 * Main Dashboard Page
 */
export default function DashboardPage({
  summaries,
  investments = [],
  dailyConcepts = [],
  isLoading,
  error,
  onRetry,
  onOpenLogModal,
  onOpenConceptsModal,
  onNavigateToInvestments,
  onNavigateToHistory
}) {
  // Sort latest investments first
  const recentInvestments = [...investments]
    .sort((a, b) => new Date(b.date) - new Date(a.date) || new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // Sort latest daily concepts first
  const recentConcepts = [...dailyConcepts]
    .sort((a, b) => new Date(b.date) - new Date(a.date) || new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  if (error) {
    return (
      <div className="state-card state-card--error">
        <span className="state-card__icon">⚠️</span>
        <h3 className="state-card__title">Unable to Load Dashboard Data</h3>
        <p className="state-card__message">{error}</p>
        <button type="button" className="btn btn--primary" onClick={onRetry}>
          🔄 Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* 1. Summary Cards */}
      <section className="dashboard-section">
        <SummaryCards summaries={summaries} />
      </section>

      {/* 2. Monthly Learning Hours Graph */}
      <section className="dashboard-section">
        <MonthlyChart investments={investments} />
      </section>

      {/* 3. Quick Action Section */}
      <section className="dashboard-section">
        <div className="section-header">
          <h3 className="section-title">⚡ Quick Actions</h3>
          <span className="section-subtitle">Record daily time and key concepts in seconds</span>
        </div>

        <div className="quick-actions-grid">
          <div className="quick-action-card" onClick={onOpenLogModal}>
            <div className="quick-action-card__icon">⏱️</div>
            <div className="quick-action-card__info">
              <h4 className="quick-action-card__title">Log Learning Time</h4>
              <p className="quick-action-card__desc">
                Record hours spent studying Java, Algorithms, SQL, Backend, or Frontend today.
              </p>
            </div>
            <span className="quick-action-card__btn">+ Log Hours</span>
          </div>

          <div className="quick-action-card" onClick={onOpenConceptsModal}>
            <div className="quick-action-card__icon">💡</div>
            <div className="quick-action-card__info">
              <h4 className="quick-action-card__title">Add Today's Concepts</h4>
              <p className="quick-action-card__desc">
                Quickly jot down one or multiple concepts, techniques, or rules learned today.
              </p>
            </div>
            <span className="quick-action-card__btn">+ Add Concepts</span>
          </div>
        </div>
      </section>

      {/* 4. Recent Learning Activity Section */}
      <section className="dashboard-section">
        <div className="dashboard-split-grid">
          {/* Recent Investments */}
          <div className="panel-card">
            <div className="panel-card__header">
              <h3 className="panel-card__title">🕒 Recent Investments</h3>
              {investments.length > 5 && (
                <button
                  type="button"
                  className="btn-link"
                  onClick={onNavigateToInvestments}
                >
                  View All ({investments.length}) →
                </button>
              )}
            </div>

            <div className="panel-card__body">
              {isLoading && recentInvestments.length === 0 ? (
                <div className="loading-placeholder">
                  <div className="spinner"></div>
                  <span>Loading recent records...</span>
                </div>
              ) : recentInvestments.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-state__icon">📝</span>
                  <p className="empty-state__title">No investment records logged yet</p>
                  <p className="empty-state__desc">Log your study hours to build your learning analytics.</p>
                  <button type="button" className="btn btn--outline btn--sm" onClick={onOpenLogModal}>
                    Log First Investment
                  </button>
                </div>
              ) : (
                <div className="activity-list">
                  {recentInvestments.map((inv) => (
                    <div key={inv.recordId} className="activity-item">
                      <div className="activity-item__left">
                        <span
                          className="badge"
                          style={{
                            borderColor: CATEGORY_COLORS[inv.category] || '#3b82f6',
                            color: CATEGORY_COLORS[inv.category] || '#3b82f6'
                          }}
                        >
                          {inv.category}
                        </span>
                        <div className="activity-item__details">
                          <span className="activity-item__desc">{inv.description || 'Study session'}</span>
                          <span className="activity-item__date">{formatDateDisplay(inv.date)}</span>
                        </div>
                      </div>
                      <div className="activity-item__hours">
                        <strong>{inv.hours}</strong> hrs
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Concepts */}
          <div className="panel-card">
            <div className="panel-card__header">
              <h3 className="panel-card__title">💡 Recently Learned Concepts</h3>
              {dailyConcepts.length > 5 && (
                <button
                  type="button"
                  className="btn-link"
                  onClick={onNavigateToHistory}
                >
                  View Learning History →
                </button>
              )}
            </div>

            <div className="panel-card__body">
              {isLoading && recentConcepts.length === 0 ? (
                <div className="loading-placeholder">
                  <div className="spinner"></div>
                  <span>Loading concepts...</span>
                </div>
              ) : recentConcepts.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-state__icon">💡</span>
                  <p className="empty-state__title">No concepts saved yet</p>
                  <p className="empty-state__desc">Save key concepts you learned to remember them later.</p>
                  <button type="button" className="btn btn--outline btn--sm" onClick={onOpenConceptsModal}>
                    Add First Concept
                  </button>
                </div>
              ) : (
                <div className="activity-list">
                  {recentConcepts.map((c) => (
                    <div key={c.recordId} className="activity-item">
                      <div className="activity-item__left">
                        <span
                          className="badge"
                          style={{
                            borderColor: CATEGORY_COLORS[c.category] || '#06b6d4',
                            color: CATEGORY_COLORS[c.category] || '#06b6d4'
                          }}
                        >
                          {c.category}
                        </span>
                        <div className="activity-item__details">
                          <span className="activity-item__desc">
                            <strong>{c.concept}</strong>
                          </span>
                          {c.notes && <span className="activity-item__notes">{c.notes}</span>}
                          <span className="activity-item__date">{formatDateDisplay(c.date)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
