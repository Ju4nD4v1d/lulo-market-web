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
        throw new Error('Either Store ID or User ID is required');
      }

      if (storeId) {
        console.log('🔍 Loading orders for storeId:', storeId);
        return orderApi.getOrdersByStore(storeId, pageSize);
      } else {
        console.log('🔍 Loading orders for userId:', userId);
        return orderApi.getOrdersByUser(userId!, pageSize);
      }
    },
    enabled: enabled && (!!storeId || !!userId),
    staleTime: 2 * 60 * 1000, // 2 minutes - orders change frequently
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    retry: 2,
  });

  return {
    orders: data || [],
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
  };
};
