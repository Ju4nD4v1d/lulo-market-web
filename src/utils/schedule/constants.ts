/**
 * Schedule Constants
 *
 * Centralized constants for delivery scheduling logic.
 * All magic numbers related to delivery windows, lead times, and scheduling are defined here.
 */

import { DayOfWeek } from '../../types/schedule';

// ============================================================================
// Delivery Lead Time Constants
// ============================================================================

/**
 * Minimum hours before a delivery can be scheduled.
 * Used at checkout to enforce a buffer between order placement and delivery.
 * Example: If minHoursFromNow=24, an order at 10am Monday can't be delivered until 10am Tuesday.
 */
export const CHECKOUT_LEAD_HOURS = 24;

/**
 * Lead time for cart display purposes (informational only).
 * Set to 0 to show the actual next available slot to the user in the cart.
 */
export const CART_DISPLAY_LEAD_HOURS = 0;

/**
 * Minimum hours remaining in a day to consider it for same-day delivery.
 * If less than this many hours remain in the delivery window, skip to next day.
 */
export const MIN_HOURS_FOR_SAME_DAY = 2;

// ============================================================================
// Scheduling Window Constants
// ============================================================================

/**
 * Maximum number of days to look ahead when computing available delivery dates.
 * Users can schedule deliveries up to this many days in the future.
 */
export const DELIVERY_LOOKAHEAD_DAYS = 14;

/**
 * Number of days in a week (used for schedule iteration).
 */
export const DAYS_IN_WEEK = 7;

// ============================================================================
// Display Constants
// ============================================================================

/**
 * Maximum number of delivery date options to show in the checkout selector.
 */
export const MAX_DELIVERY_DATE_OPTIONS = 5;

/**
 * Day abbreviations for UI display (English).
 * Maps full day names to 3-letter abbreviations.
 */
export const DAY_ABBREVIATIONS: Record<DayOfWeek, string> = {
  Sunday: 'Sun',
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
};

// ============================================================================
// Time Constants
// ============================================================================

/**
 * Minutes in an hour (for time calculations).
 */
export const MINUTES_PER_HOUR = 60;

/**
 * Hours in a day.
 */
export const HOURS_PER_DAY = 24;

/**
 * Milliseconds in an hour (for Date calculations).
 */
export const MS_PER_HOUR = 60 * 60 * 1000;

/**
 * Milliseconds in a minute.
 */
export const MS_PER_MINUTE = 60 * 1000;
