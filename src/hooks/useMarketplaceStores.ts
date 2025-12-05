/**
 * useMarketplaceStores Hook
 *
 * Filters stores to only show those that are marketplace-ready.
 * Readiness is determined by backend via the `isMarketplaceReady` field.
 */

import { useMemo } from 'react';
import { StoreData } from '../types/store';
import { filterMarketplaceReadyStores } from '../utils/storeValidation';

interface UseMarketplaceStoresReturn {
  /** Stores that are ready for marketplace */
  validatedStores: StoreData[];
}

/**
 * Hook to filter stores for marketplace display
 * Only shows stores where backend has set isMarketplaceReady = true
 */
export function useMarketplaceStores(stores: StoreData[]): UseMarketplaceStoresReturn {
  const validatedStores = useMemo(
    () => filterMarketplaceReadyStores(stores),
    [stores]
  );

  return { validatedStores };
}
