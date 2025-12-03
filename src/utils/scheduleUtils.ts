/**
 * Schedule Utilities
 *
 * Helper functions for working with multi-slot schedules.
 * Includes migration, validation, and time manipulation functions.
 */

import {
  TimeSlot,
  DaySchedule,
  DayOfWeek,
  MultiSlotSchedule,
  LegacySchedule,
  DAYS_OF_WEEK,
  DEFAULT_MULTI_SLOT_SCHEDULE,
  MAX_SLOTS_PER_DAY,
} from '../types/schedule';

// ============================================================================
// Time Conversion Helpers
// ============================================================================

/**
 * Convert time string (HH:MM) to minutes since midnight
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + (minutes || 0);
}

/**
 * Convert minutes since midnight to time string (HH:MM)
 */
export function minutesToTime(minutes: number): string {
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
// Day Name Normalization
// ============================================================================

/**
 * Map of various day name formats to canonical English day names
 */
const DAY_NAME_MAP: Record<string, DayOfWeek> = {
  // English - lowercase
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
  miercoles: 'Wednesday',
  jueves: 'Thursday',
  viernes: 'Friday',
  sábado: 'Saturday',
  sabado: 'Saturday',
};

/**
 * Normalize a day name to canonical English format
 */
export function normalizeDayName(day: string): DayOfWeek | null {
  // First check if already canonical
  if (DAYS_OF_WEEK.includes(day as DayOfWeek)) {
    return day as DayOfWeek;
  }
  const lowered = day.toLowerCase().trim();
  return DAY_NAME_MAP[lowered] || null;
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Check if a time slot is valid (open < close)
 */
export function isValidTimeSlot(slot: TimeSlot): boolean {
  const openMins = timeToMinutes(slot.open);
  const closeMins = timeToMinutes(slot.close);
  return openMins < closeMins;
}

/**
 * Check if two time slots overlap
 */
export function slotsOverlap(slot1: TimeSlot, slot2: TimeSlot): boolean {
  const start1 = timeToMinutes(slot1.open);
  const end1 = timeToMinutes(slot1.close);
  const start2 = timeToMinutes(slot2.open);
  const end2 = timeToMinutes(slot2.close);

  // Slots overlap if one starts before the other ends and vice versa
  return start1 < end2 && start2 < end1;
}

/**
 * Validation error for a day's schedule
 */
export interface ScheduleValidationError {
  day: DayOfWeek;
  slotIndex?: number;
  type: 'invalid_time' | 'overlap' | 'max_slots';
  message: string;
}

/**
 * Validate a day's schedule
 */
export function validateDaySchedule(
  day: DayOfWeek,
  daySchedule: DaySchedule
): ScheduleValidationError[] {
  const errors: ScheduleValidationError[] = [];

  if (daySchedule.closed) {
    return errors; // No validation needed for closed days
  }

  // Check max slots
  if (daySchedule.slots.length > MAX_SLOTS_PER_DAY) {
    errors.push({
      day,
      type: 'max_slots',
      message: `Maximum ${MAX_SLOTS_PER_DAY} time slots allowed per day`,
    });
  }

  // Validate each slot
  daySchedule.slots.forEach((slot, index) => {
    if (!isValidTimeSlot(slot)) {
      errors.push({
        day,
        slotIndex: index,
        type: 'invalid_time',
        message: 'End time must be after start time',
      });
    }
  });

  // Check for overlapping slots
  for (let i = 0; i < daySchedule.slots.length; i++) {
    for (let j = i + 1; j < daySchedule.slots.length; j++) {
      if (slotsOverlap(daySchedule.slots[i], daySchedule.slots[j])) {
        errors.push({
          day,
          slotIndex: j,
          type: 'overlap',
          message: 'Time slots cannot overlap',
        });
      }
    }
  }

  return errors;
}

/**
 * Validate entire schedule
 */
export function validateSchedule(schedule: MultiSlotSchedule): ScheduleValidationError[] {
  const errors: ScheduleValidationError[] = [];

  for (const day of DAYS_OF_WEEK) {
    const dayErrors = validateDaySchedule(day, schedule[day]);
    errors.push(...dayErrors);
  }

  return errors;
}

/**
 * Check if schedule has at least one open day with at least one slot
 */
export function hasAtLeastOneOpenDay(schedule: MultiSlotSchedule): boolean {
  return DAYS_OF_WEEK.some(
    (day) => !schedule[day].closed && schedule[day].slots.length > 0
  );
}

// ============================================================================
// Slot Manipulation Functions
// ============================================================================

/**
 * Sort slots by start time (earliest first)
 */
export function sortSlots(slots: TimeSlot[]): TimeSlot[] {
  return [...slots].sort((a, b) => timeToMinutes(a.open) - timeToMinutes(b.open));
}

/**
 * Create an empty slot with default times
 */
export function createEmptySlot(suggestAfter?: TimeSlot): TimeSlot {
  if (suggestAfter) {
    // Suggest a slot starting 1 hour after the previous slot ends
    const afterMinutes = timeToMinutes(suggestAfter.close) + 60;
    const endMinutes = afterMinutes + 180; // 3 hours default duration
    return {
      open: minutesToTime(Math.min(afterMinutes, 23 * 60)),
      close: minutesToTime(Math.min(endMinutes, 23 * 60 + 59)),
    };
  }
  return { open: '09:00', close: '17:00' };
}

// ============================================================================
// Migration Functions (Legacy to Multi-Slot)
// ============================================================================

/**
 * Migrate a legacy single-slot schedule to multi-slot format
 */
export function migrateFromLegacySchedule(
  legacySchedule: LegacySchedule | undefined
): MultiSlotSchedule {
  if (!legacySchedule || Object.keys(legacySchedule).length === 0) {
    return { ...DEFAULT_MULTI_SLOT_SCHEDULE };
  }

  const result: MultiSlotSchedule = { ...DEFAULT_MULTI_SLOT_SCHEDULE };

  for (const day of DAYS_OF_WEEK) {
    // Try to find the day in legacy schedule (handles various key formats)
    let legacyDay = legacySchedule[day];

    // Try lowercase if not found
    if (!legacyDay) {
      legacyDay = legacySchedule[day.toLowerCase()];
    }

    // Try to find by normalized name
    if (!legacyDay) {
      for (const key of Object.keys(legacySchedule)) {
        const normalized = normalizeDayName(key);
        if (normalized === day) {
          legacyDay = legacySchedule[key];
          break;
        }
      }
    }

    if (legacyDay) {
      result[day] = {
        closed: legacyDay.closed,
        slots: legacyDay.closed ? [] : [{ open: legacyDay.open, close: legacyDay.close }],
      };
    }
  }

  return result;
}

/**
 * Convert multi-slot schedule back to legacy format (for backward compatibility)
 * Uses the first slot of each day, or marks as closed if no slots
 */
export function convertToLegacySchedule(schedule: MultiSlotSchedule): LegacySchedule {
  const result: LegacySchedule = {};

  for (const day of DAYS_OF_WEEK) {
    const daySchedule = schedule[day];
    if (daySchedule.closed || daySchedule.slots.length === 0) {
      result[day] = { open: '09:00', close: '17:00', closed: true };
    } else {
      // Use the first slot (or merged if we want to show full range)
      const sortedSlots = sortSlots(daySchedule.slots);
      result[day] = {
        open: sortedSlots[0].open,
        close: sortedSlots[sortedSlots.length - 1].close,
        closed: false,
      };
    }
  }

  return result;
}

// ============================================================================
// Schedule Intersection (for effective hours calculation)
// ============================================================================

/**
 * Get the intersection of two time slots
 * Returns null if there's no overlap
 */
export function getSlotIntersection(
  slot1: TimeSlot,
  slot2: TimeSlot
): TimeSlot | null {
  const start1 = timeToMinutes(slot1.open);
  const end1 = timeToMinutes(slot1.close);
  const start2 = timeToMinutes(slot2.open);
  const end2 = timeToMinutes(slot2.close);

  const intersectStart = Math.max(start1, start2);
  const intersectEnd = Math.min(end1, end2);

  if (intersectStart >= intersectEnd) return null;

  return {
    open: minutesToTime(intersectStart),
    close: minutesToTime(intersectEnd),
  };
}

/**
 * Get intersections of a slot with multiple slots
 * Returns array of intersecting portions
 */
export function getSlotIntersections(
  slot: TimeSlot,
  otherSlots: TimeSlot[]
): TimeSlot[] {
  const intersections: TimeSlot[] = [];

  for (const other of otherSlots) {
    const intersection = getSlotIntersection(slot, other);
    if (intersection) {
      intersections.push(intersection);
    }
  }

  return sortSlots(intersections);
}

/**
 * Merge overlapping slots into continuous ranges
 */
export function mergeOverlappingSlots(slots: TimeSlot[]): TimeSlot[] {
  if (slots.length === 0) return [];

  const sorted = sortSlots(slots);
  const merged: TimeSlot[] = [{ ...sorted[0] }];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];

    const lastEnd = timeToMinutes(last.close);
    const currentStart = timeToMinutes(current.open);

    if (currentStart <= lastEnd) {
      // Overlapping or adjacent - extend the last slot
      const currentEnd = timeToMinutes(current.close);
      if (currentEnd > lastEnd) {
        last.close = current.close;
      }
    } else {
      // Gap - add as new slot
      merged.push({ ...current });
    }
  }

  return merged;
}

/**
 * Compute effective slots for a day given store slots and driver slots
 * Result is the intersection: times when BOTH store and drivers are available
 */
export function computeEffectiveDaySlots(
  storeSlots: TimeSlot[],
  driverSlots: TimeSlot[]
): TimeSlot[] {
  if (storeSlots.length === 0 || driverSlots.length === 0) {
    return [];
  }

  const allIntersections: TimeSlot[] = [];

  // For each store slot, find intersections with driver slots
  for (const storeSlot of storeSlots) {
    const intersections = getSlotIntersections(storeSlot, driverSlots);
    allIntersections.push(...intersections);
  }

  // Merge any overlapping results
  return mergeOverlappingSlots(allIntersections);
}
