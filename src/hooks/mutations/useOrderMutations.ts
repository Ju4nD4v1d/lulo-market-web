/**
 * TanStack Query mutations for order operations
 * Uses orderApi for data mutations
 *
 * Delayed Capture Integration:
 * When an order is marked as DELIVERED, we automatically trigger
 * payment capture via the paymentApi. This captures the authorized
 * funds that were held at checkout.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Order, OrderStatus } from '../../types/order';
import { queryKeys } from '../queries';
import * as orderApi from '../../services/api/orderApi';
import * as paymentApi from '../../services/api/paymentApi';

interface UpdateOrderStatusVariables {
  orderId: string;
  newStatus: OrderStatus;
  /** Current order data - needed to check paymentStatus for capture */
  order?: Order;
}

export const useOrderMutations = (storeId: string) => {
  const queryClient = useQueryClient();

  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, newStatus, order }: UpdateOrderStatusVariables) => {
      // Update order status first
      await orderApi.updateOrderStatus(orderId, newStatus);

      // If marking as DELIVERED and payment is authorized, capture the payment
      if (newStatus === OrderStatus.DELIVERED) {
        const shouldCapture = order?.paymentStatus === 'authorized';

        if (shouldCapture) {
          console.log('📦 Order delivered - capturing authorized payment...');
          try {
            const captureResult = await paymentApi.capturePayment(orderId);
            if (captureResult.success) {
              console.log('✅ Payment captured successfully:', captureResult.amountCaptured, 'cents');
            } else {
              // Log error but don't fail the status update
              // Backend may have already captured or will handle it
              console.error('⚠️ Payment capture returned error:', captureResult.error);
            }
          } catch (error) {
            // Log error but don't fail the status update
            // The order status was already updated successfully
            console.error('⚠️ Failed to capture payment (order status updated):', error);
          }
        } else {
          console.log('📦 Order delivered - payment already captured or not authorized');
        }
      }

      return { orderId, newStatus };
    },
    // Optimistic update for better UX
    onMutate: async ({ orderId, newStatus }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.orders.byStore(storeId),
      });

      // Snapshot the previous value
      const previousOrders = queryClient.getQueryData(queryKeys.orders.byStore(storeId));

      // Optimistically update to the new value
      queryClient.setQueryData(queryKeys.orders.byStore(storeId), (old: unknown) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map((order: { id: string; status: OrderStatus }) =>
          order.id === orderId
            ? { ...order, status: newStatus, updatedAt: new Date() }
            : order
        );
      });

      // Return context with previous data for rollback
      return { previousOrders };
    },
    // Rollback on error
    onError: (_err, _variables, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(
          queryKeys.orders.byStore(storeId),
          context.previousOrders
        );
      }
    },
    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.orders.byStore(storeId),
      });
    },
  });

  return {
    updateOrderStatus,
    isUpdating: updateOrderStatus.isPending,
    error: updateOrderStatus.error,
  };
};
