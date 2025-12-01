import { useMemo } from 'react';
import { StoreData } from '../types/store';
import { useActiveDriversQuery } from './queries/useDriversQuery';
import {
  computeEffectiveHours,
  isDeliveryAvailableNow,
  getTodayEffectiveHours,
  getAvailableDaysSummary,
  getNextAvailableDay,
  WeeklySchedule,
} from '../utils/effectiveHours';

interface UseEffectiveHoursOptions {
  store: StoreData | null;
  enabled?: boolean;
}

interface EffectiveHoursResult {
  /** Computed effective schedule (intersection of store + driver availability) */
  effectiveHours: WeeklySchedule | null;
  /** Whether delivery is available right now */
  isDeliveryAvailable: boolean;
  /** Today's hours as formatted string (e.g., "10:00 AM - 3:00 PM") */
  todayHoursText: string;
  /** List of available days (e.g., ["Fri", "Sat", "Sun"]) */
  availableDays: string[];
  /** Next available delivery day info */
  nextAvailableDay: { day: string; isToday: boolean; isTomorrow: boolean } | null;
  /** Loading state */
  isLoading: boolean;
  /** The store's raw hours (before driver intersection) */
  rawStoreHours: WeeklySchedule | null;
  /** Number of active drivers */
  activeDriverCount: number;
}

/**
 * Hook that computes effective store hours
 *
 * Effective hours = INTERSECTION of:
 * - Store's raw delivery/business hours
 * - Combined availability of all active drivers (UNION)
 *
 * @example
 * const { effectiveHours, isDeliveryAvailable, todayHoursText } = useEffectiveHours({ store });
 */
export const useEffectiveHours = ({
  store,
  enabled = true,
}: UseEffectiveHoursOptions): EffectiveHoursResult => {
  const { drivers: activeDrivers, isLoading } = useActiveDriversQuery(enabled);

  const rawStoreHours = useMemo(() => {
    if (!store) return null;
    return (store.deliveryHours || store.businessHours) as WeeklySchedule | null;
  }, [store?.deliveryHours, store?.businessHours]);

  const effectiveHours = useMemo(() => {
    if (!rawStoreHours) return null;
    return computeEffectiveHours(rawStoreHours, activeDrivers);
  }, [rawStoreHours, activeDrivers]);

  const isDeliveryAvailable = useMemo(() => {
    if (!effectiveHours) return false;
    return isDeliveryAvailableNow(effectiveHours);
  }, [effectiveHours]);

  const todayHoursText = useMemo(() => {
    if (!effectiveHours) return 'Schedule unavailable';
    return getTodayEffectiveHours(effectiveHours);
  }, [effectiveHours]);

  const availableDays = useMemo(() => {
    if (!effectiveHours) return [];
    return getAvailableDaysSummary(effectiveHours, true);
  }, [effectiveHours]);

  const nextAvailableDay = useMemo(() => {
    if (!effectiveHours) return null;
    return getNextAvailableDay(effectiveHours);
  }, [effectiveHours]);

  return {
    effectiveHours,
    isDeliveryAvailable,
    todayHoursText,
    availableDays,
    nextAvailableDay,
    isLoading,
    rawStoreHours,
    activeDriverCount: activeDrivers.length,
  };
};
