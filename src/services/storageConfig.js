import { STORAGE_KEYS } from '../utils/constants';

/**
 * Gets the current Google Apps Script Web App URL from localStorage or Vite environment variable.
 */
export function getScriptUrl() {
  const customUrl = localStorage.getItem(STORAGE_KEYS.SCRIPT_URL);
  if (customUrl && customUrl.trim()) {
    return customUrl.trim();
  }
  const envUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL;
  if (envUrl && envUrl.trim() && !envUrl.includes('YOUR_DEPLOYED_WEB_APP_URL')) {
    return envUrl.trim();
  }
  return '';
}

/**
 * Sets a custom Google Apps Script Web App URL in localStorage.
 */
export function setScriptUrl(url) {
  if (!url) {
    localStorage.removeItem(STORAGE_KEYS.SCRIPT_URL);
  } else {
    localStorage.setItem(STORAGE_KEYS.SCRIPT_URL, url.trim());
  }
}

/**
 * Clears the custom URL override from localStorage.
 */
export function clearScriptUrl() {
  localStorage.removeItem(STORAGE_KEYS.SCRIPT_URL);
}

/**
 * Checks if a valid script URL is configured.
 */
export function isApiConfigured() {
  const url = getScriptUrl();
  return Boolean(url && url.startsWith('https://script.google.com/'));
}
