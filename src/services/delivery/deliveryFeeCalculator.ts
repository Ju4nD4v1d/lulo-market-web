/**
 * Delivery Fee Calculator
 * Core calculation logic for dynamic delivery fees based on distance tiers
 */

import type { DeliveryFeeConfig, FeeCalculationResult, TierBreakdown, DeliveryDistanceCheckResult } from './types';
import { UNLIMITED_DISTANCE, MAX_DELIVERY_DISTANCE_KM } from './constants';

/**
 * Calculate delivery fee based on distance and configuration
 * @param distance - Distance in kilometers
 * @param config - Fee configuration with tiers
 * @returns Detailed breakdown of the calculated fee
 */
export function calculateDeliveryFee(
  distance: number,
  config: DeliveryFeeConfig
): FeeCalculationResult {
  const { baseFee, minFee, maxFee, tiers } = config;

  // Sort tiers by fromKm to ensure correct order
  const sortedTiers = [...tiers].sort((a, b) => a.fromKm - b.fromKm);

  let distanceFee = 0;
  const tierBreakdown: TierBreakdown[] = [];

  for (const tier of sortedTiers) {
    // Skip tiers that don't apply to this distance
    if (distance <= tier.fromKm) continue;

    // Calculate the effective end of this tier
    const tierEnd = tier.toKm >= UNLIMITED_DISTANCE ? distance : Math.min(tier.toKm, distance);
    const kmInTier = Math.max(0, tierEnd - tier.fromKm);

    if (kmInTier > 0) {
      const fee = kmInTier * tier.ratePerKm;
      distanceFee += fee;
      tierBreakdown.push({ tier, kmInTier, fee });
    }
  }

  let totalFee = baseFee + distanceFee;
  let cappedAt: 'min' | 'max' | null = null;

  // Apply min/max caps
  if (totalFee < minFee) {
    totalFee = minFee;
    cappedAt = 'min';
  } else if (totalFee > maxFee) {
    totalFee = maxFee;
    cappedAt = 'max';
  }

  return {
    totalFee,
    baseFee,
    distanceFee,
    distance,
    tierBreakdown,
    cappedAt,
  };
}

/**
 * Calculate Haversine distance between two coordinates
 * @param coord1 - First coordinate (lat, lng)
 * @param coord2 - Second coordinate (lat, lng)
 * @returns Distance in kilometers
 */
export function haversineDistance(
  coord1: { lat: number; lng: number },
  coord2: { lat: number; lng: number }
): number {
  const R = 6371; // Earth's radius in kilometers

  const dLat = toRadians(coord2.lat - coord1.lat);
  const dLng = toRadians(coord2.lng - coord1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.lat)) *
      Math.cos(toRadians(coord2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Check if delivery is supported based on distance.
 * Returns whether delivery is available and the reason if not.
 *
 * @param distance - Distance in kilometers
 * @param maxDistance - Maximum allowed distance (defaults to MAX_DELIVERY_DISTANCE_KM)
 * @returns DeliveryDistanceCheckResult with support status and reason
 *
 * TODO: Update to fetch maxDistance from Admin dashboard (deliveryFeeConfig)
 * instead of using the hardcoded constant.
 */
export function checkDeliveryDistance(
  distance: number,
  maxDistance: number = MAX_DELIVERY_DISTANCE_KM
): DeliveryDistanceCheckResult {
  const isSupported = distance <= maxDistance;

  return {
    isSupported,
    distance,
    maxDistance,
    reason: isSupported
      ? null
      : `Delivery is not available for distances over ${maxDistance} km. Your location is ${distance.toFixed(1)} km away.`,
  };
}
