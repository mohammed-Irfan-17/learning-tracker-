/**
 * Utility functions for date manipulations and timezone-safe comparisons
 */

/**
 * Returns today's date formatted as YYYY-MM-DD in the user's local timezone.
 */
export function getTodayDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Normalizes any date input (string or Date) into a YYYY-MM-DD string.
 */
export function normalizeDateString(val) {
  if (!val) return '';
  if (typeof val === 'string') {
    // If it's already YYYY-MM-DD
    const match = val.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (match) {
      const y = match[1];
      const m = String(parseInt(match[2], 10)).padStart(2, '0');
      const d = String(parseInt(match[3], 10)).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns friendly formatted date (e.g. "Oct 21, 2026").
 */
export function formatDateDisplay(dateStr) {
  const norm = normalizeDateString(dateStr);
  if (!norm) return dateStr || '—';
  const [year, month, day] = norm.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Returns short date display (e.g. "Oct 21").
 */
export function formatShortDate(dateStr) {
  const norm = normalizeDateString(dateStr);
  if (!norm) return dateStr || '';
  const [year, month, day] = norm.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Checks if a given YYYY-MM-DD matches today's local date.
 */
export function isToday(dateStr) {
  return normalizeDateString(dateStr) === getTodayDateString();
}

/**
 * Checks if a date string falls in the given year and month (1-indexed month: 1-12).
 */
export function isInMonth(dateStr, year, month) {
  const norm = normalizeDateString(dateStr);
  if (!norm) return false;
  const [y, m] = norm.split('-').map(Number);
  return y === Number(year) && m === Number(month);
}

/**
 * Returns the exact number of days in a given month and year (handles leap years accurately).
 * month is 1-indexed (1 = Jan, 2 = Feb, etc.)
 */
export function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

/**
 * Generates an aggregated monthly array of all calendar days for Recharts.
 * Guarantees every day from 1 to daysInMonth is represented, with summed hours
 * (or 0 if no investments exist for that day).
 *
 * @param {Array} investments - List of investment records
 * @param {number} year - 4-digit year (e.g. 2026)
 * @param {number} month - 1-indexed month (1 to 12)
 * @returns {Array} List of { day: string, date: string, hours: number, count: number }
 */
export function aggregateMonthlyInvestments(investments = [], year, month) {
  const totalDays = getDaysInMonth(year, month);
  const monthPad = String(month).padStart(2, '0');

  // Sum hours by exact YYYY-MM-DD date string
  const hoursByDate = new Map();
  const countByDate = new Map();

  for (const inv of investments) {
    if (!inv || !inv.date) continue;
    const normDate = normalizeDateString(inv.date);
    if (!isInMonth(normDate, year, month)) continue;

    const hours = parseFloat(inv.hours) || 0;
    if (hours > 0) {
      hoursByDate.set(normDate, (hoursByDate.get(normDate) || 0) + hours);
      countByDate.set(normDate, (countByDate.get(normDate) || 0) + 1);
    }
  }

  const series = [];
  for (let day = 1; day <= totalDays; day++) {
    const dayStr = String(day).padStart(2, '0');
    const fullDate = `${year}-${monthPad}-${dayStr}`;
    const rawHours = hoursByDate.get(fullDate) || 0;
    const roundedHours = Math.round(rawHours * 100) / 100;

    series.push({
      day: dayStr,
      date: fullDate,
      hours: roundedHours,
      entriesCount: countByDate.get(fullDate) || 0
    });
  }

  return series;
}

/**
 * Calculates dashboard summary statistics from investment records:
 * - Today's total hours
 * - Current month's total hours
 * - All-time overall hours
 */
export function calculateSummaries(investments = []) {
  const todayStr = getTodayDateString();
  const todayDate = new Date();
  const currentYear = todayDate.getFullYear();
  const currentMonth = todayDate.getMonth() + 1;

  let todayHours = 0;
  let currentMonthHours = 0;
  let overallHours = 0;

  for (const inv of investments) {
    if (!inv || !inv.date) continue;
    const hours = parseFloat(inv.hours) || 0;
    if (hours <= 0) continue;

    const norm = normalizeDateString(inv.date);
    overallHours += hours;

    if (norm === todayStr) {
      todayHours += hours;
    }

    if (isInMonth(norm, currentYear, currentMonth)) {
      currentMonthHours += hours;
    }
  }

  return {
    todayHours: Math.round(todayHours * 100) / 100,
    currentMonthHours: Math.round(currentMonthHours * 100) / 100,
    overallHours: Math.round(overallHours * 100) / 100
  };
}
