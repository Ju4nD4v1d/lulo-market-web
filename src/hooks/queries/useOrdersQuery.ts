/**
 * TanStack Query hook for fetching orders
 * Uses orderApi for data fetching
 */

import { useQuery } from '@tanstack/react-query';
import { Order } from '../../types/order';
import { queryKeys } from './queryKeys';
import * as orderApi from '../../services/api/orderApi';

interface UseOrdersQueryOptions {
  storeId?: string | null;
  userId?: string | null;
  pageSize?: number;
  enabled?: boolean;
}

interface OrdersQueryResult {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useOrdersQuery = ({
  storeId,
  userId,
  pageSize = 50,
  enabled = true
}: UseOrdersQueryOptions): OrdersQueryResult => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: storeId
      ? queryKeys.orders.byStore(storeId)
      : queryKeys.orders.byUser(userId || ''),
    queryFn: async () => {
      if (!storeId && !userId) {
        // Return empty array instead of throwing for missing IDs
        return [];
      }

      try {
        if (storeId) {
          return await orderApi.getOrdersByStore(storeId, pageSize);
        } else {
          return await orderApi.getOrdersByUser(userId!, pageSize);
        }
      } catch (err) {
        // If the error is about missing index or permissions on empty collection,
        // return empty array instead of throwing
        const errorMessage = (err as Error).message || '';
        if (
          errorMessage.includes('index') ||
          errorMessage.includes('permission') ||
          errorMessage.includes('Missing or insufficient permissions') ||
          errorMessage.includes('requires an index')
        ) {
          console.warn('Orders query returned error (may be empty collection or missing index):', errorMessage);
          return [];
        }
        throw err;
      }
    },
    enabled: enabled && (!!storeId || !!userId),
    staleTime: 2 * 60 * 1000, // 2 minutes - orders change frequently
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    retry: 1, // Reduce retries since empty collection might consistently fail
  });

  return {
    orders: data || [],
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
  };
};
