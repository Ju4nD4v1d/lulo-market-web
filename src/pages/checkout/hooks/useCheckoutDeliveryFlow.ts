/**
 * useCheckoutDeliveryFlow - Manages delivery date/time selection in checkout
 *
 * This hook:
 * 1. Computes available delivery dates from store/driver schedules
 * 2. Auto-selects the first available date when dates become available
 * 3. Validates that the selected date is still valid
 * 4. Provides formatted options for the date picker UI
 */

import { useMemo, useEffect } from 'react';
import { useDeliveryAvailability } from '../../../hooks/useDeliveryAvailability';
import { getAvailableDeliveryDatesMultiSlot } from '../../../utils/effectiveHours';
import {
  DELIVERY_LOOKAHEAD_DAYS,
  CHECKOUT_LEAD_HOURS,
  MAX_DELIVERY_DATE_OPTIONS,
} from '../../../utils/schedule/constants';
import { formatDeliveryDateOptions, DeliveryDateOption } from '../utils/dateHelpers';
import { StoreData } from '../../../types';

interface DeliveryFormData {
  deliveryDate: string;
  deliveryTimeWindow?: {
    open: string;
    close: string;
  };
}

interface UseCheckoutDeliveryFlowOptions {
  /** Store data (passed from parent to avoid duplicate queries) */
  store: StoreData | null;
  /** Whether store data is still loading */
  isLoadingStore: boolean;
  /** User's locale for date formatting */
  locale: string;
  /** Current form data containing selected delivery date */
  formData: DeliveryFormData;
  /** Callback to update form data when delivery date changes */
  onDeliveryDateChange: (data: Partial<DeliveryFormData>) => void;
}

interface CheckoutDeliveryFlowResult {
  /** Available delivery date options for the dropdown */
  deliveryDateOptions: DeliveryDateOption[];
  /** Whether the delivery schedule is still loading */
  isLoading: boolean;
  /** Whether no delivery dates are available (store closed or no drivers) */
  hasNoDeliveryDates: boolean;
  /** Whether the checkout can proceed (has valid delivery date) */
  canProceed: boolean;
  /** Error message if delivery is unavailable */
  unavailableReason: string | null;

  // Backward compatibility
  /** @deprecated Use deliveryDateOptions instead */
  availableDeliveryDates: DeliveryDateOption[];
  /** @deprecated Use isLoading instead */
  isLoadingSchedule: boolean;
}

/**
 * Manages delivery date selection in the checkout flow.
 *
 * @example
 * ```typescript
 * const {
 *   deliveryDateOptions,
 *   isLoading,
 *   hasNoDeliveryDates,
 *   canProceed,
 * } = useCheckoutDeliveryFlow({
 *   store: storeData,
 *   isLoadingStore,
 *   locale,
 *   formData,
 *   onDeliveryDateChange: setEntireFormData,
 * });
 * ```
 */
export function useCheckoutDeliveryFlow({
  store,
  isLoadingStore,
  locale,
  formData,
  onDeliveryDateChange,
}: UseCheckoutDeliveryFlowOptions): CheckoutDeliveryFlowResult {
  // Get delivery schedule (intersection of store schedule + driver availability)
  const {
    deliverySchedule,
    isLoading: isLoadingDrivers,
    activeDriverCount,
  } = useDeliveryAvailability({
    store,
    enabled: !!store,
  });

  // Combined loading state for schedule (store + drivers)
  const isLoading = isLoadingStore || isLoadingDrivers;

  // Compute available delivery dates from effective schedule
  const deliveryDateOptions = useMemo((): DeliveryDateOption[] => {
    // Don't compute dates until both store and drivers are loaded
    if (isLoading || !deliverySchedule) {
      return [];
    }

    const availableDates = getAvailableDeliveryDatesMultiSlot(
      deliverySchedule,
      DELIVERY_LOOKAHEAD_DAYS,
      CHECKOUT_LEAD_HOURS
    );

    if (availableDates.length === 0) {
      return [];
    }

    return formatDeliveryDateOptions(availableDates, locale, MAX_DELIVERY_DATE_OPTIONS);
  }, [deliverySchedule, locale, isLoading]);

  // Check if there are no delivery dates available (after loading is complete)
  const hasNoDeliveryDates = !isLoading && !!deliverySchedule && deliveryDateOptions.length === 0;

  // Determine why delivery is unavailable (for user messaging)
  const unavailableReason = useMemo((): string | null => {
    if (isLoading) return null;
    if (!store) return 'Store not found';
    if (activeDriverCount === 0) return 'No drivers available';
    if (hasNoDeliveryDates) return 'No delivery dates available';
    return null;
  }, [isLoading, store, activeDriverCount, hasNoDeliveryDates]);

  // Auto-select the first available delivery date when options become available
  //
  // Why we always prefer the first computed option:
  // - The initial formData.deliveryDate is set by getNextAvailableDeliveryDate() which
  //   doesn't consider the store's effective schedule (store hours ∩ driver availability)
  // - deliveryDateOptions is computed from the effective schedule with proper lead time filtering
  // - So we must override the initial date with the first truly available option
  useEffect(() => {
    if (deliveryDateOptions.length > 0 && !isLoading) {
      const firstDate = deliveryDateOptions[0];
      const firstSlot = firstDate.slots?.[0];
      const timeWindow = firstSlot ? { open: firstSlot.open, close: firstSlot.close } : undefined;

      // Only update if the current date differs from the first available
      // or if the time window isn't set yet
      if (formData.deliveryDate !== firstDate.value || !formData.deliveryTimeWindow) {
        onDeliveryDateChange({
          deliveryDate: firstDate.value,
          deliveryTimeWindow: timeWindow,
        });
      }
    }
  }, [deliveryDateOptions, isLoading, formData.deliveryDate, formData.deliveryTimeWindow, onDeliveryDateChange]);

  // Can proceed if we have a valid delivery date selected
  const canProceed = !isLoading && !hasNoDeliveryDates && !!formData.deliveryDate;

  return {
    // New names
    deliveryDateOptions,
    isLoading,
    hasNoDeliveryDates,
    canProceed,
    unavailableReason,

    // Backward compatibility (deprecated)
    availableDeliveryDates: deliveryDateOptions,
    isLoadingSchedule: isLoading,
  };
}

// Backward compatibility wrapper for old interface
interface UseCheckoutDeliveryScheduleProps {
  storeData: StoreData | null;
  isLoadingStore: boolean;
  locale: string;
  formData: DeliveryFormData;
  setEntireFormData: (data: Partial<DeliveryFormData>) => void;
}

/**
 * @deprecated Use useCheckoutDeliveryFlow instead
 */
export function useCheckoutDeliverySchedule({
  storeData,
  isLoadingStore,
  locale,
  formData,
  setEntireFormData,
}: UseCheckoutDeliveryScheduleProps) {
  const result = useCheckoutDeliveryFlow({
    store: storeData,
    isLoadingStore,
    locale,
    formData,
    onDeliveryDateChange: setEntireFormData,
  });

  return {
    availableDeliveryDates: result.deliveryDateOptions,
    isLoadingSchedule: result.isLoading,
    hasNoDeliveryDates: result.hasNoDeliveryDates,
  };
}
