/**
 * useCheckoutDeliverySchedule - Manages delivery date/time slot availability
 *
 * Computes available delivery dates from store schedule and driver availability.
 * Auto-sets the delivery date in form when dates become available.
 */

import { useMemo, useEffect } from 'react';
import { useEffectiveHours } from '../../../hooks/useEffectiveHours';
import { getAvailableDeliveryDatesMultiSlot } from '../../../utils/effectiveHours';
import { formatDeliveryDateOptions, DeliveryDateOption } from '../utils/dateHelpers';
import { StoreData } from '../../../types';

interface DeliveryFormData {
  deliveryDate: string;
  deliveryTimeWindow?: {
    open: string;
    close: string;
  };
}

interface UseCheckoutDeliveryScheduleProps {
  /** Store data (passed from parent to avoid duplicate queries) */
  storeData: StoreData | null;
  /** Whether store data is still loading */
  isLoadingStore: boolean;
  locale: string;
  formData: DeliveryFormData;
  setEntireFormData: (data: Partial<DeliveryFormData>) => void;
}

interface UseCheckoutDeliveryScheduleReturn {
  /** Available delivery date options with time slots */
  availableDeliveryDates: DeliveryDateOption[];
  /** Whether schedule data is still loading */
  isLoadingSchedule: boolean;
  /** Whether no delivery dates are available (after loading completes) */
  hasNoDeliveryDates: boolean;
}

export function useCheckoutDeliverySchedule({
  storeData,
  isLoadingStore,
  locale,
  formData,
  setEntireFormData,
}: UseCheckoutDeliveryScheduleProps): UseCheckoutDeliveryScheduleReturn {
  // Get effective hours (intersection of store schedule + driver availability)
  const { effectiveHours, isLoading: isLoadingDrivers } = useEffectiveHours({
    store: storeData,
    enabled: !!storeData,
  });

  // Combined loading state for schedule (store + drivers)
  const isLoadingSchedule = isLoadingStore || isLoadingDrivers;

  // Compute available delivery dates from effective schedule
  const availableDeliveryDates = useMemo((): DeliveryDateOption[] => {
    // Don't compute dates until both store and drivers are loaded
    if (isLoadingSchedule || !effectiveHours) {
      return [];
    }

    const availableDates = getAvailableDeliveryDatesMultiSlot(effectiveHours, 14, 24);

    if (availableDates.length === 0) {
      return [];
    }

    return formatDeliveryDateOptions(availableDates, locale, 5);
  }, [effectiveHours, locale, isLoadingSchedule]);

  // Check if there are no delivery dates available (after loading is complete)
  const hasNoDeliveryDates = !isLoadingSchedule && !!effectiveHours && availableDeliveryDates.length === 0;

  // Update delivery date and time window in form when available dates are computed
  useEffect(() => {
    if (availableDeliveryDates.length > 0 && !isLoadingSchedule) {
      const currentDeliveryDate = formData.deliveryDate;
      const matchingDate = availableDeliveryDates.find(d => d.value === currentDeliveryDate);

      if (!matchingDate) {
        // Current date is not valid, update to first available with its time window
        const firstDate = availableDeliveryDates[0];
        const firstSlot = firstDate.slots?.[0];
        const timeWindow = firstSlot ? { open: firstSlot.open, close: firstSlot.close } : undefined;
        setEntireFormData({
          deliveryDate: firstDate.value,
          deliveryTimeWindow: timeWindow,
        });
      } else {
        // Current date is valid, ensure time window is set
        const firstSlot = matchingDate.slots?.[0];
        if (firstSlot && !formData.deliveryTimeWindow) {
          setEntireFormData({
            deliveryTimeWindow: { open: firstSlot.open, close: firstSlot.close },
          });
        }
      }
    }
  }, [availableDeliveryDates, isLoadingSchedule, formData.deliveryDate, formData.deliveryTimeWindow, setEntireFormData]);

  return {
    availableDeliveryDates,
    isLoadingSchedule,
    hasNoDeliveryDates,
  };
}
