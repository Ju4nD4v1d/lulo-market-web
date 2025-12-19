/**
 * useDeliveryDistanceCheck Hook
 *
 * Hook to check if delivery is supported based on the distance
 * between a store and customer location.
 *
 * TODO: Update to fetch maxDistance from Admin dashboard (deliveryFeeConfig)
 * instead of using the hardcoded MAX_DELIVERY_DISTANCE_KM constant.
 */

import { useState, useCallback } from 'react';
import { geocodeAddress, type AddressComponents } from '../utils/geocoding';
import {
  haversineDistance,
  checkDeliveryDistance,
} from '../services/delivery/deliveryFeeCalculator';
import { MAX_DELIVERY_DISTANCE_KM } from '../services/delivery/constants';
import type { Coordinates, DeliveryDistanceCheckResult } from '../services/delivery/types';

// ============================================================================
// Types
// ============================================================================

export interface DeliveryAddressForCheck {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country?: string;
}

export interface UseDeliveryDistanceCheckResult {
  /** Result of the distance check (null if not yet checked) */
  result: DeliveryDistanceCheckResult | null;
  /** Whether the check is in progress */
  isChecking: boolean;
  /** Error message if the check failed (geocoding error, etc.) */
  error: string | null;
  /** Customer coordinates after successful geocoding */
  customerCoordinates: Coordinates | null;
}

export interface UseDeliveryDistanceCheckReturn extends UseDeliveryDistanceCheckResult {
  /**
   * Check if delivery is supported for the given address and store.
   * @param customerAddress - Customer's delivery address
   * @param storeCoordinates - Store's coordinates
   * @param maxDistance - Optional custom max distance (defaults to MAX_DELIVERY_DISTANCE_KM)
   */
  checkDistance: (
    customerAddress: DeliveryAddressForCheck,
    storeCoordinates: Coordinates,
    maxDistance?: number
  ) => Promise<UseDeliveryDistanceCheckResult>;
  /** Reset the check state */
  reset: () => void;
  /** Current max delivery distance in km */
  maxDeliveryDistance: number;
}

// ============================================================================
// Hook
// ============================================================================

export function useDeliveryDistanceCheck(): UseDeliveryDistanceCheckReturn {
  const [result, setResult] = useState<DeliveryDistanceCheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customerCoordinates, setCustomerCoordinates] = useState<Coordinates | null>(null);

  const reset = useCallback(() => {
    setResult(null);
    setIsChecking(false);
    setError(null);
    setCustomerCoordinates(null);
  }, []);

  const checkDistance = useCallback(
    async (
      customerAddress: DeliveryAddressForCheck,
      storeCoordinates: Coordinates,
      maxDistance: number = MAX_DELIVERY_DISTANCE_KM
    ): Promise<UseDeliveryDistanceCheckResult> => {
      setError(null);
      setIsChecking(true);
      setResult(null);

      try {
        // Validate store coordinates
        if (!storeCoordinates || !storeCoordinates.lat || !storeCoordinates.lng) {
          const errorMsg = 'Store location is not available';
          setError(errorMsg);
          setIsChecking(false);
          return {
            result: null,
            isChecking: false,
            error: errorMsg,
            customerCoordinates: null,
          };
        }

        // Geocode customer address
        const addressComponents: AddressComponents = {
          street: customerAddress.street,
          city: customerAddress.city,
          province: customerAddress.province,
          postalCode: customerAddress.postalCode,
          country: customerAddress.country || 'Canada',
        };

        const geocodeResult = await geocodeAddress(addressComponents);

        if (!geocodeResult.success || !geocodeResult.coordinates) {
          const errorMsg = geocodeResult.error || 'Unable to validate address';
          setError(errorMsg);
          setIsChecking(false);
          return {
            result: null,
            isChecking: false,
            error: errorMsg,
            customerCoordinates: null,
          };
        }

        const custCoords = geocodeResult.coordinates;
        setCustomerCoordinates(custCoords);

        // Calculate distance using Haversine formula
        const distance = haversineDistance(storeCoordinates, custCoords);

        // Check if delivery is supported
        const checkResult = checkDeliveryDistance(distance, maxDistance);
        setResult(checkResult);
        setIsChecking(false);

        return {
          result: checkResult,
          isChecking: false,
          error: null,
          customerCoordinates: custCoords,
        };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to check delivery distance';
        console.error('Delivery distance check error:', err);
        setError(errorMsg);
        setIsChecking(false);
        return {
          result: null,
          isChecking: false,
          error: errorMsg,
          customerCoordinates: null,
        };
      }
    },
    []
  );

  return {
    result,
    isChecking,
    error,
    customerCoordinates,
    checkDistance,
    reset,
    maxDeliveryDistance: MAX_DELIVERY_DISTANCE_KM,
  };
}
