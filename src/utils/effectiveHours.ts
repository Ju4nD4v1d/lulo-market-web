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
 *
 * Multi-Slot Support:
 * - Stores and drivers can now have up to 3 time slots per day
 * - Effective hours are computed per-slot using intersection logic
 * - Uses scheduleUtils for slot intersection and merging
 */

import { Driver, DAYS_OF_WEEK, DayOfWeek } from '../types/driver';
import {
  MultiSlotSchedule,
  DaySchedule,
  TimeSlot as MultiSlotTimeSlot,
  DAYS_OF_WEEK as SCHEDULE_DAYS,
} from '../types/schedule';
import {
  computeEffectiveDaySlots,
  mergeOverlappingSlots,
  timeToMinutes as scheduleTimeToMinutes,
  minutesToTime as scheduleMinutesToTime,
} from './scheduleUtils';

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

// ============================================================================
// Multi-Slot Schedule Functions (NEW)
// ============================================================================

/**
 * Combine multiple driver schedules using UNION (multi-slot version)
 * Returns merged slots from all active drivers for each day
 */
export function combineDriverSchedulesMultiSlot(drivers: Driver[]): MultiSlotSchedule {
  const result: MultiSlotSchedule = {} as MultiSlotSchedule;

  for (const day of SCHEDULE_DAYS) {
    const allSlots: MultiSlotTimeSlot[] = [];

    for (const driver of drivers) {
      if (!driver.isActive) continue;

      // Use new multi-slot schedule if available, otherwise fall back to legacy
      const daySchedule = driver.availabilityScheduleV2?.[day];

      if (daySchedule && !daySchedule.closed && daySchedule.slots.length > 0) {
        // Use V2 schedule if it has valid slots
        allSlots.push(...daySchedule.slots);
      } else if (!driver.availabilityScheduleV2) {
        // Driver has no V2 schedule at all - fall back to legacy single-slot schedule
        const legacySlot = driver.availabilitySchedule?.[day];
        if (legacySlot && !legacySlot.closed) {
          allSlots.push({ open: legacySlot.open, close: legacySlot.close });
        }
      }
      // Note: If V2 exists but day is closed/empty, we treat it as intentionally closed
      // (no fallback to legacy in this case - V2 takes precedence)
    }

    if (allSlots.length > 0) {
      // Merge overlapping slots to create continuous time windows
      result[day] = {
        closed: false,
        slots: mergeOverlappingSlots(allSlots),
      };
    } else {
      result[day] = { closed: true, slots: [] };
    }
  }

  return result;
}

/**
 * Compute effective store hours (multi-slot version)
 *
 * @param storeSchedule - The store's multi-slot delivery schedule
 * @param activeDrivers - Array of active drivers
 * @returns MultiSlotSchedule with effective hours (intersection of store + drivers)
 */
export function computeEffectiveHoursMultiSlot(
  storeSchedule: MultiSlotSchedule | undefined,
  activeDrivers: Driver[]
): MultiSlotSchedule {
  // Create a closed schedule as default
  const closedSchedule: MultiSlotSchedule = SCHEDULE_DAYS.reduce((acc, day) => {
    acc[day] = { closed: true, slots: [] };
    return acc;
  }, {} as MultiSlotSchedule);

  // If no store schedule or no drivers, return closed
  if (!storeSchedule || activeDrivers.length === 0) {
    return closedSchedule;
  }

  // Get combined driver availability (multi-slot)
  const combinedDriverSchedule = combineDriverSchedulesMultiSlot(activeDrivers);

  // Compute intersection for each day
  const effectiveSchedule: MultiSlotSchedule = {} as MultiSlotSchedule;

  for (const day of SCHEDULE_DAYS) {
    const storeDay = storeSchedule[day];
    const driverDay = combinedDriverSchedule[day];

    // If either is closed or has no slots, the effective is closed
    if (!storeDay || storeDay.closed || storeDay.slots.length === 0 ||
        !driverDay || driverDay.closed || driverDay.slots.length === 0) {
      effectiveSchedule[day] = { closed: true, slots: [] };
      continue;
    }

    // Compute slot intersections
    const effectiveSlots = computeEffectiveDaySlots(storeDay.slots, driverDay.slots);

    if (effectiveSlots.length > 0) {
      effectiveSchedule[day] = { closed: false, slots: effectiveSlots };
    } else {
      effectiveSchedule[day] = { closed: true, slots: [] };
    }
  }

  return effectiveSchedule;
}

/**
 * Check if delivery is available right now based on multi-slot effective schedule
 */
export function isDeliveryAvailableNowMultiSlot(effectiveSchedule: MultiSlotSchedule): boolean {
  const now = new Date();
  const dayName = SCHEDULE_DAYS[now.getDay()] as DayOfWeek;
  const daySchedule = effectiveSchedule[dayName];

  if (!daySchedule || daySchedule.closed || daySchedule.slots.length === 0) return false;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Check if current time falls within any slot
  return daySchedule.slots.some(slot => {
    const openMinutes = scheduleTimeToMinutes(slot.open);
    const closeMinutes = scheduleTimeToMinutes(slot.close);
    return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  });
}

/**
 * Get today's effective hours as a formatted string (multi-slot version)
 * Returns multiple time ranges if applicable (e.g., "9:00 AM - 12:00 PM, 2:00 PM - 6:00 PM")
 */
