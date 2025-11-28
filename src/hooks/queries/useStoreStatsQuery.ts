/**
 * TanStack Query hook for fetching store statistics
 * Uses storeApi for count operations
 */

import { useQueries } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import * as storeApi from '../../services/api/storeApi';

interface StoreStats {
  totalProducts: number;
  totalOrders: number;
  loading: boolean;
}

export const useStoreStatsQuery = (storeId: string | null): StoreStats => {
  const results = useQueries({
    queries: [
      // Products count query
      {
        queryKey: [...queryKeys.products.byStore(storeId || ''), 'count'],
        queryFn: async () => {
          if (!storeId) return 0;
          return storeApi.getProductCountByStore(storeId);
        },
        enabled: !!storeId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000,
      },
      // Orders count query
      {
        queryKey: [...queryKeys.orders.byStore(storeId || ''), 'count'],
        queryFn: async () => {
          if (!storeId) return 0;
          return storeApi.getOrderCountByStore(storeId);
        },
        enabled: !!storeId,
        staleTime: 2 * 60 * 1000, // 2 minutes - orders change more frequently
        gcTime: 10 * 60 * 1000,
      },
    ],
  });

  const [productsQuery, ordersQuery] = results;

  return {
    totalProducts: productsQuery.data || 0,
    totalOrders: ordersQuery.data || 0,
    loading: productsQuery.isLoading || ordersQuery.isLoading,
  };
};
