/**
 * TanStack Query hook for order tracking
 * Uses orderApi for data fetching with automatic polling
 *
 * Polling behavior:
 * - Polls every 15 seconds while order is in progress
 * - Automatically stops polling when order reaches terminal state
 *   (delivered, cancelled, failed)
 */

import { useQuery } from '@tanstack/react-query';
import { Order, OrderStatus } from '../../types/order';
import { queryKeys } from './queryKeys';
import * as orderApi from '../../services/api/orderApi';

/** Terminal order statuses that don't need further polling */
const TERMINAL_STATUSES: OrderStatus[] = [
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
  OrderStatus.FAILED,
];

/** Polling interval in milliseconds (15 seconds) */
const POLLING_INTERVAL = 15 * 1000;

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
  /** Whether the order has reached a terminal state */
  isComplete: boolean;
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
    staleTime: 15 * 1000, // 15 seconds - match polling interval
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    // Poll every 15 seconds, but stop when order reaches terminal state
    refetchInterval: (query) => {
      const order = query.state.data;
      if (order && TERMINAL_STATUSES.includes(order.status)) {
        // Order is complete, stop polling
        return false;
      }
      return POLLING_INTERVAL;
    },
    retry: 2,
  });

  // Check if order has reached terminal state
  const isComplete = data ? TERMINAL_STATUSES.includes(data.status) : false;

  // Wrap refetch to force fresh data
  const forceRefetch = async () => {
    await refetch();
  };

  return {
    order: data || null,
    isLoading,
    error: error ? (error as Error).message : null,
    refetch: forceRefetch,
    isComplete,
  };
};
