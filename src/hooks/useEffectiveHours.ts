import { useMemo } from 'react';
import { StoreData } from '../types/store';
import { MultiSlotSchedule, DEFAULT_MULTI_SLOT_SCHEDULE } from '../types/schedule';
import { useActiveDriversQuery } from './queries/useDriversQuery';
import {
  computeEffectiveHoursMultiSlot,
  isDeliveryAvailableNowMultiSlot,
  getTodayEffectiveHoursMultiSlot,
  getAvailableDaysSummaryMultiSlot,
  getNextAvailableDayMultiSlot,
} from '../utils/effectiveHours';
import { migrateFromLegacySchedule } from '../utils/scheduleUtils';

interface UseEffectiveHoursOptions {
  store: StoreData | null;
  enabled?: boolean;
}

interface EffectiveHoursResult {
  /** Computed effective schedule (intersection of store + driver availability) - multi-slot */
  effectiveHours: MultiSlotSchedule | null;
  /** Whether delivery is available right now */
  isDeliveryAvailable: boolean;
  /** Today's hours as formatted string (e.g., "10:00 AM - 3:00 PM" or "9:00 AM - 12:00 PM, 2:00 PM - 6:00 PM") */
  todayHoursText: string;
  /** List of available days (e.g., ["Fri", "Sat", "Sun"]) */
  availableDays: string[];
  /** Next available delivery day info */
  nextAvailableDay: { day: string; isToday: boolean; isTomorrow: boolean } | null;
  /** Loading state */
  isLoading: boolean;
  /** The store's raw multi-slot schedule (before driver intersection) */
  rawStoreSchedule: MultiSlotSchedule | null;
  /** Number of active drivers */
  activeDriverCount: number;
}

/**
 * Hook that computes effective store hours (multi-slot version)
 *
 * Effective hours = INTERSECTION of:
 * - Store's raw delivery schedule (multi-slot)
 * - Combined availability of all active drivers (UNION of all drivers' multi-slot schedules)
 *
 * Supports up to 3 time slots per day for both stores and drivers.
 *
 * @example
 * const { effectiveHours, isDeliveryAvailable, todayHoursText } = useEffectiveHours({ store });
 */
export const useEffectiveHours = ({
  store,
  enabled = true,
}: UseEffectiveHoursOptions): EffectiveHoursResult => {
  const { drivers: activeDrivers, isLoading } = useActiveDriversQuery(enabled);

  // Get store's multi-slot schedule (with migration from legacy format)
  const rawStoreSchedule = useMemo((): MultiSlotSchedule | null => {
    if (!store) return null;

    // Use new deliverySchedule if available
    if (store.deliverySchedule) {
      return store.deliverySchedule;
    }

    // Migrate from legacy deliveryHours or businessHours
    const legacySchedule = store.deliveryHours || store.businessHours;
    if (legacySchedule && Object.keys(legacySchedule).length > 0) {
      return migrateFromLegacySchedule(legacySchedule as Record<string, { open: string; close: string; closed: boolean }>);
    }

    return DEFAULT_MULTI_SLOT_SCHEDULE;
  }, [store?.deliverySchedule, store?.deliveryHours, store?.businessHours]);

  // Compute effective hours using multi-slot intersection logic
  const effectiveHours = useMemo(() => {
    if (!rawStoreSchedule) return null;
    return computeEffectiveHoursMultiSlot(rawStoreSchedule, activeDrivers);
  }, [rawStoreSchedule, activeDrivers]);

  const isDeliveryAvailable = useMemo(() => {
    if (!effectiveHours) return false;
    return isDeliveryAvailableNowMultiSlot(effectiveHours);
  }, [effectiveHours]);

  const todayHoursText = useMemo(() => {
    if (!effectiveHours) return 'Schedule unavailable';
    return getTodayEffectiveHoursMultiSlot(effectiveHours);
  }, [effectiveHours]);

  const availableDays = useMemo(() => {
    if (!effectiveHours) return [];
    return getAvailableDaysSummaryMultiSlot(effectiveHours, true);
  }, [effectiveHours]);

  const nextAvailableDay = useMemo(() => {
    if (!effectiveHours) return null;
    return getNextAvailableDayMultiSlot(effectiveHours);
  }, [effectiveHours]);

  return {
    effectiveHours,
    isDeliveryAvailable,
    todayHoursText,
    availableDays,
    nextAvailableDay,
    isLoading,
    rawStoreSchedule,
    activeDriverCount: activeDrivers.length,
  };
};
