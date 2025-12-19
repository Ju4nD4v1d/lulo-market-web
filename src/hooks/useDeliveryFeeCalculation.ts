/**
 * useDeliveryFeeCalculation Hook
 *
 * Central hook for calculating dynamic delivery fees based on distance.
 * Orchestrates geocoding, distance calculation, and fee calculation.
 */

import { useState, useCallback } from 'react';
import { geocodeAddress, type AddressComponents } from '../utils/geocoding';
import {
  calculateDeliveryFee,
  haversineDistance,
} from '../services/delivery/deliveryFeeCalculator';
import { getDeliveryFeeConfig } from '../services/api/deliveryFeeConfigApi';
import type { Coordinates, FeeCalculationResult } from '../services/delivery/types';

// ============================================================================
// Types
// ============================================================================

export interface DeliveryAddressForCalculation {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country?: string;
}

export interface DeliveryFeeCalculationResult {
  /** Calculated delivery fee (null if not yet calculated or error) */
  fee: number | null;
  /** Distance in kilometers between store and customer */
  distance: number | null;
  /** Whether calculation is in progress */
  isCalculating: boolean;
  /** Error message if calculation failed */
  error: string | null;
  /** Customer address coordinates (after successful geocoding) */
  customerCoordinates: Coordinates | null;
  /** Full calculation breakdown (for debugging/logging) */
  feeBreakdown: FeeCalculationResult | null;
  /** Maximum delivery distance from config (null if not yet fetched) */
  maxDeliveryDistance: number | null;
  /** Discount percentage for new customers (null if not yet fetched) */
  discountPercentage: number | null;
  /** Number of orders eligible for new customer discount (null if not yet fetched) */
  discountEligibleOrders: number | null;
}

export interface UseDeliveryFeeCalculationReturn extends DeliveryFeeCalculationResult {
  /**
   * Calculate delivery fee for given address and store coordinates.
   * Call this when user completes the address step.
   */
  calculate: (
    customerAddress: DeliveryAddressForCalculation,
    storeCoordinates: Coordinates
  ) => Promise<DeliveryFeeCalculationResult>;
  /** Reset calculation state */
  reset: () => void;
}

// ============================================================================
// Hook
// ============================================================================

export function useDeliveryFeeCalculation(): UseDeliveryFeeCalculationReturn {
  const [fee, setFee] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customerCoordinates, setCustomerCoordinates] = useState<Coordinates | null>(null);
  const [feeBreakdown, setFeeBreakdown] = useState<FeeCalculationResult | null>(null);
  const [maxDeliveryDistance, setMaxDeliveryDistance] = useState<number | null>(null);
  const [discountPercentage, setDiscountPercentage] = useState<number | null>(null);
  const [discountEligibleOrders, setDiscountEligibleOrders] = useState<number | null>(null);

  const reset = useCallback(() => {
    setFee(null);
    setDistance(null);
    setIsCalculating(false);
    setError(null);
    setCustomerCoordinates(null);
    setFeeBreakdown(null);
    setMaxDeliveryDistance(null);
    setDiscountPercentage(null);
    setDiscountEligibleOrders(null);
  }, []);

  const calculate = useCallback(
    async (
      customerAddress: DeliveryAddressForCalculation,
      storeCoordinates: Coordinates
    ): Promise<DeliveryFeeCalculationResult> => {
      // Reset previous state
      setError(null);
      setIsCalculating(true);

      try {
        // Step 1: Validate store coordinates
        if (!storeCoordinates || !storeCoordinates.lat || !storeCoordinates.lng) {
          const errorMsg = 'Store location is not available';
          setError(errorMsg);
          setIsCalculating(false);
          return {
            fee: null,
            distance: null,
            isCalculating: false,
            error: errorMsg,
            customerCoordinates: null,
            feeBreakdown: null,
            maxDeliveryDistance: null,
            discountPercentage: null,
            discountEligibleOrders: null,
          };
        }

        // Step 2: Geocode customer address
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
          setIsCalculating(false);
          return {
            fee: null,
            distance: null,
            isCalculating: false,
            error: errorMsg,
            customerCoordinates: null,
            feeBreakdown: null,
            maxDeliveryDistance: null,
            discountPercentage: null,
            discountEligibleOrders: null,
          };
        }

        const custCoords = geocodeResult.coordinates;
        setCustomerCoordinates(custCoords);

        // Step 3: Calculate distance
        const calculatedDistance = haversineDistance(storeCoordinates, custCoords);
        setDistance(calculatedDistance);

        // Step 4: Fetch fee configuration from Firestore
        const config = await getDeliveryFeeConfig();
        setMaxDeliveryDistance(config.maxDeliveryDistance);
        setDiscountPercentage(config.discountPercentage);
        setDiscountEligibleOrders(config.discountEligibleOrders);

        // Step 5: Calculate fee
        const result = calculateDeliveryFee(calculatedDistance, config);
        setFee(result.totalFee);
        setFeeBreakdown(result);
        setIsCalculating(false);

        return {
          fee: result.totalFee,
          distance: calculatedDistance,
          isCalculating: false,
          error: null,
          customerCoordinates: custCoords,
          feeBreakdown: result,
          maxDeliveryDistance: config.maxDeliveryDistance,
          discountPercentage: config.discountPercentage,
          discountEligibleOrders: config.discountEligibleOrders,
        };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to calculate delivery fee';
        console.error('Delivery fee calculation error:', err);
        setError(errorMsg);
        setIsCalculating(false);
        return {
          fee: null,
          distance: null,
          isCalculating: false,
          error: errorMsg,
          customerCoordinates: null,
          feeBreakdown: null,
          maxDeliveryDistance: null,
          discountPercentage: null,
          discountEligibleOrders: null,
        };
      }
    },
    []
  );

  return {
    fee,
    distance,
    isCalculating,
    error,
    customerCoordinates,
    feeBreakdown,
    maxDeliveryDistance,
    discountPercentage,
    discountEligibleOrders,
    calculate,
    reset,
  };
}
