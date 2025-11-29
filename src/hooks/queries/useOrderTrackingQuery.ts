/**
 * TanStack Query hook for order tracking
 * Uses orderApi for data fetching
 */

import { useQuery } from '@tanstack/react-query';
import { Order } from '../../types/order';
import { queryKeys } from './queryKeys';
import * as orderApi from '../../services/api/orderApi';

interface UseOrderTrackingQueryOptions {
  orderId: string;
  userEmail: string;
  enabled?: boolean;
}

interface OrderTrackingQueryResult {
  order: Order | null;
  isLoading: boolean;
  error: string | null;
}

export const useOrderTrackingQuery = ({
  orderId,
  userEmail,
  enabled = true
}: UseOrderTrackingQueryOptions): OrderTrackingQueryResult => {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.orders.tracking(orderId, userEmail),
    queryFn: async () => {
      try {
        const order = await orderApi.getOrderById(orderId);

        // Verify the email matches for security
        const orderEmail = order.customerInfo?.email?.toLowerCase();
        const requestEmail = userEmail.toLowerCase();

        if (orderEmail !== requestEmail) {
          console.warn('Order email mismatch - access denied');
          return null;
        }

        return order;
      } catch {
        // Order not found
        console.warn('Order not found:', orderId);
        return null;
      }
    },
    enabled: enabled && !!orderId && !!userEmail,
    staleTime: 30 * 1000, // 30 seconds - real-time tracking needs frequent updates
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    refetchInterval: 30 * 1000, // Auto-refetch every 30 seconds for real-time updates
    retry: 2,
  });

  return {
    order: data || null,
    isLoading,
    error: error ? (error as Error).message : null,
  };
};
