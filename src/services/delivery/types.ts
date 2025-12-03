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
