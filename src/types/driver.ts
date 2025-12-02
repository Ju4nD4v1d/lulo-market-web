/**
 * Driver/Dispatcher type definitions
 * Drivers are global platform-level entities (not per-store)
 * They don't have login credentials - just data entries representing delivery personnel
 */

export interface DriverScheduleSlot {
  open: string;    // "18:00" (24-hour format)
  close: string;   // "22:00"
  closed: boolean; // true if driver not available this day
}

export interface DriverSchedule {
  Sunday: DriverScheduleSlot;
  Monday: DriverScheduleSlot;
  Tuesday: DriverScheduleSlot;
  Wednesday: DriverScheduleSlot;
  Thursday: DriverScheduleSlot;
  Friday: DriverScheduleSlot;
  Saturday: DriverScheduleSlot;
}

export interface DriverAddress {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Driver {
  id: string;
  name: string;
  isActive: boolean;
  startingAddress: DriverAddress;
  availabilitySchedule: DriverSchedule;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
  phone?: string;
  email?: string;
}

// Default schedule: Friday 6pm-10pm, Saturday 8am-6pm, Sunday 10am-3pm
export const DEFAULT_DRIVER_SCHEDULE: DriverSchedule = {
  Sunday: { open: '10:00', close: '15:00', closed: false },
  Monday: { open: '09:00', close: '17:00', closed: true },
  Tuesday: { open: '09:00', close: '17:00', closed: true },
  Wednesday: { open: '09:00', close: '17:00', closed: true },
  Thursday: { open: '09:00', close: '17:00', closed: true },
  Friday: { open: '18:00', close: '22:00', closed: false },
  Saturday: { open: '08:00', close: '18:00', closed: false },
};

// Days of week in order (matching JavaScript's Date.getDay())
export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export type DayOfWeek = typeof DAYS_OF_WEEK[number];
