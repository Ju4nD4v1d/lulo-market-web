/**
 * Delivery Fee Default Configuration
 * These values can be overridden in the simulator
 */

import type { DistanceTier, DeliveryFeeConfig } from './types';

export const DEFAULT_TIERS: DistanceTier[] = [
  { fromKm: 0, toKm: 3, ratePerKm: 0.00 },
  { fromKm: 3, toKm: 10, ratePerKm: 0.50 },
  { fromKm: 10, toKm: 20, ratePerKm: 0.75 },
  { fromKm: 20, toKm: 9999, ratePerKm: 1.00 },
];

export const DEFAULT_CONFIG: DeliveryFeeConfig = {
  enabled: false,
  baseFee: 2.00,
  minFee: 2.00,
  maxFee: 25.00,
  tiers: DEFAULT_TIERS,
};

export const STORAGE_KEY = 'lulocart_delivery_fee_config';

// Threshold for "unlimited" distance tier
export const UNLIMITED_DISTANCE = 9999;
