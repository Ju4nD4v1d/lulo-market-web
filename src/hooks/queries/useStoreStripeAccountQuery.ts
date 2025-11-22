/**
 * TanStack Query hook for fetching store's Stripe account information
 */

import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { queryKeys } from './queryKeys';

/**
 * Store Stripe account information
 */
export interface StoreStripeAccount {
  stripeAccountId: string | null;
  stripeEnabled: boolean;
}

/**
 * Hook options
 */
interface UseStoreStripeAccountQueryOptions {
  storeId: string | undefined;
  enabled?: boolean;
}

/**
 * Fetch store's Stripe account information
 *
 * @param storeId Store ID
 * @returns Store's Stripe account data
 */
const fetchStoreStripeAccount = async (storeId: string): Promise<StoreStripeAccount> => {
  try {
    const storeDoc = await getDoc(doc(db, 'stores', storeId));
    if (storeDoc.exists()) {
      const storeData = storeDoc.data();
      return {
        stripeAccountId: storeData.stripeAccountId || null,
        stripeEnabled: storeData.stripeEnabled || false
      };
    }
  } catch (error) {
    console.error('Error fetching store Stripe account:', error);
  }

  return {
    stripeAccountId: null,
    stripeEnabled: false
  };
};

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
      return fetchStoreStripeAccount(storeId);
    },
    enabled: enabled && !!storeId,
    staleTime: 10 * 60 * 1000, // 10 minutes - Stripe config rarely changes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};
