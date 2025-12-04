/**
 * Platform Fee Constants
 *
 * Default configuration values and Firestore collection paths
 * for platform fee management.
 */

import { PlatformFeeConfig } from './types';

/**
 * Default platform fee configuration
 * Used when Firestore config doesn't exist or on error
 */
export const DEFAULT_PLATFORM_FEE_CONFIG: PlatformFeeConfig = {
  fixedAmount: 0.99,  // Default $0.99 CAD
  enabled: true,
};

/**
 * Firestore collection name for platform fee configuration
 */
export const PLATFORM_FEE_CONFIG_COLLECTION = 'platformFeeConfig';

/**
 * Firestore document ID for the current configuration
 */
export const PLATFORM_FEE_CONFIG_DOC = 'current';
