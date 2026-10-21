import { getScriptUrl, isApiConfigured } from './storageConfig';

/**
 * Executes a GET request against the Google Apps Script Web App.
 */
async function apiGet(action, params = {}, urlOverride = null) {
  const baseUrl = urlOverride || getScriptUrl();
  if (!baseUrl) {
    throw new Error('Google Apps Script URL is not configured. Please set VITE_GOOGLE_SCRIPT_URL or enter it in settings.');
  }

  const query = new URLSearchParams({ action, ...params }).toString();
  const fullUrl = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${query}`;

  const response = await fetch(fullUrl, {
    method: 'GET',
    redirect: 'follow',
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status} (${response.statusText})`);
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'Failed to complete request');
  }

  return result.data !== undefined ? result.data : result;
}

/**
 * Executes a POST request against the Google Apps Script Web App.
 * Uses text/plain to avoid CORS preflight (OPTIONS) which Apps Script Web Apps do not handle.
 */
async function apiPost(action, payload = {}, urlOverride = null) {
  const baseUrl = urlOverride || getScriptUrl();
  if (!baseUrl) {
    throw new Error('Google Apps Script URL is not configured. Please set VITE_GOOGLE_SCRIPT_URL or enter it in settings.');
  }

  const bodyData = {
    action,
    ...payload
  };

  const response = await fetch(baseUrl, {
    method: 'POST',
    redirect: 'follow',
    headers: {
      // Must be text/plain to prevent browser CORS preflight OPTIONS request
      'Content-Type': 'text/plain;charset=utf-8',
      'Accept': 'application/json'
    },
    body: JSON.stringify(bodyData)
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status} (${response.statusText})`);
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'Failed to complete write operation');
  }

  return result.data !== undefined ? result.data : result;
}

/**
 * API Service methods
 */

export async function pingApi(urlOverride = null) {
  return await apiGet('ping', {}, urlOverride);
}

export async function fetchAllData() {
  return await apiGet('getAll');
}

export async function fetchInvestments() {
  return await apiGet('getInvestments');
}

export async function fetchLearningHistory() {
  return await apiGet('getLearningHistory');
}

export async function fetchDailyConcepts(date = null) {
  const params = date ? { date } : {};
  return await apiGet('getDailyConcepts', params);
}

export async function createInvestment(record) {
  return await apiPost('createInvestment', { data: record });
}

export async function updateInvestment(record) {
  return await apiPost('updateInvestment', { data: record });
}

export async function deleteInvestment(recordId) {
  return await apiPost('deleteInvestment', { recordId });
}

export async function createLearningEntry(entry) {
  return await apiPost('createLearningEntry', { data: entry });
}

export async function deleteLearningEntry(recordId) {
  return await apiPost('deleteLearningEntry', { recordId });
}

export async function createDailyConcepts(concepts) {
  const conceptsList = Array.isArray(concepts) ? concepts : [concepts];
  return await apiPost('createDailyConcepts', { concepts: conceptsList });
}

export async function deleteDailyConcept(recordId) {
  return await apiPost('deleteDailyConcept', { recordId });
}

export { isApiConfigured };
