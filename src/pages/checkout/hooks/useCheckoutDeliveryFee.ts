/**
 * useCheckoutDeliveryFee - Manages delivery fee calculation in checkout
 *
 * Handles fee calculation based on distance between store and customer,
 * tracks address changes to reset fee when address is modified,
 * and syncs the calculated fee with the cart context.
 */

import { useCallback, useEffect, useRef } from 'react';
import { useDeliveryFeeCalculation } from '../../../hooks/useDeliveryFeeCalculation';

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
  /** Calculate delivery fee based on current address - returns true if successful */
  calculateDeliveryFeeForAddress: () => Promise<boolean>;
  /** Reset delivery fee calculation state */
  resetDeliveryFee: () => void;
}

export function useCheckoutDeliveryFee({
  deliveryAddress,
  storeCoordinates,
  setCartDeliveryFee,
}: UseCheckoutDeliveryFeeProps): UseCheckoutDeliveryFeeReturn {
  // Core delivery fee calculation hook
  const {
    fee: deliveryFee,
    distance: deliveryDistance,
    isCalculating: isCalculatingDeliveryFee,
    error: deliveryFeeError,
    calculate: calculateFee,
    reset: resetDeliveryFee,
  } = useDeliveryFeeCalculation();

  // Track last calculated address to detect changes
  const lastCalculatedAddressRef = useRef<string | null>(null);

  /**
   * Calculate delivery fee based on current form address.
   * Called when user completes the address step.
   * Returns true if calculation succeeded, false if it failed.
   */
  const calculateDeliveryFeeForAddress = useCallback(async (): Promise<boolean> => {
    // Validate we have the necessary data
    if (!deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.postalCode) {
      return false;
    }

    // If store coordinates missing, still call calculateFee to get proper error message
    if (!storeCoordinates) {
      const result = await calculateFee(
        {
          street: deliveryAddress.street,
          city: deliveryAddress.city,
          province: deliveryAddress.province,
          postalCode: deliveryAddress.postalCode,
          country: deliveryAddress.country || 'Canada',
        },
        { lat: 0, lng: 0 } // Will trigger "Store location is not available" error
      );
      return false;
    }

    // Calculate the delivery fee with valid store coordinates
    const result = await calculateFee(
      {
        street: deliveryAddress.street,
        city: deliveryAddress.city,
        province: deliveryAddress.province,
        postalCode: deliveryAddress.postalCode,
        country: deliveryAddress.country || 'Canada',
      },
      storeCoordinates
    );

    // If calculation succeeded, update the cart with the new fee
    if (result.fee !== null) {
      setCartDeliveryFee(result.fee);
      return true;
    }

    return false;
  }, [deliveryAddress, storeCoordinates, calculateFee, setCartDeliveryFee]);

  // Store the address hash when fee is calculated successfully
  useEffect(() => {
    if (deliveryFee !== null && deliveryDistance !== null) {
      const addressHash = `${deliveryAddress.street}|${deliveryAddress.city}|${deliveryAddress.postalCode}`;
      lastCalculatedAddressRef.current = addressHash;
    }
  }, [deliveryFee, deliveryDistance, deliveryAddress]);

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
  };
}
