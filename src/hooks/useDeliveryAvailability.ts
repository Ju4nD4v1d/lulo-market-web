/**
 * useDeliveryAvailability - Computes when delivery is available
 *
 * This hook computes effective store hours as the INTERSECTION of:
 * - Store's raw delivery schedule (multi-slot)
 * - Combined availability of all active drivers (UNION of drivers' schedules)
 *
 * Supports up to 3 time slots per day for both stores and drivers.
 */

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

interface UseDeliveryAvailabilityOptions {
  /** Store to compute delivery availability for */
  store: StoreData | null;
  /** Whether to enable the query (default: true) */
  enabled?: boolean;
}

interface DeliveryAvailabilityResult {
  /** Computed delivery schedule (intersection of store + driver availability) */
  deliverySchedule: MultiSlotSchedule | null;
  /** Whether delivery is available right now */
  isDeliveryAvailableNow: boolean;
  /** Today's delivery hours as formatted string (e.g., "10:00 AM - 3:00 PM") */
  todayDeliveryHours: string;
  /** List of available delivery days (e.g., ["Fri", "Sat", "Sun"]) */
  availableDays: string[];
  /** Next available delivery day info */
  nextAvailableDay: { day: string; isToday: boolean; isTomorrow: boolean } | null;
  /** Loading state (waiting for driver data) */
  isLoading: boolean;
  /** The store's raw schedule (before driver intersection) */
  storeSchedule: MultiSlotSchedule | null;
  /** Number of active drivers */
  activeDriverCount: number;

  // Backward compatibility aliases (deprecated)
  /** @deprecated Use deliverySchedule instead */
  effectiveHours: MultiSlotSchedule | null;
  /** @deprecated Use isDeliveryAvailableNow instead */
  isDeliveryAvailable: boolean;
  /** @deprecated Use todayDeliveryHours instead */
  todayHoursText: string;
  /** @deprecated Use storeSchedule instead */
  rawStoreSchedule: MultiSlotSchedule | null;
}

/**
 * Hook that computes delivery availability for a store.
 *
 * Effective hours = INTERSECTION of:
 * - Store's raw delivery schedule (multi-slot)
 * - Combined availability of all active drivers (UNION of all drivers' schedules)
 *
 * @example
 * ```typescript
 * const { deliverySchedule, isDeliveryAvailableNow, todayDeliveryHours } =
 *   useDeliveryAvailability({ store });
 * ```
 */
export const useDeliveryAvailability = ({
  store,
  enabled = true,
}: UseDeliveryAvailabilityOptions): DeliveryAvailabilityResult => {
  const { drivers: activeDrivers, isLoading } = useActiveDriversQuery(enabled);

  // Get store's multi-slot schedule (with migration from legacy format)
  const storeSchedule = useMemo((): MultiSlotSchedule | null => {
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
  const deliverySchedule = useMemo(() => {
    if (!storeSchedule) return null;
    return computeEffectiveHoursMultiSlot(storeSchedule, activeDrivers);
  }, [storeSchedule, activeDrivers]);

  const isDeliveryAvailableNow = useMemo(() => {
    if (!deliverySchedule) return false;
    return isDeliveryAvailableNowMultiSlot(deliverySchedule);
  }, [deliverySchedule]);

  const todayDeliveryHours = useMemo(() => {
    if (!deliverySchedule) return 'Schedule unavailable';
    return getTodayEffectiveHoursMultiSlot(deliverySchedule);
  }, [deliverySchedule]);

  const availableDays = useMemo(() => {
    if (!deliverySchedule) return [];
    return getAvailableDaysSummaryMultiSlot(deliverySchedule, true);
  }, [deliverySchedule]);

  const nextAvailableDay = useMemo(() => {
    if (!deliverySchedule) return null;
    return getNextAvailableDayMultiSlot(deliverySchedule);
  }, [deliverySchedule]);

  return {
    // New names
    deliverySchedule,
    isDeliveryAvailableNow,
    todayDeliveryHours,
    availableDays,
    nextAvailableDay,
    isLoading,
    storeSchedule,
    activeDriverCount: activeDrivers.length,

    // Backward compatibility (deprecated)
    effectiveHours: deliverySchedule,
    isDeliveryAvailable: isDeliveryAvailableNow,
    todayHoursText: todayDeliveryHours,
    rawStoreSchedule: storeSchedule,
  };
};

/**
 * @deprecated Use useDeliveryAvailability instead
 */
export const useEffectiveHours = useDeliveryAvailability;
