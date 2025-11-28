/**
 * TanStack Query hook for real-time order status monitoring during checkout
 * Uses orderApi for data fetching with polling for real-time updates
 */

import { useQuery } from '@tanstack/react-query';
import { Order, OrderStatus } from '../../types/order';
import { queryKeys } from './queryKeys';
import * as orderApi from '../../services/api/orderApi';

interface UseOrderMonitoringQueryOptions {
  orderId: string | null;
  enabled?: boolean;
}

interface OrderMonitoringQueryResult {
  order: Order | null;
  status: OrderStatus | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to monitor order status in real-time during checkout
 * Uses polling (refetchInterval) for TanStack Query compatibility
 */
export const useOrderMonitoringQuery = ({
  orderId,
  enabled = true
}: UseOrderMonitoringQueryOptions): OrderMonitoringQueryResult => {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.checkout.orderMonitoring(orderId || ''),
    queryFn: async () => {
      if (!orderId) {
        throw new Error('Order ID is required');
      }
      return orderApi.getOrderById(orderId);
    },
    enabled: enabled && !!orderId,
    staleTime: 2 * 1000, // 2 seconds - very fresh for real-time monitoring
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 3 * 1000, // Poll every 3 seconds for real-time updates
    retry: 3,
  });

  return {
    order: data || null,
    status: data?.status || null,
    isLoading,
    error: error ? (error as Error).message : null,
  };
};
