/**
 * Hook to calculate delivery fee discount for new customers
 * Discount percentage and eligible orders are configurable via Admin dashboard
 */

import { useMemo } from 'react';
import { DeliveryFeeDiscount } from '../types/deliveryFeeDiscount';

/** Default discount percentage as decimal (20% = 0.20) - used as fallback */
export const DISCOUNT_PERCENTAGE = 0.20;

/** Default maximum number of orders that receive the discount - used as fallback */
export const MAX_DISCOUNTED_ORDERS = 3;

export interface DiscountConfig {
  /** Discount percentage as decimal (0.20 = 20%) */
  discountPercentage?: number;
  /** Number of orders eligible for discount */
  discountEligibleOrders?: number;
}

/**
 * Pure function to calculate delivery fee discount
 * Can be used outside of React hooks when state hasn't updated yet
 *
 * @param deliveryFee - The delivery fee to calculate discount on
 * @param totalOrders - User's total paid order count
 * @param isLoggedIn - Whether user is logged in
 * @param config - Optional config with discount percentage and eligible orders from Firestore
 */
export const calculateDeliveryDiscount = (
  deliveryFee: number,
  totalOrders: number,
  isLoggedIn: boolean,
  config?: DiscountConfig
): Omit<DeliveryFeeDiscount, 'discountPercentage'> => {
  const discountPct = config?.discountPercentage ?? DISCOUNT_PERCENTAGE;
  const maxOrders = config?.discountEligibleOrders ?? MAX_DISCOUNTED_ORDERS;

  const originalFee = deliveryFee;
  const isEligible = isLoggedIn && totalOrders < maxOrders && originalFee > 0;
  const ordersRemaining = Math.max(0, maxOrders - totalOrders);
  const discountAmount = isEligible
    ? Number((originalFee * discountPct).toFixed(2))
    : 0;
  const discountedFee = isEligible
    ? Number((originalFee - discountAmount).toFixed(2))
    : originalFee;

  return {
    originalFee,
    discountedFee,
    discountAmount,
    isEligible,
    ordersRemaining,
  };
};

/**
 * Calculates delivery fee discount eligibility and amounts
 *
 * @param deliveryFee - The calculated delivery fee (null if not yet calculated)
 * @param totalOrders - User's total paid order count
 * @param isLoggedIn - Whether user is logged in
 * @param config - Optional config with discount percentage and eligible orders from Firestore
 * @returns Discount calculation result with eligibility and amounts
 *
 * @example
 * const discount = useDeliveryFeeDiscount(10.00, 1, true, { discountPercentage: 0.20, discountEligibleOrders: 3 });
 * // discount.isEligible = true (1 < 3 orders)
 * // discount.discountedFee = 8.00 (10 - 2.00)
 * // discount.ordersRemaining = 2
 */
export const useDeliveryFeeDiscount = (
  deliveryFee: number | null,
  totalOrders: number,
  isLoggedIn: boolean,
  config?: DiscountConfig
): DeliveryFeeDiscount => {
  const discountPct = config?.discountPercentage ?? DISCOUNT_PERCENTAGE;

  return useMemo(() => {
    const result = calculateDeliveryDiscount(deliveryFee ?? 0, totalOrders, isLoggedIn, config);
    return {
      ...result,
      discountPercentage: discountPct,
    };
  }, [deliveryFee, totalOrders, isLoggedIn, config, discountPct]);
};
