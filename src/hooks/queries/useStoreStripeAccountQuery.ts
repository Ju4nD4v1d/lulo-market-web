/**
 * TanStack Query hook for fetching store's Stripe account information
 */

import { useQuery } from '@tanstack/react-query';
import * as storeApi from '../../services/api/storeApi';
import { queryKeys } from './queryKeys';

// Re-export type from storeApi
export type { StoreStripeAccount } from '../../services/api/storeApi';

/**
 * Hook options
 */
interface UseStoreStripeAccountQueryOptions {
  storeId: string | undefined;
  enabled?: boolean;
}

/**
 * Hook to query store's Stripe account information
 *
 * @param options Query options with storeId and enabled flag
 * @returns Query result with Stripe account info
 */
export const useStoreStripeAccountQuery = ({
  storeId,
  enabled = true
}: UseStoreStripeAccountQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.checkout.stripeAccount(storeId || ''),
    queryFn: async () => {
      if (!storeId) {
        throw new Error('Store ID is required');
      }
      return storeApi.getStoreStripeAccount(storeId);
    },
    enabled: enabled && !!storeId,
    staleTime: 10 * 60 * 1000, // 10 minutes - Stripe config rarely changes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};
