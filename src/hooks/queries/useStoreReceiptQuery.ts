/**
 * TanStack Query hook for fetching store information needed for receipts
 */

import { useQuery } from '@tanstack/react-query';
import * as storeApi from '../../services/api/storeApi';
import { queryKeys } from './queryKeys';

// Re-export type from storeApi
export type { StoreReceiptInfo } from '../../services/api/storeApi';

/**
 * Hook options
 */
interface UseStoreReceiptQueryOptions {
  storeId: string | undefined;
  enabled?: boolean;
}

/**
 * Hook to query store receipt information
 *
 * @param options Query options with storeId and enabled flag
 * @returns Query result with store receipt info
 */
export const useStoreReceiptQuery = ({ storeId, enabled = true }: UseStoreReceiptQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.checkout.storeReceipt(storeId || ''),
    queryFn: async () => {
      if (!storeId) {
        throw new Error('Store ID is required');
      }
      return storeApi.getStoreReceiptInfo(storeId);
    },
    enabled: enabled && !!storeId,
    staleTime: 5 * 60 * 1000, // 5 minutes - store info doesn't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};
