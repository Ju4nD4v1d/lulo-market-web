/**
 * Delivery Fee Calculation Types
 * Used by the DeliveryFeeSimulator and future checkout integration
 */

export interface DistanceTier {
  fromKm: number;
  toKm: number; // Use 9999 for "unlimited"
  ratePerKm: number;
}

export interface DeliveryFeeConfig {
  enabled: boolean;
  baseFee: number;
  minFee: number;
  maxFee: number;
  tiers: DistanceTier[];
  /** Maximum delivery distance in kilometers. Orders beyond this distance are not supported. */
  maxDeliveryDistance: number;
  /** Discount percentage for new customers (0.20 = 20%). Applied to first N orders. */
  discountPercentage: number;
  /** Number of orders that receive the new customer discount */
  discountEligibleOrders: number;
}

export interface TierBreakdown {
  tier: DistanceTier;
  kmInTier: number;
  fee: number;
}

export interface FeeCalculationResult {
  totalFee: number;
  baseFee: number;
  distanceFee: number;
  distance: number;
  tierBreakdown: TierBreakdown[];
  cappedAt: 'min' | 'max' | null;
}

// Phase 2: Coordinates for map-based simulation
export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Result of checking if delivery is supported based on distance
 */
export interface DeliveryDistanceCheckResult {
  /** Whether delivery is supported for this distance */
  isSupported: boolean;
  /** The calculated distance in kilometers */
  distance: number;
  /** Maximum allowed delivery distance */
  maxDistance: number;
  /** Human-readable reason if delivery is not supported */
  reason: string | null;
}
