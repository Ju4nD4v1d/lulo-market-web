/**
 * Date utility functions for checkout delivery dates
 */

import { AvailableDeliveryDate } from '../../../utils/effectiveHours';
import { TimeSlot } from '../../../types/schedule';

/**
 * Delivery date option for UI display
 */
export interface DeliveryDateOption {
  value: string;       // ISO date string (YYYY-MM-DD)
  label: string;       // Formatted display label
  slots?: TimeSlot[];  // Available time slots for this date
  isToday?: boolean;
  isTomorrow?: boolean;
}

/**
 * Format available delivery dates from effective schedule for checkout form
 *
 * @param availableDates - Dates from getAvailableDeliveryDatesMultiSlot()
 * @param locale - User's locale ('en' or 'es')
 * @param maxOptions - Maximum number of options to return (default 3)
 * @returns Formatted date options for UI display
 */
export const formatDeliveryDateOptions = (
  availableDates: AvailableDeliveryDate[],
  locale: string = 'en',
  maxOptions: number = 3
): DeliveryDateOption[] => {
  const dateLocale = locale === 'es' ? 'es-ES' : 'en-US';

  return availableDates.slice(0, maxOptions).map((dateInfo) => {
    const dateValue = dateInfo.date.toISOString().split('T')[0];
    const dayName = dateInfo.date.toLocaleDateString(dateLocale, { weekday: 'long' });
    const monthDay = dateInfo.date.toLocaleDateString(dateLocale, { month: 'short', day: 'numeric' });

    // Format label based on isToday/isTomorrow
    let label: string;
    if (dateInfo.isToday) {
      label = locale === 'es' ? `Hoy, ${monthDay}` : `Today, ${monthDay}`;
    } else if (dateInfo.isTomorrow) {
      label = locale === 'es' ? `Mañana, ${monthDay}` : `Tomorrow, ${monthDay}`;
    } else {
      // Capitalize first letter of day name
      const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
      label = `${capitalizedDay}, ${monthDay}`;
    }

    return {
      value: dateValue,
      label,
      slots: dateInfo.slots,
      isToday: dateInfo.isToday,
      isTomorrow: dateInfo.isTomorrow,
    };
  });
};

/**
 * Get three closest available delivery dates (more than 24 hours from now, within 1 week)
 * @deprecated Use formatDeliveryDateOptions with getAvailableDeliveryDatesMultiSlot instead
 * @returns Array of date objects with value (ISO date) and label (formatted display)
 */
export const getThreeClosestDeliveryDates = (): Array<{ value: string; label: string }> => {
  const now = new Date();
  const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const dates: Array<{ value: string; label: string }> = [];
  const startDate = new Date(next24Hours);
  startDate.setDate(startDate.getDate() + 1);
  startDate.setHours(0, 0, 0, 0);

  // Generate up to 3 dates that are > 24 hours and < 1 week
  for (let i = 0; i < 7 && dates.length < 3; i++) {
    const checkDate = new Date(startDate);
    checkDate.setDate(startDate.getDate() + i);

    // Only include dates within a week
    if (checkDate <= oneWeekFromNow) {
      const dateValue = checkDate.toISOString().split('T')[0];
      const dayName = checkDate.toLocaleDateString('en-US', { weekday: 'long' });
      const monthDay = checkDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Format label based on how far the date is
      let label: string;
      const diffDays = Math.ceil((checkDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays <= 1) {
        label = `Tomorrow, ${monthDay}`;
      } else if (diffDays === 2) {
        label = `${dayName}, ${monthDay}`;
      } else {
        label = `${dayName}, ${monthDay}`;
      }

      dates.push({ value: dateValue, label });
    }
  }

  return dates;
};

/**
 * Get next available delivery date (more than 24 hours from now)
 * @returns ISO date string of the next available delivery date
 */
export const getNextAvailableDeliveryDate = (): string => {
  const availableDates = getThreeClosestDeliveryDates();
  if (availableDates.length > 0) {
    return availableDates[0].value;
  }

  // Fallback if no dates available within a week
  const now = new Date();
  const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const startDate = new Date(next24Hours);
  startDate.setDate(startDate.getDate() + 1);
  startDate.setHours(0, 0, 0, 0);

  return startDate.toISOString().split('T')[0];
};
