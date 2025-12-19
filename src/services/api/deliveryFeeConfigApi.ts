/**
 * Delivery Fee Config API - Admin-only configuration for delivery fee calculations
 *
 * Collection: deliveryFeeConfig
 * Document: 'current' (single document storing active configuration)
 *
 * Access: Admin users only (enforced by Firestore rules)
 */

import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  Unsubscribe,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import {
  DELIVERY_FEE_CONFIG_COLLECTION,
  DELIVERY_FEE_CONFIG_DOC,
  DEFAULT_CONFIG,
} from '../delivery/constants';
import type { DeliveryFeeConfig } from '../delivery/types';

// ============================================================================
// Types
// ============================================================================

export interface DeliveryFeeConfigDocument extends DeliveryFeeConfig {
  updatedAt?: Date;
  updatedBy?: string;
}

// ============================================================================
// Read Operations
// ============================================================================

/**
 * Get the current delivery fee configuration from Firestore
 * Falls back to DEFAULT_CONFIG if document doesn't exist
 */
export async function getDeliveryFeeConfig(): Promise<DeliveryFeeConfig> {
  try {
    const docRef = doc(db, DELIVERY_FEE_CONFIG_COLLECTION, DELIVERY_FEE_CONFIG_DOC);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as DeliveryFeeConfigDocument;
      return {
        enabled: data.enabled ?? DEFAULT_CONFIG.enabled,
        baseFee: data.baseFee ?? DEFAULT_CONFIG.baseFee,
        minFee: data.minFee ?? DEFAULT_CONFIG.minFee,
        maxFee: data.maxFee ?? DEFAULT_CONFIG.maxFee,
        tiers: data.tiers ?? DEFAULT_CONFIG.tiers,
        maxDeliveryDistance: data.maxDeliveryDistance ?? DEFAULT_CONFIG.maxDeliveryDistance,
        discountPercentage: data.discountPercentage ?? DEFAULT_CONFIG.discountPercentage,
        discountEligibleOrders: data.discountEligibleOrders ?? DEFAULT_CONFIG.discountEligibleOrders,
      };
    }

    // Document doesn't exist, return defaults
    return DEFAULT_CONFIG;
  } catch (error) {
    console.error('Error fetching delivery fee config:', error);
    // Return defaults on error
    return DEFAULT_CONFIG;
  }
}

/**
 * Subscribe to real-time updates of the delivery fee configuration
 */
export function subscribeToDeliveryFeeConfig(
  callback: (config: DeliveryFeeConfig) => void
): Unsubscribe {
  const docRef = doc(db, DELIVERY_FEE_CONFIG_COLLECTION, DELIVERY_FEE_CONFIG_DOC);

  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as DeliveryFeeConfigDocument;
        callback({
          enabled: data.enabled ?? DEFAULT_CONFIG.enabled,
          baseFee: data.baseFee ?? DEFAULT_CONFIG.baseFee,
          minFee: data.minFee ?? DEFAULT_CONFIG.minFee,
          maxFee: data.maxFee ?? DEFAULT_CONFIG.maxFee,
          tiers: data.tiers ?? DEFAULT_CONFIG.tiers,
          maxDeliveryDistance: data.maxDeliveryDistance ?? DEFAULT_CONFIG.maxDeliveryDistance,
          discountPercentage: data.discountPercentage ?? DEFAULT_CONFIG.discountPercentage,
          discountEligibleOrders: data.discountEligibleOrders ?? DEFAULT_CONFIG.discountEligibleOrders,
        });
      } else {
        // Document doesn't exist, use defaults
        callback(DEFAULT_CONFIG);
      }
    },
    (error) => {
      console.error('Error in delivery fee config subscription:', error);
      // Provide defaults on error
      callback(DEFAULT_CONFIG);
    }
  );
}

// ============================================================================
// Write Operations
// ============================================================================

/**
 * Save the delivery fee configuration to Firestore
 * Only admin users can write (enforced by Firestore rules)
 *
 * @param config - The configuration to save
 * @param userId - The admin user ID making the change (for audit trail)
 */
export async function saveDeliveryFeeConfig(
  config: DeliveryFeeConfig,
  userId: string
): Promise<void> {
  console.log('saveDeliveryFeeConfig called with:', { config, userId });
  console.log('Target collection/doc:', DELIVERY_FEE_CONFIG_COLLECTION, DELIVERY_FEE_CONFIG_DOC);

  try {
    const docRef = doc(db, DELIVERY_FEE_CONFIG_COLLECTION, DELIVERY_FEE_CONFIG_DOC);

    const dataToSave: DeliveryFeeConfigDocument = {
      enabled: config.enabled,
      baseFee: config.baseFee,
      minFee: config.minFee,
      maxFee: config.maxFee,
      tiers: config.tiers,
      maxDeliveryDistance: config.maxDeliveryDistance,
      discountPercentage: config.discountPercentage,
      discountEligibleOrders: config.discountEligibleOrders,
      updatedBy: userId,
    };

    console.log('Attempting to save:', dataToSave);

    await setDoc(docRef, {
      ...dataToSave,
      updatedAt: serverTimestamp(),
    });

    console.log('Save successful!');
  } catch (error) {
    console.error('Error saving delivery fee config:', error);
    throw new Error('Failed to save delivery fee configuration');
  }
}

/**
 * Reset the delivery fee configuration to default values
 *
 * @param userId - The admin user ID making the change (for audit trail)
 */
export async function resetDeliveryFeeConfigToDefaults(userId: string): Promise<void> {
  await saveDeliveryFeeConfig(DEFAULT_CONFIG, userId);
}
