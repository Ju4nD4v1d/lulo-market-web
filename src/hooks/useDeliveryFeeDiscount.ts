/**
 * Hook to calculate delivery fee discount for new customers
 * Provides 20% off delivery fees for the first 3 successful orders
 */

import { useMemo } from 'react';

/** Discount percentage as decimal (20% = 0.20) */
export const DISCOUNT_PERCENTAGE = 0.20;

/** Maximum number of orders that receive the discount */
export const MAX_DISCOUNTED_ORDERS = 3;

export interface DeliveryFeeDiscountResult {
  /** Original delivery fee before discount */
  originalFee: number;
  /** Discounted delivery fee (or original if not eligible) */
  discountedFee: number;
  /** Amount saved from the discount */
  discountAmount: number;
  /** Whether user is eligible for the discount */
  isEligible: boolean;
  /** Number of discounted orders remaining (0-3) */
  ordersRemaining: number;
  /** Discount percentage (0.20 = 20%) */
  discountPercentage: number;
}

/**
 * Pure function to calculate delivery fee discount
 * Can be used outside of React hooks when state hasn't updated yet
 */
export const calculateDeliveryDiscount = (
  deliveryFee: number,
  totalOrders: number,
  isLoggedIn: boolean
): Omit<DeliveryFeeDiscountResult, 'discountPercentage'> => {
  const originalFee = deliveryFee;
  const isEligible = isLoggedIn && totalOrders < MAX_DISCOUNTED_ORDERS && originalFee > 0;
  const ordersRemaining = Math.max(0, MAX_DISCOUNTED_ORDERS - totalOrders);
  const discountAmount = isEligible
    ? Number((originalFee * DISCOUNT_PERCENTAGE).toFixed(2))
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
 * @returns Discount calculation result with eligibility and amounts
 *
 * @example
 * const discount = useDeliveryFeeDiscount(10.00, 1, true);
 * // discount.isEligible = true (1 < 3 orders)
 * // discount.discountedFee = 8.00 (10 - 2.00)
 * // discount.ordersRemaining = 2
 */
export const useDeliveryFeeDiscount = (
  deliveryFee: number | null,
  totalOrders: number,
  isLoggedIn: boolean
): DeliveryFeeDiscountResult => {
  return useMemo(() => {
    const result = calculateDeliveryDiscount(deliveryFee ?? 0, totalOrders, isLoggedIn);
    return {
      ...result,
      discountPercentage: DISCOUNT_PERCENTAGE,
    };
  }, [deliveryFee, totalOrders, isLoggedIn]);
};
