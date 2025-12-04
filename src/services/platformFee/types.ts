/**
 * Platform Fee Configuration Types
 *
 * Defines the structure for configurable platform fees
 * that can be managed via the admin panel.
 */

/**
 * Platform fee configuration interface
 */
export interface PlatformFeeConfig {
  /** The fixed platform fee amount in CAD */
  fixedAmount: number;
  /** Whether platform fee is enabled */
  enabled: boolean;
}

/**
 * Extended interface for Firestore documents with metadata
 */
export interface PlatformFeeConfigDocument extends PlatformFeeConfig {
  /** Timestamp of last update */
  updatedAt?: Date;
  /** User ID of who made the last update */
  updatedBy?: string;
}
