/**
 * useMarketplaceStores Hook
 *
 * Filters stores to only show those that are ready for marketplace:
 * - Have a connected Stripe account
 * - Have accepted all legal agreements
 *
 * This prevents users from seeing/buying from stores that can't process payments.
 */

import { useState, useEffect, useMemo } from 'react';
import { StoreData } from '../types/store';
import { getStoreAcceptances, StoreAcceptance } from '../services/api/storeAcceptancesApi';
import {
  hasValidStripeAccount,
  filterMarketplaceReadyStores,
} from '../utils/storeValidation';

interface UseMarketplaceStoresReturn {
  /** Stores that are ready for marketplace (have Stripe + agreements) */
  validatedStores: StoreData[];
  /** Loading state while validating stores */
  isValidating: boolean;
  /** Any error that occurred during validation */
  validationError: string | null;
}

/**
 * Hook to filter and validate stores for marketplace display
 *
 * @param stores - Array of stores to validate
 * @returns Object containing validated stores and loading state
 */
export function useMarketplaceStores(stores: StoreData[]): UseMarketplaceStoresReturn {
  const [acceptancesMap, setAcceptancesMap] = useState<Map<string, StoreAcceptance | null>>(
    new Map()
  );
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // First filter: Only fetch acceptances for stores that have Stripe
  // This optimization reduces the number of Firestore queries
  // Note: Depends on stable `stores` reference from TanStack Query
  const storesWithStripe = useMemo(
    () => stores.filter(hasValidStripeAccount),
    [stores]
  );

  // Track store IDs to prevent unnecessary refetches when only reference changes
  const storeIdsKey = useMemo(
    () => storesWithStripe.map(s => s.id).join(','),
    [storesWithStripe]
  );

  // Fetch acceptances for stores that pass the Stripe check
  useEffect(() => {
    if (storesWithStripe.length === 0) {
      setAcceptancesMap(new Map());
      setIsValidating(false);
      return;
    }

    let isCancelled = false;
    setIsValidating(true);
    setValidationError(null);

    const fetchAcceptances = async () => {
      try {
        // Fetch acceptances in parallel for all stores with Stripe
        const acceptancePromises = storesWithStripe.map(async (store) => {
          try {
            const acceptance = await getStoreAcceptances(store.id);
            return { storeId: store.id, acceptance };
          } catch {
            // If we can't fetch acceptance, treat as not accepted
            return { storeId: store.id, acceptance: null };
          }
        });

        const results = await Promise.all(acceptancePromises);

        if (!isCancelled) {
          const newMap = new Map<string, StoreAcceptance | null>();
          results.forEach(({ storeId, acceptance }) => {
            newMap.set(storeId, acceptance);
          });
          setAcceptancesMap(newMap);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Error fetching store acceptances:', error);
          setValidationError('Failed to validate stores');
        }
      } finally {
        if (!isCancelled) {
          setIsValidating(false);
        }
      }
    };

    fetchAcceptances();

    return () => {
      isCancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeIdsKey]);

  // Filter to only marketplace-ready stores
  const validatedStores = useMemo(
    () => filterMarketplaceReadyStores(storesWithStripe, acceptancesMap),
    [storesWithStripe, acceptancesMap]
  );

  return {
    validatedStores,
    isValidating,
    validationError,
  };
}
