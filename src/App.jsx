import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './App.css';

// Components
import Navbar from './components/Navbar';
import SetupBanner from './components/SetupBanner';
import SetupModal from './components/SetupModal';
import InvestmentModal from './components/InvestmentModal';
import DailyConceptsModal from './components/DailyConceptsModal';
import LearningHistoryModal from './components/LearningHistoryModal';
import ConfirmModal from './components/ConfirmModal';
import Toast from './components/Toast';

// Pages
import DashboardPage from './pages/DashboardPage';
import InvestmentsPage from './pages/InvestmentsPage';
import LearningHistoryPage from './pages/LearningHistoryPage';

// Services & Utilities
import {
  isApiConfigured,
  fetchAllData,
  createInvestment,
  updateInvestment,
  deleteInvestment,
  createDailyConcepts,
  createLearningEntry,
  deleteLearningEntry
} from './services/api';
import { calculateSummaries } from './utils/dateUtils';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isConfigured, setIsConfigured] = useState(isApiConfigured());

  // Real data state
  const [investments, setInvestments] = useState([]);
  const [learningHistory, setLearningHistory] = useState([]);
  const [dailyConcepts, setDailyConcepts] = useState([]);

  // Async & UI status
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Modals state
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState(null);
  const [isConceptsModalOpen, setIsConceptsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({
    isOpen: false,
    type: null,
    item: null
  });

  // Auto-dismiss toast after 4.5s
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  // Fetch real data from Google Apps Script Web App
  const loadData = useCallback(async () => {
    if (!isApiConfigured()) {
      setIsConfigured(false);
      setInvestments([]);
      setLearningHistory([]);
      setDailyConcepts([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchAllData();
      setInvestments(Array.isArray(res.investments) ? res.investments : []);
      setLearningHistory(Array.isArray(res.learningHistory) ? res.learningHistory : []);
      setDailyConcepts(Array.isArray(res.dailyConcepts) ? res.dailyConcepts : []);
      setIsConfigured(true);
    } catch (err) {
      console.error('Error fetching data from Google Sheets:', err);
      setError(err.message || 'Failed to load records from Google Sheets.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived summaries for dashboard
  const summaries = useMemo(() => {
    return calculateSummaries(investments);
  }, [investments]);

  // ─────────────────────────────────────────────────────────────
  // Investments Handlers
  // ─────────────────────────────────────────────────────────────
  const handleOpenLogModal = () => {
    setEditingInvestment(null);
    setIsLogModalOpen(true);
  };

  const handleEditInvestment = (inv) => {
    setEditingInvestment(inv);
    setIsLogModalOpen(true);
  };

  const handleSaveInvestment = async (formData) => {
    if (!isApiConfigured()) {
      showToast('Please connect your Google Sheets Web App first.', 'error');
      setIsSetupModalOpen(true);
      return;
    }

    setIsSaving(true);
    try {
      if (formData.recordId) {
        // Update existing record
        const updated = await updateInvestment(formData);
        setInvestments((prev) =>
          prev.map((item) => (item.recordId === updated.recordId ? updated : item))
        );
        showToast('Investment record updated in Google Sheets!');
      } else {
        // Create new record
        const created = await createInvestment(formData);
        setInvestments((prev) => [created, ...prev]);
        showToast(`Logged ${created.hours} hours for ${created.category}!`);
      }
      setIsLogModalOpen(false);
      setEditingInvestment(null);
    } catch (err) {
      console.error('Save investment failed:', err);
      showToast(err.message || 'Failed to save investment to Google Sheets', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteInvestmentClick = (inv) => {
    setConfirmDelete({
      isOpen: true,
      type: 'investment',
      item: inv
    });
  };

  const handleConfirmDelete = async () => {
    const { type, item } = confirmDelete;
    if (!item) return;

    setIsSaving(true);
    try {
      if (type === 'investment') {
        await deleteInvestment(item.recordId);
        setInvestments((prev) => prev.filter((i) => i.recordId !== item.recordId));
        showToast('Investment record deleted from Google Sheets.');
      } else if (type === 'history') {
        await deleteLearningEntry(item.recordId);
        setLearningHistory((prev) => prev.filter((i) => i.recordId !== item.recordId));
        showToast('Learning history entry deleted.');
      }
      setConfirmDelete({ isOpen: false, type: null, item: null });
    } catch (err) {
      console.error('Delete failed:', err);
      showToast(err.message || 'Failed to delete record from Google Sheets', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Daily Concepts Handlers
  // ─────────────────────────────────────────────────────────────
  const handleSaveConcepts = async (conceptsList) => {
    if (!isApiConfigured()) {
      showToast('Please connect your Google Sheets Web App first.', 'error');
      setIsSetupModalOpen(true);
      return;
    }

    setIsSaving(true);
    try {
      const created = await createDailyConcepts(conceptsList);
      const listToAdd = Array.isArray(created) ? created : [created];
      setDailyConcepts((prev) => [...listToAdd, ...prev]);
      showToast(`Successfully saved ${listToAdd.length} concept${listToAdd.length > 1 ? 's' : ''} to Google Sheets!`);
      setIsConceptsModalOpen(false);
    } catch (err) {
      console.error('Save concepts failed:', err);
      showToast(err.message || 'Failed to save concepts', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Learning History Handlers
  // ─────────────────────────────────────────────────────────────
  const handleSaveHistoryEntry = async (entryData) => {
    if (!isApiConfigured()) {
      showToast('Please connect your Google Sheets Web App first.', 'error');
      setIsSetupModalOpen(true);
      return;
    }

    setIsSaving(true);
    try {
      const created = await createLearningEntry(entryData);
      setLearningHistory((prev) => [created, ...prev]);
      showToast(`Saved "${created.concept}" to learning history!`);
      setIsHistoryModalOpen(false);
    } catch (err) {
      console.error('Save history entry failed:', err);
      showToast(err.message || 'Failed to save learning entry', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteHistoryClick = (entry) => {
    setConfirmDelete({
      isOpen: true,
      type: 'history',
      item: entry
    });
  };

  const handleConfigSaved = (newUrl) => {
    setIsConfigured(Boolean(newUrl));
    showToast('Google Apps Script URL saved. Connecting...', 'info');
    loadData();
  };

  return (
    <div className="app-shell">
      {/* 1. Header & Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isApiConfigured={isConfigured}
        onOpenLogModal={handleOpenLogModal}
        onOpenConceptsModal={() => setIsConceptsModalOpen(true)}
        onOpenSettingsModal={() => setIsSetupModalOpen(true)}
      />

      {/* 2. Top Alert Banner if Google Sheets is not yet configured */}
      {!isConfigured && (
        <SetupBanner onOpenSetup={() => setIsSetupModalOpen(true)} />
      )}

      {/* 3. Main Content Router */}
      <main className="app-main">
        {activeTab === 'dashboard' && (
          <DashboardPage
            summaries={summaries}
            investments={investments}
            dailyConcepts={dailyConcepts}
            isLoading={isLoading}
            error={error}
            onRetry={loadData}
            onOpenLogModal={handleOpenLogModal}
            onOpenConceptsModal={() => setIsConceptsModalOpen(true)}
            onNavigateToInvestments={() => setActiveTab('investments')}
            onNavigateToHistory={() => setActiveTab('history')}
          />
        )}

        {activeTab === 'investments' && (
          <InvestmentsPage
            investments={investments}
            isLoading={isLoading}
            onOpenLogModal={handleOpenLogModal}
            onEditInvestment={handleEditInvestment}
            onDeleteInvestment={handleDeleteInvestmentClick}
          />
        )}

        {activeTab === 'history' && (
          <LearningHistoryPage
            learningHistory={learningHistory}
            isLoading={isLoading}
            onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
            onDeleteHistoryEntry={handleDeleteHistoryClick}
          />
        )}
      </main>

      {/* 4. Global Modals */}
      {isLogModalOpen && (
        <InvestmentModal
          key={editingInvestment ? editingInvestment.recordId : 'new-investment'}
          isOpen={isLogModalOpen}
          initialData={editingInvestment}
          onClose={() => {
            setIsLogModalOpen(false);
            setEditingInvestment(null);
          }}
          onSave={handleSaveInvestment}
          isSaving={isSaving}
        />
      )}

      {isConceptsModalOpen && (
        <DailyConceptsModal
          key="daily-concepts-modal"
          isOpen={isConceptsModalOpen}
          onClose={() => setIsConceptsModalOpen(false)}
          onSave={handleSaveConcepts}
          isSaving={isSaving}
        />
      )}

      {isHistoryModalOpen && (
        <LearningHistoryModal
          key="learning-history-modal"
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          onSave={handleSaveHistoryEntry}
          isSaving={isSaving}
        />
      )}

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        title={confirmDelete.type === 'investment' ? 'Delete Investment Record' : 'Delete History Entry'}
        message={
          confirmDelete.type === 'investment'
            ? `Are you sure you want to delete the ${confirmDelete.item?.hours}h investment for ${confirmDelete.item?.category} on ${confirmDelete.item?.date}? This will update your Google Sheets database.`
            : `Are you sure you want to delete the entry "${confirmDelete.item?.concept}"?`
        }
        confirmText="Delete from Sheets"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete({ isOpen: false, type: null, item: null })}
        isBusy={isSaving}
      />

      <SetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        onConfigSaved={handleConfigSaved}
      />

      {/* 5. Toast Notification System */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* 6. Footer */}
      <footer className="app-footer">
        <p>Personal Learner Tracker · Powered by React, Vite, Recharts &amp; Google Sheets Live API</p>
      </footer>
    </div>
  );
}

export default App;
