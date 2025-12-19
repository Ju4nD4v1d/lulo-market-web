/**
 * useCheckoutDeliveryFee - Manages delivery fee calculation in checkout
 *
 * Handles fee calculation based on distance between store and customer,
 * tracks address changes to reset fee when address is modified,
 * syncs the calculated fee with the cart context,
 * and applies new customer discount (20% off first 3 orders).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useDeliveryFeeCalculation } from '../../../hooks/useDeliveryFeeCalculation';
import { useDeliveryFeeDiscount, calculateDeliveryDiscount } from '../../../hooks/useDeliveryFeeDiscount';
import { DeliveryFeeDiscountData } from '../../../context/CartContext';
import { checkDeliveryDistance } from '../../../services/delivery/deliveryFeeCalculator';
import { MAX_DELIVERY_DISTANCE_KM } from '../../../services/delivery/constants';

interface DeliveryAddress {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

interface StoreCoordinates {
  lat: number;
  lng: number;
}

interface UseCheckoutDeliveryFeeProps {
  /** Current delivery address from form */
  deliveryAddress: DeliveryAddress;
  /** Store coordinates (lat/lng) */
  storeCoordinates: StoreCoordinates | null;
  /** Function to update cart delivery fee */
  setCartDeliveryFee: (fee: number) => void;
  /** Function to update cart delivery fee discount */
  setCartDeliveryFeeDiscount: (discount: DeliveryFeeDiscountData | null) => void;
  /** User's total paid order count (for discount eligibility) */
  userTotalOrders: number;
  /** Whether user is logged in */
  isLoggedIn: boolean;
}

interface UseCheckoutDeliveryFeeReturn {
  /** Calculated delivery fee (null if not yet calculated) */
  deliveryFee: number | null;
  /** Distance in km between store and customer (null if not calculated) */
  deliveryDistance: number | null;
  /** Error message if delivery fee calculation failed */
  deliveryFeeError: string | null;
  /** Whether delivery fee is currently being calculated */
  isCalculatingDeliveryFee: boolean;
  /** Calculate delivery fee based on address - pass addressOverride to use specific address instead of form state */
  calculateDeliveryFeeForAddress: (addressOverride?: DeliveryAddress) => Promise<boolean>;
  /** Reset delivery fee calculation state */
  resetDeliveryFee: () => void;
  /** Whether delivery is not supported due to distance exceeding max limit */
  isDistanceTooFar: boolean;
  /** Maximum delivery distance in km */
  maxDeliveryDistance: number;
}

