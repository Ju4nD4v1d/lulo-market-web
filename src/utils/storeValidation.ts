/**
 * Store Validation Utilities
 *
 * Functions to validate if a store meets marketplace requirements:
 * 1. Has connected Stripe account (can receive payments)
 * 2. Has accepted all legal agreements
 */

import { StoreData } from '../types/store';
import { StoreAcceptance } from '../services/api/storeAcceptancesApi';

/**
 * Check if a store has a valid Stripe account for receiving payments
 */
export function hasValidStripeAccount(store: StoreData): boolean {
  return Boolean(store.stripeAccountId && store.stripeAccountId.trim() !== '');
}

/**
 * Check if all legal agreements have been accepted
 */
export function hasAcceptedAllAgreements(acceptance: StoreAcceptance | null): boolean {
  if (!acceptance) {
    return false;
  }

  return (
    acceptance.sellerAgreement.accepted &&
    acceptance.payoutPolicy.accepted &&
    acceptance.refundPolicy.accepted
  );
}

/**
 * Check if a store is ready for marketplace display
 * Requires both Stripe account and legal agreements
 */
export function isStoreMarketplaceReady(
  store: StoreData,
  acceptance: StoreAcceptance | null
): boolean {
  return hasValidStripeAccount(store) && hasAcceptedAllAgreements(acceptance);
}

/**
 * Filter stores that are marketplace-ready
 * Used with pre-fetched acceptances map
 */
export function filterMarketplaceReadyStores(
  stores: StoreData[],
  acceptancesMap: Map<string, StoreAcceptance | null>
): StoreData[] {
  return stores.filter(store => {
    const acceptance = acceptancesMap.get(store.id) ?? null;
    return isStoreMarketplaceReady(store, acceptance);
  });
}
