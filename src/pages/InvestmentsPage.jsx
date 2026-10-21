import React, { useState, useMemo } from 'react';
import { CATEGORIES, CATEGORY_COLORS } from '../utils/constants';
import { formatDateDisplay, normalizeDateString } from '../utils/dateUtils';

/**
 * Daily Investment Tracker Page (List, Filter, Edit, Delete)
 */
export default function InvestmentsPage({
  investments = [],
  isLoading,
  onOpenLogModal,
  onEditInvestment,
  onDeleteInvestment
}) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter and sort records (newest date first)
  const filteredInvestments = useMemo(() => {
    return investments
      .filter((inv) => {
        // Category filter
        if (selectedCategory !== 'ALL' && inv.category !== selectedCategory) {
          return false;
        }
        // Date filter
        if (dateFilter && normalizeDateString(inv.date) !== normalizeDateString(dateFilter)) {
          return false;
        }
        // Search filter (description or category)
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const descMatch = (inv.description || '').toLowerCase().includes(query);
          const catMatch = (inv.category || '').toLowerCase().includes(query);
          if (!descMatch && !catMatch) return false;
        }
        return true;
      })
      .sort((a, b) => {
        // Sort by date descending, then by createdAt descending
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        if (dateB !== dateA) return dateB - dateA;
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
  }, [investments, selectedCategory, dateFilter, searchQuery]);

  // Aggregate stats for current filter
  const totalFilteredHours = useMemo(() => {
    const total = filteredInvestments.reduce((acc, curr) => acc + (parseFloat(curr.hours) || 0), 0);
    return Math.round(total * 100) / 100;
  }, [filteredInvestments]);

  const handleResetFilters = () => {
    setSelectedCategory('ALL');
    setDateFilter('');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedCategory !== 'ALL' || dateFilter !== '' || searchQuery !== '';

  return (
    <div className="investments-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">⏱️ Learning Investments</h2>
          <p className="page-subtitle">
            Track daily study hours across concepts, topics, and programming stacks.
          </p>
        </div>
        <button type="button" className="btn btn--primary" onClick={onOpenLogModal}>
          + Log Learning Time
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-card">
        <div className="filter-group">
          <label className="filter-label">Category:</label>
          <select
            className="filter-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="ALL">All Categories ({investments.length})</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Date:</label>
          <input
            type="date"
            className="filter-input"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>

        <div className="filter-group filter-group--search">
          <label className="filter-label">Search:</label>
          <input
            type="text"
            placeholder="Search descriptions..."
            className="filter-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            className="btn btn--sm btn--outline"
            onClick={handleResetFilters}
            title="Clear all filters"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Filter Results Summary */}
      <div className="results-summary">
        <span>
          Showing <strong>{filteredInvestments.length}</strong> {filteredInvestments.length === 1 ? 'record' : 'records'}
        </span>
        <span className="results-summary__badge">
          Total: <strong>{totalFilteredHours}</strong> hours
        </span>
      </div>

      {/* Data View */}
      {isLoading && investments.length === 0 ? (
        <div className="loading-card">
          <div className="spinner"></div>
          <span>Loading investments from Google Sheets...</span>
        </div>
      ) : filteredInvestments.length === 0 ? (
        <div className="empty-card">
          <span className="empty-card__icon">🔍</span>
          <h3 className="empty-card__title">
            {hasActiveFilters ? 'No Matching Investment Records' : 'No Investments Logged Yet'}
          </h3>
          <p className="empty-card__desc">
            {hasActiveFilters
              ? 'Try adjusting your filters or search terms to find what you are looking for.'
              : 'Start logging your study sessions to track your daily and monthly progress.'}
          </p>
          {hasActiveFilters ? (
            <button type="button" className="btn btn--secondary btn--sm" onClick={handleResetFilters}>
              Reset Filters
            </button>
          ) : (
            <button type="button" className="btn btn--primary btn--sm" onClick={onOpenLogModal}>
              Log Your First Investment
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '130px' }}>Date</th>
                  <th style={{ width: '100px' }}>Hours</th>
                  <th style={{ width: '180px' }}>Category</th>
                  <th>Description</th>
                  <th style={{ width: '140px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvestments.map((inv) => (
                  <tr key={inv.recordId}>
                    <td className="data-table__date">{formatDateDisplay(inv.date)}</td>
                    <td className="data-table__hours">
                      <span className="hours-pill">{inv.hours} hrs</span>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          borderColor: CATEGORY_COLORS[inv.category] || '#3b82f6',
                          color: CATEGORY_COLORS[inv.category] || '#3b82f6'
                        }}
                      >
                        {inv.category}
                      </span>
                    </td>
                    <td className="data-table__desc">{inv.description || '—'}</td>
                    <td className="data-table__actions">
                      <button
                        type="button"
                        className="btn-action btn-action--edit"
                        onClick={() => onEditInvestment(inv)}
                        title="Edit investment"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        type="button"
                        className="btn-action btn-action--delete"
                        onClick={() => onDeleteInvestment(inv)}
                        title="Delete investment"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card / List View */}
          <div className="mobile-cards-list">
            {filteredInvestments.map((inv) => (
              <div key={inv.recordId} className="mobile-item-card">
                <div className="mobile-item-card__header">
                  <span className="mobile-item-card__date">{formatDateDisplay(inv.date)}</span>
                  <span className="hours-pill">{inv.hours} hrs</span>
                </div>
                <div className="mobile-item-card__body">
                  <span
                    className="badge"
                    style={{
                      borderColor: CATEGORY_COLORS[inv.category] || '#3b82f6',
                      color: CATEGORY_COLORS[inv.category] || '#3b82f6'
                    }}
                  >
                    {inv.category}
                  </span>
                  <p className="mobile-item-card__desc">{inv.description || 'No description provided'}</p>
                </div>
                <div className="mobile-item-card__footer">
                  <button
                    type="button"
                    className="btn btn--xs btn--outline"
                    onClick={() => onEditInvestment(inv)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn--xs btn--danger-outline"
                    onClick={() => onDeleteInvestment(inv)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
