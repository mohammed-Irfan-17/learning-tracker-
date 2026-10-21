import React, { useState } from 'react';
import { CATEGORIES } from '../utils/constants';
import { getTodayDateString } from '../utils/dateUtils';

/**
 * Modal to quickly log one or multiple learning concepts for a specific date.
 */
export default function DailyConceptsModal({ isOpen, onClose, onSave, isSaving }) {
  const [date, setDate] = useState(() => getTodayDateString());
  const [concepts, setConcepts] = useState(() => [
    { concept: '', category: 'Java', notes: '' }
  ]);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleAddConceptRow = () => {
    setConcepts([...concepts, { concept: '', category: 'Java', notes: '' }]);
  };

  const handleRemoveConceptRow = (index) => {
    if (concepts.length <= 1) return;
    setConcepts(concepts.filter((_, i) => i !== index));
  };

  const handleChangeRow = (index, field, value) => {
    const updated = [...concepts];
    updated[index][field] = value;
    setConcepts(updated);
  };

  const validate = () => {
    const errs = {};
    if (!date) {
      errs.date = 'Date is required';
    }

    let hasValidConcept = false;
    concepts.forEach((c, idx) => {
      if (!c.concept.trim()) {
        errs[`concept_${idx}`] = 'Concept name is required';
      } else {
        hasValidConcept = true;
      }
    });

    if (!hasValidConcept) {
      errs.general = 'Please provide at least one concept name';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = concepts
      .filter((c) => c.concept.trim().length > 0)
      .map((c) => ({
        date,
        concept: c.concept.trim(),
        category: c.category || 'Other',
        notes: c.notes ? c.notes.trim() : ''
      }));

    onSave(payload);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box modal-box--wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">💡 Add Everyday Learning Concepts</h3>
          <button className="modal-close-btn" onClick={onClose} disabled={isSaving} aria-label="Close">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group form-group--inline">
              <label htmlFor="concept-date" className="form-label">
                Date:
              </label>
              <input
                id="concept-date"
                type="date"
                className={`form-input form-input--compact ${errors.date ? 'form-input--error' : ''}`}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={isSaving}
              />
              {errors.date && <span className="form-error">{errors.date}</span>}
            </div>

            <div className="concepts-list">
              <div className="concepts-list__header">
                <h4>Concepts Studied</h4>
                <button
                  type="button"
                  className="btn btn--sm btn--outline"
                  onClick={handleAddConceptRow}
                  disabled={isSaving}
                >
                  + Add Another Concept
                </button>
              </div>

              {concepts.map((item, idx) => (
                <div key={idx} className="concept-card">
                  <div className="concept-card__header">
                    <span className="concept-card__number">#{idx + 1}</span>
                    {concepts.length > 1 && (
                      <button
                        type="button"
                        className="btn-icon btn-icon--danger"
                        title="Remove concept"
                        onClick={() => handleRemoveConceptRow(idx)}
                        disabled={isSaving}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="concept-card__fields">
                    <div className="form-group">
                      <label className="form-label">
                        Concept / Topic <span className="req">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Red-Black Tree Rotation, Indexing in B-Trees"
                        className={`form-input ${errors[`concept_${idx}`] ? 'form-input--error' : ''}`}
                        value={item.concept}
                        onChange={(e) => handleChangeRow(idx, 'concept', e.target.value)}
                        disabled={isSaving}
                      />
                      {errors[`concept_${idx}`] && (
                        <span className="form-error">{errors[`concept_${idx}`]}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select
                        className="form-select"
                        value={item.category}
                        onChange={(e) => handleChangeRow(idx, 'category', e.target.value)}
                        disabled={isSaving}
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Key Takeaways / Notes (optional)</label>
                      <textarea
                        rows="2"
                        placeholder="Key syntax, insights, tricky edge cases to remember..."
                        className="form-textarea"
                        value={item.notes}
                        onChange={(e) => handleChangeRow(idx, 'notes', e.target.value)}
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {errors.general && <div className="form-error form-error--banner">{errors.general}</div>}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn--outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={isSaving}>
              {isSaving ? 'Saving Concepts...' : `Save ${concepts.length} Concept${concepts.length > 1 ? 's' : ''}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
