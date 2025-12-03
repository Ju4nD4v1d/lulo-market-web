/**
 * Multi-Slot Schedule Types
 *
 * Shared types for schedules that support multiple time slots per day.
 * Used by both store delivery hours and driver availability.
 */

/**
 * A single time slot with open and close times
 */
export interface TimeSlot {
  open: string;   // 24-hour format: "09:00"
  close: string;  // 24-hour format: "17:00"
}

/**
 * A day's schedule with multiple possible time slots
 */
export interface DaySchedule {
  closed: boolean;
  slots: TimeSlot[];  // Array of 0-3 time slots
}

/**
 * Days of the week
 */
export type DayOfWeek = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

/**
 * Complete weekly schedule with multiple slots per day
 */
export interface MultiSlotSchedule {
  Sunday: DaySchedule;
  Monday: DaySchedule;
  Tuesday: DaySchedule;
  Wednesday: DaySchedule;
  Thursday: DaySchedule;
  Friday: DaySchedule;
  Saturday: DaySchedule;
}

/**
 * Days of week in JavaScript Date.getDay() order (Sunday = 0)
 */
export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/**
 * Days of week starting from Monday (common business display order)
 */
export const DAYS_OF_WEEK_MONDAY_FIRST: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

/**
 * Maximum number of time slots allowed per day
 */
export const MAX_SLOTS_PER_DAY = 3;

/**
 * Default schedule: Monday-Saturday 9am-5pm, Sunday closed
 */
export const DEFAULT_MULTI_SLOT_SCHEDULE: MultiSlotSchedule = {
  Sunday: { closed: true, slots: [] },
  Monday: { closed: false, slots: [{ open: '09:00', close: '17:00' }] },
  Tuesday: { closed: false, slots: [{ open: '09:00', close: '17:00' }] },
  Wednesday: { closed: false, slots: [{ open: '09:00', close: '17:00' }] },
  Thursday: { closed: false, slots: [{ open: '09:00', close: '17:00' }] },
  Friday: { closed: false, slots: [{ open: '09:00', close: '17:00' }] },
  Saturday: { closed: false, slots: [{ open: '09:00', close: '17:00' }] },
};

/**
 * Empty closed schedule (all days closed)
 */
export const EMPTY_SCHEDULE: MultiSlotSchedule = {
  Sunday: { closed: true, slots: [] },
  Monday: { closed: true, slots: [] },
  Tuesday: { closed: true, slots: [] },
  Wednesday: { closed: true, slots: [] },
  Thursday: { closed: true, slots: [] },
  Friday: { closed: true, slots: [] },
  Saturday: { closed: true, slots: [] },
};

/**
 * Legacy single-slot schedule format (for backward compatibility)
 */
export interface LegacyDaySchedule {
  open: string;
  close: string;
  closed: boolean;
}

export interface LegacySchedule {
  [day: string]: LegacyDaySchedule;
}
