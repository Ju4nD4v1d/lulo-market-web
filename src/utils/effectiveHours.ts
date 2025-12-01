/**
 * Effective Hours Utility
 *
 * Computes effective store hours as the INTERSECTION of:
 * - Store's raw schedule (when the store says it's open)
 * - Combined driver availability (UNION of all active drivers' schedules)
 *
 * Business Logic:
 * - A store can only deliver when BOTH the store is open AND at least one driver is available
 * - Multiple drivers' schedules are combined using UNION (if ANY driver is available, delivery is possible)
 * - The final schedule is the INTERSECTION of store hours and combined driver availability
 */

import { Driver, DAYS_OF_WEEK, DayOfWeek } from '../types/driver';

export interface TimeSlot {
  open: string;
  close: string;
  closed: boolean;
}

export interface WeeklySchedule {
  [day: string]: TimeSlot;
}

// ============================================================================
// Day Name Normalization
// ============================================================================

/**
 * Map of various day name formats to canonical English day names
 * Supports: English (any case), Spanish (any case)
 */
const DAY_NAME_MAP: Record<string, DayOfWeek> = {
  // English - all lowercase mapped to capitalized
  sunday: 'Sunday',
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  // Spanish - lowercase
  domingo: 'Sunday',
  lunes: 'Monday',
  martes: 'Tuesday',
  miércoles: 'Wednesday',
  miercoles: 'Wednesday', // Without accent
  jueves: 'Thursday',
  viernes: 'Friday',
  sábado: 'Saturday',
  sabado: 'Saturday', // Without accent
};

/**
 * Normalize a day name to canonical English format
 * Handles English (any case), Spanish (any case)
 */
export function normalizeDayName(day: string): DayOfWeek | null {
  const lowered = day.toLowerCase().trim();
  return DAY_NAME_MAP[lowered] || null;
}

/**
 * Get a time slot from a schedule, trying various key formats
 */
function getScheduleSlot(
  schedule: WeeklySchedule,
  canonicalDay: DayOfWeek
): TimeSlot | undefined {
  // Try canonical day name first (e.g., "Friday")
  if (schedule[canonicalDay]) return schedule[canonicalDay];

  // Try lowercase (e.g., "friday")
  const lowered = canonicalDay.toLowerCase();
  if (schedule[lowered]) return schedule[lowered];

  // Try all keys and normalize them to find a match
  for (const key of Object.keys(schedule)) {
    const normalized = normalizeDayName(key);
    if (normalized === canonicalDay) {
      return schedule[key];
    }
  }

  return undefined;
}

// ============================================================================
// Time Conversion Helpers
// ============================================================================

/**
 * Convert time string (HH:MM) to minutes since midnight
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight to time string (HH:MM)
 */
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Format 24-hour time to 12-hour format with AM/PM
 */
