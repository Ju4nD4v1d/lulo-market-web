/**
 * Delivery Fee Discount Types
 * Single source of truth for discount-related interfaces
 */

export interface DeliveryFeeDiscount {
  /** Original delivery fee before discount */
  originalFee: number;
  /** Discounted delivery fee (what customer pays) */
  discountedFee: number;
  /** Amount saved from the discount */
  discountAmount: number;
  /** Whether user is eligible for the discount */
  isEligible: boolean;
  /** Number of discounted orders remaining */
  ordersRemaining: number;
  /** Discount percentage as decimal (0.20 = 20%) */
  discountPercentage: number;
}
