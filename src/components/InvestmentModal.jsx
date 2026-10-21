import React, { useState } from 'react';
import { CATEGORIES } from '../utils/constants';
import { getTodayDateString } from '../utils/dateUtils';

function getInitialState(initialData) {
  if (initialData) {
    const isCustomCat = !CATEGORIES.includes(initialData.category) && initialData.category !== 'Other';
    return {
      date: initialData.date || getTodayDateString(),
      hours: initialData.hours !== undefined ? String(initialData.hours) : '',
      category: isCustomCat ? 'Other' : (initialData.category || 'Java'),
      customCategory: isCustomCat ? initialData.category : '',
      description: initialData.description || ''
    };
  }
  return {
    date: getTodayDateString(),
    hours: '',
    category: 'Java',
    customCategory: '',
    description: ''
  };
}

/**
 * Modal for creating and editing investment records.
 */
export default function InvestmentModal({ isOpen, initialData, onClose, onSave, isSaving }) {
  const [formData, setFormData] = useState(() => getInitialState(initialData));
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.date) {
      errs.date = 'Date is required';
    }
    const hoursNum = parseFloat(formData.hours);
    if (!formData.hours || isNaN(hoursNum) || hoursNum <= 0) {
      errs.hours = 'Please enter a positive number of hours (e.g. 1.5)';
    }
    if (formData.category === 'Other' && !formData.customCategory.trim()) {
      errs.customCategory = 'Please specify the category';
    }
    if (!formData.description.trim()) {
      errs.description = 'Please describe the work completed';
    } else if (formData.description.trim().length < 3) {
      errs.description = 'Description should be at least 3 characters';
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
      ...(initialData ? { recordId: initialData.recordId } : {}),
      date: formData.date,
      hours: parseFloat(formData.hours),
      category: finalCategory,
      description: formData.description.trim()
    };

    onSave(payload);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {initialData ? '✏️ Edit Learning Investment' : '⏱️ Log Learning Time'}
          </h3>
          <button className="modal-close-btn" onClick={onClose} disabled={isSaving} aria-label="Close">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="inv-date" className="form-label">
                Date <span className="req">*</span>
              </label>
              <input
                id="inv-date"
                type="date"
                className={`form-input ${errors.date ? 'form-input--error' : ''}`}
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                disabled={isSaving}
              />
              {errors.date && <span className="form-error">{errors.date}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="inv-hours" className="form-label">
                Learning Hours <span className="req">*</span>
              </label>
              <input
                id="inv-hours"
                type="number"
                step="0.25"
                min="0.1"
                placeholder="e.g. 2.0"
                className={`form-input ${errors.hours ? 'form-input--error' : ''}`}
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                disabled={isSaving}
              />
              {errors.hours && <span className="form-error">{errors.hours}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="inv-category" className="form-label">
                Category <span className="req">*</span>
              </label>
              <select
                id="inv-category"
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
                <label htmlFor="inv-custom-category" className="form-label">
                  Custom Category Name <span className="req">*</span>
                </label>
                <input
                  id="inv-custom-category"
                  type="text"
                  placeholder="e.g. Cloud Architecture, DevOps"
                  className={`form-input ${errors.customCategory ? 'form-input--error' : ''}`}
                  value={formData.customCategory}
                  onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                  disabled={isSaving}
                />
                {errors.customCategory && <span className="form-error">{errors.customCategory}</span>}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="inv-description" className="form-label">
                Description of Work Completed <span className="req">*</span>
              </label>
              <textarea
                id="inv-description"
                rows="3"
                placeholder="e.g. Studied binary search trees, implemented balanced insertion, solved 3 LeetCode problems"
                className={`form-textarea ${errors.description ? 'form-input--error' : ''}`}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isSaving}
              />
              {errors.description && <span className="form-error">{errors.description}</span>}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn--outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={isSaving}>
              {isSaving ? 'Saving to Sheets...' : initialData ? 'Update Record' : 'Save Investment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
