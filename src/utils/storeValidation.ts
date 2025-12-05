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
 *
 * A store is only ready if:
 * 1. Has a Stripe account ID (account created)
 * 2. Stripe has enabled payouts (verification complete)
 * 3. Details have been submitted to Stripe
 */
export function hasValidStripeAccount(store: StoreData): boolean {
  const hasAccountId = Boolean(store.stripeAccountId && store.stripeAccountId.trim() !== '');
  const hasPayoutsEnabled = Boolean(store.stripePayoutsEnabled);
  const hasDetailsSubmitted = Boolean(store.stripeDetailsSubmitted);

  return hasAccountId && hasPayoutsEnabled && hasDetailsSubmitted;
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