export function getTodayEffectiveHoursMultiSlot(
  effectiveSchedule: MultiSlotSchedule,
  noDeliveryText: string = 'No delivery today'
): string {
  const dayName = SCHEDULE_DAYS[new Date().getDay()] as DayOfWeek;
  const daySchedule = effectiveSchedule[dayName];

  if (!daySchedule || daySchedule.closed || daySchedule.slots.length === 0) {
    return noDeliveryText;
  }

  return daySchedule.slots
    .map(slot => `${formatTime12Hour(slot.open)} - ${formatTime12Hour(slot.close)}`)
    .join(', ');
}

/**
 * Get a summary of available days (multi-slot version)
 */
export function getAvailableDaysSummaryMultiSlot(
  effectiveSchedule: MultiSlotSchedule,
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

  return SCHEDULE_DAYS.filter((day) => {
    const schedule = effectiveSchedule[day];
    return schedule && !schedule.closed && schedule.slots.length > 0;
  }).map((day) => (abbreviated ? abbreviations[day] : day));
}

/**
 * Find the next available delivery day (multi-slot version)
 */
export function getNextAvailableDayMultiSlot(
  effectiveSchedule: MultiSlotSchedule
): { day: string; isToday: boolean; isTomorrow: boolean } | null {
  const now = new Date();
  const currentDayIndex = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Check up to 7 days ahead
  for (let i = 0; i < 7; i++) {
    const dayIndex = (currentDayIndex + i) % 7;
    const dayName = SCHEDULE_DAYS[dayIndex] as DayOfWeek;
    const daySchedule = effectiveSchedule[dayName];

    if (daySchedule && !daySchedule.closed && daySchedule.slots.length > 0) {
      // If it's today, check if we're still within any time window
      if (i === 0) {
        const hasAvailableSlot = daySchedule.slots.some(slot => {
          const closeMinutes = scheduleTimeToMinutes(slot.close);
          return currentMinutes < closeMinutes;
        });
        if (hasAvailableSlot) {
          return { day: dayName, isToday: true, isTomorrow: false };
        }
        // All slots have passed for today, continue to tomorrow
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

/**
 * Available delivery date with time slots
 */
export interface AvailableDeliveryDate {
  date: Date;
  dayName: DayOfWeek;
  slots: MultiSlotTimeSlot[];
  isToday: boolean;
  isTomorrow: boolean;
}

/**
 * Get available delivery dates based on effective schedule
 *
 * Returns dates (within maxDays) where the store has delivery slots.
 * Respects minimum hours from now rule (default 24 hours).
 *
 * @param effectiveSchedule - The computed effective schedule (store ∩ drivers)
 * @param maxDays - Maximum days ahead to check (default 14)
 * @param minHoursFromNow - Minimum hours from now for first available date (default 24)
 * @returns Array of available dates with their time slots
 */
export function getAvailableDeliveryDatesMultiSlot(
  effectiveSchedule: MultiSlotSchedule,
  maxDays: number = 14,
  minHoursFromNow: number = 24
): AvailableDeliveryDate[] {
  const results: AvailableDeliveryDate[] = [];
  const now = new Date();

  // Calculate the minimum date (now + minHoursFromNow)
  const minDate = new Date(now.getTime() + minHoursFromNow * 60 * 60 * 1000);

  // Start checking from tomorrow at midnight (or today if minHours allows)
  const startDate = new Date(minDate);
  startDate.setHours(0, 0, 0, 0);

  // If minDate is past midnight of the calculated day, move to the next day
  if (minDate.getDate() !== startDate.getDate() || minDate > startDate) {
    // If we're past the start of minDate's day, check if any slots are still available
    // Otherwise start from the next full day
    const hoursLeftInDay = 24 - minDate.getHours();
    if (hoursLeftInDay < 2) {
      // Less than 2 hours left in the day, start from tomorrow
      startDate.setDate(startDate.getDate() + 1);
    }
  }

  // Check each day up to maxDays
  for (let i = 0; i < maxDays && results.length < maxDays; i++) {
    const checkDate = new Date(startDate);
    checkDate.setDate(startDate.getDate() + i);

    const dayIndex = checkDate.getDay();
    const dayName = SCHEDULE_DAYS[dayIndex] as DayOfWeek;
    const daySchedule = effectiveSchedule[dayName];

    // Skip if day is closed or has no slots
    if (!daySchedule || daySchedule.closed || daySchedule.slots.length === 0) {
      continue;
    }

    // For the first day, filter out slots that have already passed
    let availableSlots = daySchedule.slots;

    // Check if this date is today or tomorrow based on current time
    const todayMidnight = new Date(now);
    todayMidnight.setHours(0, 0, 0, 0);
    const tomorrowMidnight = new Date(todayMidnight);
    tomorrowMidnight.setDate(tomorrowMidnight.getDate() + 1);

    const isToday = checkDate.getTime() === todayMidnight.getTime();
    const isTomorrow = checkDate.getTime() === tomorrowMidnight.getTime();

    // If checking today, only include slots that are still available
    if (isToday) {
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      availableSlots = daySchedule.slots.filter(slot => {
        const closeMinutes = scheduleTimeToMinutes(slot.close);
        return currentMinutes < closeMinutes;
      });

      if (availableSlots.length === 0) {
        continue;
      }
    }

    // Ensure the date respects minHoursFromNow
    if (checkDate < minDate) {
      // This day is before our minimum date, but might have late slots
      // For simplicity, skip days before minDate entirely
      continue;
    }

    results.push({
      date: checkDate,
      dayName,
      slots: availableSlots,
      isToday,
      isTomorrow,
    });
  }

  return results;
}
