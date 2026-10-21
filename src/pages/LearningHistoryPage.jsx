import React, { useState, useMemo } from 'react';
import { CATEGORIES, CATEGORY_COLORS } from '../utils/constants';
import { formatDateDisplay, normalizeDateString } from '../utils/dateUtils';

/**
 * Learning History Page (List, Filter, Add, Delete)
 */
export default function LearningHistoryPage({
  learningHistory = [],
  isLoading,
  onOpenHistoryModal,
  onDeleteHistoryEntry
}) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter and sort records (newest date first)
  const filteredHistory = useMemo(() => {
    return learningHistory
      .filter((item) => {
        // Category filter
        if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
          return false;
        }
        // Date filter
        if (dateFilter && normalizeDateString(item.date) !== normalizeDateString(dateFilter)) {
          return false;
        }
        // Search filter (concept or notes)
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const conceptMatch = (item.concept || '').toLowerCase().includes(query);
          const notesMatch = (item.notes || '').toLowerCase().includes(query);
          if (!conceptMatch && !notesMatch) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        if (dateB !== dateA) return dateB - dateA;
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
  }, [learningHistory, selectedCategory, dateFilter, searchQuery]);

  const handleResetFilters = () => {
    setSelectedCategory('ALL');
    setDateFilter('');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedCategory !== 'ALL' || dateFilter !== '' || searchQuery !== '';

  return (
    <div className="history-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">📖 Learning History</h2>
          <p className="page-subtitle">
            A persistent repository of concepts, algorithms, frameworks, and topics studied over time.
          </p>
        </div>
        <button type="button" className="btn btn--primary" onClick={onOpenHistoryModal}>
          + Add Learning Entry
        </button>
      </div>

      {/* Filters */}
      <div className="filter-card">
        <div className="filter-group">
          <label className="filter-label">Category:</label>
          <select
            className="filter-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="ALL">All Categories ({learningHistory.length})</option>
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
            placeholder="Search concepts or notes..."
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

      {/* Results Header */}
      <div className="results-summary">
        <span>
          Showing <strong>{filteredHistory.length}</strong> {filteredHistory.length === 1 ? 'concept entry' : 'concept entries'}
        </span>
      </div>

      {/* History Grid / List */}
      {isLoading && learningHistory.length === 0 ? (
        <div className="loading-card">
          <div className="spinner"></div>
          <span>Loading learning history from Google Sheets...</span>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="empty-card">
          <span className="empty-card__icon">💡</span>
          <h3 className="empty-card__title">
            {hasActiveFilters ? 'No Matching Learning Entries' : 'No Learning History Recorded Yet'}
          </h3>
          <p className="empty-card__desc">
            {hasActiveFilters
              ? 'Try relaxing your filter criteria or search terms.'
              : 'Record the concepts and topics you have studied to build your personal knowledge base.'}
          </p>
          {hasActiveFilters ? (
            <button type="button" className="btn btn--secondary btn--sm" onClick={handleResetFilters}>
              Reset Filters
            </button>
          ) : (
            <button type="button" className="btn btn--primary btn--sm" onClick={onOpenHistoryModal}>
              Record First Concept
            </button>
          )}
        </div>
      ) : (
        <div className="history-grid">
          {filteredHistory.map((item) => (
            <div key={item.recordId} className="history-card">
              <div className="history-card__header">
                <span
                  className="badge"
                  style={{
                    borderColor: CATEGORY_COLORS[item.category] || '#06b6d4',
                    color: CATEGORY_COLORS[item.category] || '#06b6d4'
                  }}
                >
                  {item.category}
                </span>
                <span className="history-card__date">{formatDateDisplay(item.date)}</span>
              </div>

              <div className="history-card__body">
                <h4 className="history-card__concept">{item.concept}</h4>
                {item.notes ? (
                  <p className="history-card__notes">{item.notes}</p>
                ) : (
                  <p className="history-card__notes history-card__notes--empty">No additional notes</p>
                )}
              </div>

              <div className="history-card__footer">
                <span className="history-card__id">ID: {item.recordId.slice(0, 12)}...</span>
                {onDeleteHistoryEntry && (
                  <button
                    type="button"
                    className="btn-icon btn-icon--danger"
                    title="Delete entry"
                    onClick={() => onDeleteHistoryEntry(item)}
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
