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
  userId?: string;
  userEmail: string;
  enabled?: boolean;
}

interface OrderTrackingQueryResult {
  order: Order | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useOrderTrackingQuery = ({
  orderId,
  userId,
  userEmail,
  enabled = true
}: UseOrderTrackingQueryOptions): OrderTrackingQueryResult => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.orders.tracking(orderId, userId || userEmail),
    queryFn: async () => {
      try {
        const order = await orderApi.getOrderById(orderId);

        // Verify access: userId match (preferred) OR email match (fallback)
        const orderUserId = order.userId;
        const orderEmail = order.customerInfo?.email?.toLowerCase();
        const requestEmail = userEmail.toLowerCase();

        const userIdMatches = userId && orderUserId && userId === orderUserId;
        const emailMatches = orderEmail === requestEmail;

        if (!userIdMatches && !emailMatches) {
          console.warn('Order access denied - neither userId nor email match');
          return null;
        }

        return order;
      } catch {
        // Order not found
        console.warn('Order not found:', orderId);
        return null;
      }
    },
    enabled: enabled && !!orderId && (!!userId || !!userEmail),
    staleTime: 30 * 1000, // 30 seconds - real-time tracking needs frequent updates
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    refetchInterval: 30 * 1000, // Auto-refetch every 30 seconds for real-time updates
    retry: 2,
  });

  // Wrap refetch to force fresh data
  const forceRefetch = async () => {
    await refetch();
  };

  return {
    order: data || null,
    isLoading,
    error: error ? (error as Error).message : null,
    refetch: forceRefetch,
  };
};
