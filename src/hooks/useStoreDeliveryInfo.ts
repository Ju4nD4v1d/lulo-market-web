/**
 * useStoreDeliveryInfo - Convenience hook for store pages
 *
 * Combines store data fetching with delivery availability computation.
 * Use this when you need both store details and delivery schedule together.
 */

import { StoreData } from '../types/store';
import { MultiSlotSchedule } from '../types/schedule';
import { useStoreQuery } from './queries/useStoreQuery';
import { useDeliveryAvailability } from './useDeliveryAvailability';

interface UseStoreDeliveryInfoOptions {
  /** Store ID to fetch */
  storeId: string | null;
  /** Whether to enable the queries (default: true) */
  enabled?: boolean;
}

interface StoreDeliveryInfoResult {
  // Store data
  /** The store data */
  store: StoreData | null;
  /** Whether the store query is loading */
  isLoadingStore: boolean;
  /** Whether the store query errored */
  isStoreError: boolean;

  // Delivery availability (computed from store + drivers)
  /** Computed delivery schedule (store hours intersected with driver availability) */
  deliverySchedule: MultiSlotSchedule | null;
  /** Whether delivery is available right now */
  isDeliveryAvailableNow: boolean;
  /** Today's delivery hours as formatted text */
  todayDeliveryHours: string;
  /** Available delivery days (abbreviated) */
  availableDays: string[];
  /** Next available delivery day */
  nextAvailableDay: { day: string; isToday: boolean; isTomorrow: boolean } | null;
  /** Number of active drivers */
  activeDriverCount: number;

  // Combined loading state
  /** Whether any data is still loading (store OR drivers) */
  isLoading: boolean;
  /** Whether the store and delivery data are ready */
  isReady: boolean;
}

/**
 * Convenience hook for store pages that need both store data and delivery availability.
 *
 * Combines useStoreQuery and useDeliveryAvailability to avoid duplicate code
 * and manage the enabled state automatically.
 *
 * @example
 * ```typescript
 * // In a store menu page
 * const { store, deliverySchedule, isLoading, isDeliveryAvailableNow } =
 *   useStoreDeliveryInfo({ storeId });
 * ```
 */
export const useStoreDeliveryInfo = ({
  storeId,
  enabled = true,
}: UseStoreDeliveryInfoOptions): StoreDeliveryInfoResult => {
  // Fetch store data
  const {
    store,
    isLoading: isLoadingStore,
    isError: isStoreError,
  } = useStoreQuery(enabled ? storeId : null);

  // Compute delivery availability (only when store is loaded)
  const {
    deliverySchedule,
    isDeliveryAvailableNow,
    todayDeliveryHours,
    availableDays,
    nextAvailableDay,
    isLoading: isLoadingDelivery,
    activeDriverCount,
  } = useDeliveryAvailability({
    store,
    enabled: enabled && !!store,
  });

  // Combined loading state
  const isLoading = isLoadingStore || isLoadingDelivery;
  const isReady = !isLoading && !!store && !!deliverySchedule;

  return {
    // Store
    store,
    isLoadingStore,
    isStoreError,

    // Delivery
    deliverySchedule,
    isDeliveryAvailableNow,
    todayDeliveryHours,
    availableDays,
    nextAvailableDay,
    activeDriverCount,

    // Combined
    isLoading,
    isReady,
  };
};
