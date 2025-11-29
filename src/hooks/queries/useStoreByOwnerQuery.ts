/**
 * TanStack Query hook for fetching store by owner ID
 * Uses storeApi for data fetching
 */

import { useQuery } from '@tanstack/react-query';
import { StoreData } from '../../types';
import { queryKeys } from './queryKeys';
import * as storeApi from '../../services/api/storeApi';

interface UseStoreByOwnerQueryOptions {
  ownerId: string | undefined;
  enabled?: boolean;
}

interface StoreByOwnerQueryResult {
  storeData: StoreData | null;
  storeId: string | null;
  isLoading: boolean;
  error: string | null;
}

export const useStoreByOwnerQuery = ({
  ownerId,
  enabled = true
}: UseStoreByOwnerQueryOptions): StoreByOwnerQueryResult => {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.stores.byOwner(ownerId || ''),
    queryFn: async () => {
      if (!ownerId) {
        throw new Error('Owner ID is required');
      }
      return storeApi.getStoreByOwnerWithData(ownerId);
    },
    enabled: enabled && !!ownerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
  });

  return {
    storeData: data?.storeData || null,
    storeId: data?.storeId || null,
    isLoading,
    error: error ? (error as Error).message : null,
  };
};
