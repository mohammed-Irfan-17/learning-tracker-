import React from 'react';
import { MONTH_NAMES } from '../utils/constants';

const d = new Date();
const CURRENT_PERIOD = {
  monthName: MONTH_NAMES[d.getMonth()],
  year: d.getFullYear()
};

/**
 * Summary KPI cards for Today, Current Month, and All-Time learning hours.
 */
export default function SummaryCards({ summaries = { todayHours: 0, currentMonthHours: 0, overallHours: 0 } }) {
  const currentPeriod = CURRENT_PERIOD;

  return (
    <div className="summary-cards-grid">
      <div className="summary-card summary-card--today">
        <div className="summary-card__top">
          <span className="summary-card__icon">⏱️</span>
          <span className="summary-card__badge">Today</span>
        </div>
        <div className="summary-card__value">
          {summaries.todayHours}
          <span className="summary-card__unit">hrs</span>
        </div>
        <div className="summary-card__label">Today's Investment</div>
        <div className="summary-card__hint">Local calendar date total</div>
      </div>

      <div className="summary-card summary-card--month">
        <div className="summary-card__top">
          <span className="summary-card__icon">📅</span>
          <span className="summary-card__badge">Monthly</span>
        </div>
        <div className="summary-card__value">
          {summaries.currentMonthHours}
          <span className="summary-card__unit">hrs</span>
        </div>
        <div className="summary-card__label">Current Month ({currentPeriod.monthName})</div>
        <div className="summary-card__hint">Total for {currentPeriod.monthName} {currentPeriod.year}</div>
      </div>

      <div className="summary-card summary-card--total">
        <div className="summary-card__top">
          <span className="summary-card__icon">🏆</span>
          <span className="summary-card__badge">All-Time</span>
        </div>
        <div className="summary-card__value">
          {summaries.overallHours}
          <span className="summary-card__unit">hrs</span>
        </div>
        <div className="summary-card__label">Total Accumulated</div>
        <div className="summary-card__hint">Across all recorded history</div>
      </div>
    </div>
  );
}
