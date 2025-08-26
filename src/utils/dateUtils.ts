/**
 * ISO 8601 Week Date utilities for analytics
 * Matches backend week calculation exactly
 */

/**
 * Get ISO week number for a given date
 * Week 1 is the first week that contains January 4th
 * Weeks start on Monday
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7; // Sunday = 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum); // Thursday of this week
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Get current week key in format "YYYY-WNN" (e.g., "2025-W35")
 * This matches the backend week key format exactly
 */
export function getCurrentWeekKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const weekNumber = getWeekNumber(now);
  return `${year}-W${String(weekNumber).padStart(2, '0')}`;
}

/**
 * Get week key for a specific date
 */
export function getWeekKey(date: Date): string {
  const year = date.getFullYear();
  const weekNumber = getWeekNumber(date);
  return `${year}-W${String(weekNumber).padStart(2, '0')}`;
}

/**
 * Get the start of the current week (Monday)
 */
export function getWeekStart(date: Date = new Date()): Date {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  const start = new Date(date);
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

/**
 * Get the end of the current week (Sunday)
 */
export function getWeekEnd(date: Date = new Date()): Date {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6); // Sunday end
  end.setHours(23, 59, 59, 999);
  return end;
}

/**
 * Get previous week key
 */
export function getPreviousWeekKey(): string {
  const now = new Date();
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return getWeekKey(lastWeek);
}

/**
 * Get month key for current month in format "YYYY-MM"
 */
export function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Get previous month key
 */
export function getPreviousMonthKey(): string {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const year = lastMonth.getFullYear();
  const month = String(lastMonth.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Parse week key to get year and week number
 */
export function parseWeekKey(weekKey: string): { year: number; week: number } | null {
  const match = weekKey.match(/^(\d{4})-W(\d{2})$/);
  if (!match) return null;
  
  return {
    year: parseInt(match[1], 10),
    week: parseInt(match[2], 10)
  };
}

/**
 * Check if a date is in the current week
 */
export function isCurrentWeek(date: Date): boolean {
  const currentWeekKey = getCurrentWeekKey();
  const dateWeekKey = getWeekKey(date);
  return currentWeekKey === dateWeekKey;
}