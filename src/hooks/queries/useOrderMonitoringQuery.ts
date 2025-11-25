/**
 * TanStack Query hook for real-time order status monitoring during checkout
 */

import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Order, OrderStatus } from '../../types/order';
import { queryKeys } from './queryKeys';

/**
 * Hook options
 */
interface UseOrderMonitoringQueryOptions {
  orderId: string | null;
  enabled?: boolean;
}

/**
 * Query result
 */
interface OrderMonitoringQueryResult {
  order: Order | null;
  status: OrderStatus | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Fetch order document by ID
 *
 * @param orderId Order ID
 * @returns Order data
 */
const fetchOrder = async (orderId: string): Promise<Order | null> => {
  try {
    const orderDoc = await getDoc(doc(db, 'orders', orderId));
    if (orderDoc.exists()) {
      const orderData = orderDoc.data();
      return {
        ...orderData,
        id: orderDoc.id,
        createdAt: orderData.createdAt?.toDate() || new Date(),
        updatedAt: orderData.updatedAt?.toDate() || new Date(),
        estimatedDeliveryTime: orderData.estimatedDeliveryTime?.toDate(),
        deliveredAt: orderData.deliveredAt?.toDate(),
        preferredDeliveryTime: orderData.preferredDeliveryTime?.toDate(),
        orderPlacedAt: orderData.orderPlacedAt?.toDate(),
        preparationStartedAt: orderData.preparationStartedAt?.toDate(),
        readyForPickupAt: orderData.readyForPickupAt?.toDate(),
      } as Order;
    }
    return null;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

/**
 * Hook to monitor order status in real-time during checkout
 * Uses polling (refetchInterval) instead of onSnapshot for TanStack Query compatibility
 *
 * @param options Query options with orderId and enabled flag
 * @returns Query result with order data and status
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
      return fetchOrder(orderId);
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
