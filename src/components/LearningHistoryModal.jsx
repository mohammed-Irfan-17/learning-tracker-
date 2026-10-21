import React, { useState } from 'react';
import { CATEGORIES } from '../utils/constants';
import { getTodayDateString } from '../utils/dateUtils';

/**
 * Modal for creating a new learning history record.
 */
export default function LearningHistoryModal({ isOpen, onClose, onSave, isSaving }) {
  const [formData, setFormData] = useState(() => ({
    date: getTodayDateString(),
    concept: '',
    category: 'Java',
    customCategory: '',
    notes: ''
  }));
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.date) {
      errs.date = 'Date is required';
    }
    if (!formData.concept.trim()) {
      errs.concept = 'Concept or topic is required';
    }
    if (formData.category === 'Other' && !formData.customCategory.trim()) {
      errs.customCategory = 'Please specify category';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const finalCategory = formData.category === 'Other' && formData.customCategory.trim()
      ? formData.customCategory.trim()
      : formData.category;

    const payload = {
      date: formData.date,
      concept: formData.concept.trim(),
      category: finalCategory,
      notes: formData.notes.trim()
    };

    onSave(payload);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">📖 Add Learning History Entry</h3>
          <button className="modal-close-btn" onClick={onClose} disabled={isSaving} aria-label="Close">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="lh-date" className="form-label">
                Date <span className="req">*</span>
              </label>
              <input
                id="lh-date"
                type="date"
                className={`form-input ${errors.date ? 'form-input--error' : ''}`}
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                disabled={isSaving}
              />
              {errors.date && <span className="form-error">{errors.date}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="lh-concept" className="form-label">
                Concept or Topic <span className="req">*</span>
              </label>
              <input
                id="lh-concept"
                type="text"
                placeholder="e.g. Spring Security JWT Authentication, Docker Multi-stage Builds"
                className={`form-input ${errors.concept ? 'form-input--error' : ''}`}
                value={formData.concept}
                onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
                disabled={isSaving}
              />
              {errors.concept && <span className="form-error">{errors.concept}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="lh-category" className="form-label">
                Category <span className="req">*</span>
              </label>
              <select
                id="lh-category"
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                disabled={isSaving}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {formData.category === 'Other' && (
              <div className="form-group">
                <label htmlFor="lh-custom-category" className="form-label">
                  Custom Category Name <span className="req">*</span>
                </label>
                <input
                  id="lh-custom-category"
                  type="text"
                  placeholder="e.g. System Design, Kubernetes"
                  className={`form-input ${errors.customCategory ? 'form-input--error' : ''}`}
                  value={formData.customCategory}
                  onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                  disabled={isSaving}
                />
                {errors.customCategory && <span className="form-error">{errors.customCategory}</span>}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="lh-notes" className="form-label">
                Study Notes & Key Insights
              </label>
              <textarea
                id="lh-notes"
                rows="4"
                placeholder="Record explanations, code snippets, architectural nuances, or references..."
                className="form-textarea"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                disabled={isSaving}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn--outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={isSaving}>
              {isSaving ? 'Saving Entry...' : 'Save Learning Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
