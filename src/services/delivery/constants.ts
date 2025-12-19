/**
 * Delivery Fee Default Configuration
 * These values are stored in Firestore (deliveryFeeConfig/current)
 * and can be edited by admin users in the Dispatcher page
 */

import type { DistanceTier, DeliveryFeeConfig } from './types';

export const DEFAULT_TIERS: DistanceTier[] = [
  { fromKm: 0, toKm: 15, ratePerKm: 0.00 },
  { fromKm: 15, toKm: 25, ratePerKm: 0.10 },
  { fromKm: 25, toKm: 30, ratePerKm: 0.20 },
  { fromKm: 30, toKm: 35, ratePerKm: 0.30 },
  { fromKm: 35, toKm: 40, ratePerKm: 0.40 },
  { fromKm: 40, toKm: 45, ratePerKm: 0.50 },
  { fromKm: 45, toKm: 50, ratePerKm: 0.60 },
  { fromKm: 50, toKm: 55, ratePerKm: 0.70 },
  { fromKm: 55, toKm: 70, ratePerKm: 1.00 },
];

export const DEFAULT_CONFIG: DeliveryFeeConfig = {
  enabled: true, // Always enabled - dynamic fees based on distance
  baseFee: 2.00,
  minFee: 2.00,
  maxFee: 20.00,
  tiers: DEFAULT_TIERS,
  maxDeliveryDistance: 60, // Maximum delivery distance in km
  discountPercentage: 0.20, // 20% discount for new customers
  discountEligibleOrders: 3, // First 3 orders get the discount
};

// Firestore collection and document for delivery fee config
export const DELIVERY_FEE_CONFIG_COLLECTION = 'deliveryFeeConfig';
export const DELIVERY_FEE_CONFIG_DOC = 'current';

// Legacy localStorage key (no longer used, kept for migration)
export const STORAGE_KEY = 'lulocart_delivery_fee_config';

// Threshold for "unlimited" distance tier
export const UNLIMITED_DISTANCE = 9999;

/**
 * Default maximum delivery distance in kilometers.
 * Used as fallback when Firestore config doesn't have maxDeliveryDistance.
 * The actual value is now configurable via Admin dashboard (deliveryFeeConfig).
 */
export const MAX_DELIVERY_DISTANCE_KM = 60;
