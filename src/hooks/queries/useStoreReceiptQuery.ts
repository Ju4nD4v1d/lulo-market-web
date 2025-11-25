/**
 * TanStack Query hook for fetching store information needed for receipts
 */

import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { queryKeys } from './queryKeys';

/**
 * Store receipt information interface
 */
export interface StoreReceiptInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  logo: string;
  website: string;
  businessNumber: string;
}

/**
 * Hook options
 */
interface UseStoreReceiptQueryOptions {
  storeId: string | undefined;
  enabled?: boolean;
}

/**
 * Fetch store information for receipt generation
 *
 * @param storeId Store ID
 * @returns Store receipt information
 */
const fetchStoreReceiptInfo = async (storeId: string): Promise<StoreReceiptInfo> => {
  try {
    const storeDoc = await getDoc(doc(db, 'stores', storeId));
    if (storeDoc.exists()) {
      const storeData = storeDoc.data();
      return {
        name: storeData.name || '',
        address: storeData.location?.address || '',
        phone: storeData.phone || '',
        email: storeData.email || '',
        logo: storeData.logo || storeData.storeImage || '',
        website: storeData.website || 'https://lulocart.com',
        businessNumber: storeData.businessNumber || ''
      };
    }
  } catch (error) {
    console.error('Error fetching store info:', error);
  }

  // Return default values if fetch fails
  return {
    name: '',
    address: '',
    phone: '',
    email: '',
    logo: '',
    website: 'https://lulocart.com',
    businessNumber: ''
  };
};

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
      return fetchStoreReceiptInfo(storeId);
    },
    enabled: enabled && !!storeId,
    staleTime: 5 * 60 * 1000, // 5 minutes - store info doesn't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};
