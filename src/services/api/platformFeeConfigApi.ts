/**
 * Platform Fee Config API - Admin-only configuration for platform fees
 *
 * Collection: platformFeeConfig
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
  PLATFORM_FEE_CONFIG_COLLECTION,
  PLATFORM_FEE_CONFIG_DOC,
  DEFAULT_PLATFORM_FEE_CONFIG,
} from '../platformFee/constants';
import type { PlatformFeeConfig, PlatformFeeConfigDocument } from '../platformFee/types';

// ============================================================================
// Read Operations
// ============================================================================

/**
 * Get the current platform fee configuration from Firestore
 * Falls back to DEFAULT_PLATFORM_FEE_CONFIG if document doesn't exist
 */
export async function getPlatformFeeConfig(): Promise<PlatformFeeConfig> {
  try {
    const docRef = doc(db, PLATFORM_FEE_CONFIG_COLLECTION, PLATFORM_FEE_CONFIG_DOC);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as PlatformFeeConfigDocument;
      return {
        fixedAmount: data.fixedAmount ?? DEFAULT_PLATFORM_FEE_CONFIG.fixedAmount,
        enabled: data.enabled ?? DEFAULT_PLATFORM_FEE_CONFIG.enabled,
      };
    }

    // Document doesn't exist, return defaults
    return DEFAULT_PLATFORM_FEE_CONFIG;
  } catch (error) {
    console.error('Error fetching platform fee config:', error);
    // Return defaults on error
    return DEFAULT_PLATFORM_FEE_CONFIG;
  }
}

/**
 * Subscribe to real-time updates of the platform fee configuration
 */
export function subscribeToPlatformFeeConfig(
  callback: (config: PlatformFeeConfig) => void
): Unsubscribe {
  const docRef = doc(db, PLATFORM_FEE_CONFIG_COLLECTION, PLATFORM_FEE_CONFIG_DOC);

  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as PlatformFeeConfigDocument;
        callback({
          fixedAmount: data.fixedAmount ?? DEFAULT_PLATFORM_FEE_CONFIG.fixedAmount,
          enabled: data.enabled ?? DEFAULT_PLATFORM_FEE_CONFIG.enabled,
        });
      } else {
        // Document doesn't exist, use defaults
        callback(DEFAULT_PLATFORM_FEE_CONFIG);
      }
    },
    (error) => {
      console.error('Error in platform fee config subscription:', error);
      // Provide defaults on error
      callback(DEFAULT_PLATFORM_FEE_CONFIG);
    }
  );
}

// ============================================================================
// Write Operations
// ============================================================================

/**
 * Save the platform fee configuration to Firestore
 * Only admin users can write (enforced by Firestore rules)
 *
 * @param config - The configuration to save
 * @param userId - The admin user ID making the change (for audit trail)
 */
export async function savePlatformFeeConfig(
  config: PlatformFeeConfig,
  userId: string
): Promise<void> {
  try {
    const docRef = doc(db, PLATFORM_FEE_CONFIG_COLLECTION, PLATFORM_FEE_CONFIG_DOC);

    const dataToSave: PlatformFeeConfigDocument = {
      fixedAmount: config.fixedAmount,
      enabled: config.enabled,
      updatedBy: userId,
    };

    await setDoc(docRef, {
      ...dataToSave,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error saving platform fee config:', error);
    throw new Error('Failed to save platform fee configuration');
  }
}

/**
 * Reset the platform fee configuration to default values
 *
 * @param userId - The admin user ID making the change (for audit trail)
 */
export async function resetPlatformFeeConfigToDefaults(userId: string): Promise<void> {
  await savePlatformFeeConfig(DEFAULT_PLATFORM_FEE_CONFIG, userId);
}