export function formatTime12Hour(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// ============================================================================
// Time Intersection Logic
// ============================================================================

/**
 * Get the intersection of two time slots
 * Returns null if there's no overlap
 */
function getTimeIntersection(
  slot1: { open: string; close: string },
  slot2: { open: string; close: string }
): { open: string; close: string } | null {
  const start1 = timeToMinutes(slot1.open);
  const end1 = timeToMinutes(slot1.close);
  const start2 = timeToMinutes(slot2.open);
  const end2 = timeToMinutes(slot2.close);

  const intersectStart = Math.max(start1, start2);
  const intersectEnd = Math.min(end1, end2);

  // No overlap if start >= end
  if (intersectStart >= intersectEnd) return null;

  return {
    open: minutesToTime(intersectStart),
    close: minutesToTime(intersectEnd),
  };
}

// ============================================================================
// Driver Schedule Combination
// ============================================================================

/**
 * Combine multiple driver schedules using UNION
 * A day is available if ANY driver is available that day
 * The time window is the earliest start to the latest end
 */
function combineDriverSchedules(drivers: Driver[]): WeeklySchedule {
  const combined: WeeklySchedule = {};

  for (const day of DAYS_OF_WEEK) {
    let earliestOpen: number | null = null;
    let latestClose: number | null = null;
    let anyDriverAvailable = false;

    for (const driver of drivers) {
      if (!driver.isActive) continue;

      const slot = driver.availabilitySchedule[day as DayOfWeek];
      if (slot && !slot.closed) {
        anyDriverAvailable = true;
        const openMins = timeToMinutes(slot.open);
        const closeMins = timeToMinutes(slot.close);

        if (earliestOpen === null || openMins < earliestOpen) {
          earliestOpen = openMins;
        }
        if (latestClose === null || closeMins > latestClose) {
          latestClose = closeMins;
        }
      }
    }

    combined[day] =
      anyDriverAvailable && earliestOpen !== null && latestClose !== null
        ? { open: minutesToTime(earliestOpen), close: minutesToTime(latestClose), closed: false }
        : { open: '00:00', close: '00:00', closed: true };
  }

  return combined;
}

// ============================================================================
// Main Effective Hours Function
// ============================================================================

/**
 * Compute effective store hours
 *
 * @param storeSchedule - The store's raw delivery/business hours
 * @param activeDrivers - Array of active drivers
 * @returns WeeklySchedule with effective hours (intersection of store + drivers)
 */
export function computeEffectiveHours(
  storeSchedule: WeeklySchedule | undefined,
  activeDrivers: Driver[]
): WeeklySchedule {
  // Create a closed schedule as default
  const closedSchedule = DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day] = { open: '00:00', close: '00:00', closed: true };
    return acc;
  }, {} as WeeklySchedule);

  // Check if store schedule is empty (object with no keys)
  const hasStoreSchedule = storeSchedule && Object.keys(storeSchedule).length > 0;

  // If no store schedule or no drivers, return closed
  if (!storeSchedule || !hasStoreSchedule || activeDrivers.length === 0) {
    return closedSchedule;
  }

  // Get combined driver availability
  const combinedDriverSchedule = combineDriverSchedules(activeDrivers);

  // Compute intersection for each day
  const effectiveSchedule: WeeklySchedule = {};

  for (const day of DAYS_OF_WEEK) {
    // Use flexible slot lookup that handles various day name formats
    const storeSlot = getScheduleSlot(storeSchedule, day);
    const driverSlot = combinedDriverSchedule[day];

    // If either is closed, the effective is closed
    if (!storeSlot || storeSlot.closed || !driverSlot || driverSlot.closed) {
      effectiveSchedule[day] = { open: '00:00', close: '00:00', closed: true };
      continue;
    }

    // Compute time intersection
    const intersection = getTimeIntersection(storeSlot, driverSlot);

    if (intersection) {
      effectiveSchedule[day] = { ...intersection, closed: false };
    } else {
      effectiveSchedule[day] = { open: '00:00', close: '00:00', closed: true };
    }
  }

  return effectiveSchedule;
}

// ============================================================================
// Helper Functions for UI
// ============================================================================

/**
 * Check if delivery is available right now based on effective schedule
 */
export function isDeliveryAvailableNow(effectiveSchedule: WeeklySchedule): boolean {
  const now = new Date();
  const dayName = DAYS_OF_WEEK[now.getDay()];
  const daySchedule = effectiveSchedule[dayName];

  if (!daySchedule || daySchedule.closed) return false;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = timeToMinutes(daySchedule.open);
  const closeMinutes = timeToMinutes(daySchedule.close);

  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
}

/**
 * Get today's effective hours as a formatted string
 */
export function getTodayEffectiveHours(
  effectiveSchedule: WeeklySchedule,
  noDeliveryText: string = 'No delivery today'
): string {
  const dayName = DAYS_OF_WEEK[new Date().getDay()];
  const daySchedule = effectiveSchedule[dayName];

  if (!daySchedule || daySchedule.closed) {
    return noDeliveryText;
  }

  return `${formatTime12Hour(daySchedule.open)} - ${formatTime12Hour(daySchedule.close)}`;
}

/**
 * Get a summary of available days (e.g., "Fri, Sat, Sun")
 */
export function getAvailableDaysSummary(
  effectiveSchedule: WeeklySchedule,
  abbreviated: boolean = true
): string[] {
  const abbreviations: Record<string, string> = {
    Sunday: 'Sun',
    Monday: 'Mon',
    Tuesday: 'Tue',
    Wednesday: 'Wed',
    Thursday: 'Thu',
    Friday: 'Fri',
    Saturday: 'Sat',
  };

  return DAYS_OF_WEEK.filter((day) => {
    const slot = effectiveSchedule[day];
    return slot && !slot.closed;
  }).map((day) => (abbreviated ? abbreviations[day] : day));
}

/**
 * Find the next available delivery day
 */
export function getNextAvailableDay(
  effectiveSchedule: WeeklySchedule
): { day: string; isToday: boolean; isTomorrow: boolean } | null {
  const now = new Date();
  const currentDayIndex = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Check up to 7 days ahead
  for (let i = 0; i < 7; i++) {
    const dayIndex = (currentDayIndex + i) % 7;
    const dayName = DAYS_OF_WEEK[dayIndex];
    const slot = effectiveSchedule[dayName];

    if (slot && !slot.closed) {
      // If it's today, check if we're still within the time window
      if (i === 0) {
        const closeMinutes = timeToMinutes(slot.close);
        if (currentMinutes < closeMinutes) {
          return { day: dayName, isToday: true, isTomorrow: false };
        }
        // Today's window has passed, continue to tomorrow
        continue;
      }

      return {
        day: dayName,
        isToday: false,
        isTomorrow: i === 1,
      };
    }
  }

  return null;
}
