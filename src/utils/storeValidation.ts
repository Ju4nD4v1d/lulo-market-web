/**
 * Store Validation Utilities
 *
 * Marketplace readiness is controlled by backend via `isMarketplaceReady` field.
 * Backend sets this to true when:
 * 1. Stripe account is fully set up (payouts enabled, details submitted)
 * 2. All legal agreements are accepted
 */

import { StoreData } from '../types/store';

/**
 * Check if a store is ready for marketplace display
 * This is controlled entirely by backend via the isMarketplaceReady field
 */
export function isStoreMarketplaceReady(store: StoreData): boolean {
  return store.isMarketplaceReady === true;
}

/**
 * Filter stores that are marketplace-ready
 */
export function filterMarketplaceReadyStores(stores: StoreData[]): StoreData[] {
  return stores.filter(isStoreMarketplaceReady);
}