export function useCheckoutDeliveryFee({
  deliveryAddress,
  storeCoordinates,
  setCartDeliveryFee,
  setCartDeliveryFeeDiscount,
  userTotalOrders,
  isLoggedIn,
}: UseCheckoutDeliveryFeeProps): UseCheckoutDeliveryFeeReturn {
  // Core delivery fee calculation hook
  const {
    fee: deliveryFee,
    distance: deliveryDistance,
    isCalculating: isCalculatingDeliveryFee,
    error: baseError,
    calculate: calculateFee,
    reset: resetDeliveryFeeBase,
    maxDeliveryDistance: configMaxDistance,
    discountPercentage: configDiscountPercentage,
    discountEligibleOrders: configDiscountEligibleOrders,
  } = useDeliveryFeeCalculation();

  // State for distance-too-far error
  const [isDistanceTooFar, setIsDistanceTooFar] = useState(false);
  const [distanceError, setDistanceError] = useState<string | null>(null);

  // Combine base error with distance error
  const deliveryFeeError = distanceError || baseError;

  // Build discount config from Firestore values (if available)
  const discountConfig = configDiscountPercentage !== null && configDiscountEligibleOrders !== null
    ? { discountPercentage: configDiscountPercentage, discountEligibleOrders: configDiscountEligibleOrders }
    : undefined;

  // Calculate discount for new customers using dynamic config from Firestore
  const discount = useDeliveryFeeDiscount(deliveryFee, userTotalOrders, isLoggedIn, discountConfig);

  // Reset both fee and discount
  const resetDeliveryFee = useCallback(() => {
    resetDeliveryFeeBase();
    setCartDeliveryFeeDiscount(null);
    setIsDistanceTooFar(false);
    setDistanceError(null);
  }, [resetDeliveryFeeBase, setCartDeliveryFeeDiscount]);

  // Track last calculated address to detect changes
  const lastCalculatedAddressRef = useRef<string | null>(null);

  /**
   * Calculate delivery fee based on address.
   * Called when user completes the address step.
   * @param addressOverride - Optional address to use instead of form state (useful when state hasn't updated yet)
   * Returns true if calculation succeeded, false if it failed.
   */
  const calculateDeliveryFeeForAddress = useCallback(async (addressOverride?: DeliveryAddress): Promise<boolean> => {
    // Reset distance error state
    setIsDistanceTooFar(false);
    setDistanceError(null);

    // Use override address if provided, otherwise use form state
    const address = addressOverride || deliveryAddress;

    // Validate we have the necessary data
    if (!address.street || !address.city || !address.postalCode) {
      return false;
    }

    // If store coordinates missing, still call calculateFee to get proper error message
    if (!storeCoordinates) {
      await calculateFee(
        {
          street: address.street,
          city: address.city,
          province: address.province,
          postalCode: address.postalCode,
          country: address.country || 'Canada',
        },
        { lat: 0, lng: 0 } // Will trigger "Store location is not available" error
      );
      return false;
    }

    // Calculate the delivery fee with valid store coordinates
    const result = await calculateFee(
      {
        street: address.street,
        city: address.city,
        province: address.province,
        postalCode: address.postalCode,
        country: address.country || 'Canada',
      },
      storeCoordinates
    );

    // If calculation succeeded, check if distance is within the allowed limit
    if (result.fee !== null && result.distance !== null) {
      // Check if delivery is supported based on distance
      // Use dynamic maxDeliveryDistance from Firestore config, fallback to hardcoded constant
      const maxDistanceToUse = result.maxDeliveryDistance ?? MAX_DELIVERY_DISTANCE_KM;
      const distanceCheck = checkDeliveryDistance(result.distance, maxDistanceToUse);

      if (!distanceCheck.isSupported) {
        // Distance exceeds maximum - block checkout
        setIsDistanceTooFar(true);
        setDistanceError(distanceCheck.reason);
        return false;
      }

      // Distance is OK - update the cart with the new fee and discount
      setCartDeliveryFee(result.fee);

      // Calculate and set discount for new customers using shared pure function
      // Note: We use the pure function here since the hook value won't update until re-render
      // Pass the discount config from Firestore result if available
      const resultDiscountConfig = result.discountPercentage !== null && result.discountEligibleOrders !== null
        ? { discountPercentage: result.discountPercentage, discountEligibleOrders: result.discountEligibleOrders }
        : undefined;
      const discountResult = calculateDeliveryDiscount(result.fee, userTotalOrders, isLoggedIn, resultDiscountConfig);
      // Include discountPercentage from config for UI display
      const discountPercentageValue = resultDiscountConfig?.discountPercentage ?? 0.20;
      setCartDeliveryFeeDiscount({
        ...discountResult,
        discountPercentage: discountPercentageValue,
      });

      // Store the address hash for change detection
      // This is done here (not in useEffect) to avoid race conditions between
      // the address hash update and the address change detection effect
      const addressHash = `${address.street}|${address.city}|${address.postalCode}`;
      lastCalculatedAddressRef.current = addressHash;

      return true;
    }

    return false;
  }, [deliveryAddress, storeCoordinates, calculateFee, setCartDeliveryFee, setCartDeliveryFeeDiscount, isLoggedIn, userTotalOrders]);

  // Reset delivery fee when address changes after calculation
  useEffect(() => {
    // Only check if fee was previously calculated
    if (deliveryFee !== null && lastCalculatedAddressRef.current) {
      const currentAddressHash = `${deliveryAddress.street}|${deliveryAddress.city}|${deliveryAddress.postalCode}`;

      // If address changed, reset the fee
      if (currentAddressHash !== lastCalculatedAddressRef.current) {
        console.log('Address changed after fee calculation - resetting fee');
        resetDeliveryFee();
        setCartDeliveryFee(0);
        lastCalculatedAddressRef.current = null;
      }
    }
  }, [
    deliveryAddress.street,
    deliveryAddress.city,
    deliveryAddress.postalCode,
    deliveryFee,
    resetDeliveryFee,
    setCartDeliveryFee,
  ]);

  return {
    deliveryFee,
    deliveryDistance,
    deliveryFeeError,
    isCalculatingDeliveryFee,
    calculateDeliveryFeeForAddress,
    resetDeliveryFee,
    isDistanceTooFar,
    maxDeliveryDistance: configMaxDistance ?? MAX_DELIVERY_DISTANCE_KM,
  };
}
