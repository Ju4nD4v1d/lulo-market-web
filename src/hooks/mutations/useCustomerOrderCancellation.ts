/**
 * useCustomerOrderCancellation - Mutation hook for customer-initiated order cancellation
 *
 * This hook handles the full cancellation flow:
 * 1. Void the payment authorization (releases held funds)
 * 2. Update order status to CANCELLED
 * 3. Invalidate queries to refresh the UI
 *
 * The backend voidPaymentAuthorization function now only updates payment fields,
 * so we need to separately update the order status.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { OrderStatus } from '../../types/order';
import { queryKeys } from '../queries';
import * as orderApi from '../../services/api/orderApi';
import * as paymentApi from '../../services/api/paymentApi';

interface CancelOrderVariables {
  orderId: string;
  userId?: string;
  userEmail: string;
}

interface CancelOrderResult {
  success: boolean;
  orderId: string;
}

export const useCustomerOrderCancellation = () => {
  const queryClient = useQueryClient();

  const cancelOrder = useMutation({
    mutationFn: async ({ orderId }: CancelOrderVariables): Promise<CancelOrderResult> => {
      console.log('🔄 Customer cancelling order:', orderId);

      // Step 1: Void the payment authorization to release held funds
      const voidResult = await paymentApi.voidPaymentAuthorization(
        orderId,
        'Customer requested cancellation'
      );

      if (!voidResult.success) {
        console.error('❌ Failed to void payment:', voidResult.error);
        throw new Error(voidResult.error || 'Failed to void payment authorization');
      }

      console.log('✅ Payment authorization voided');

      // Step 2: Update order status to CANCELLED
      // Note: Backend voidPaymentAuthorization only updates payment fields,
      // so we need to update the status separately
      await orderApi.updateOrderStatus(orderId, OrderStatus.CANCELLED);

      console.log('✅ Order status updated to CANCELLED');

      return { success: true, orderId };
    },

    // Optimistic update - immediately show cancelled status
    onMutate: async ({ orderId, userEmail }) => {
      // Cancel any outgoing refetches to prevent overwriting optimistic update
      await queryClient.cancelQueries({
        queryKey: queryKeys.orders.tracking(orderId, userEmail),
      });

      // Snapshot the previous order data
      const previousOrder = queryClient.getQueryData(queryKeys.orders.tracking(orderId, userEmail));

      // Optimistically update the order status
      queryClient.setQueryData(queryKeys.orders.tracking(orderId, userEmail), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          status: OrderStatus.CANCELLED,
          paymentStatus: 'voided',
          updatedAt: new Date(),
          cancelledAt: new Date(),
          cancelledBy: 'customer',
        };
      });

      // Return context with previous data for potential rollback
      return { previousOrder, orderId, userEmail };
    },

    // Rollback on error
    onError: (err, variables, context) => {
      console.error('❌ Order cancellation failed:', err);
      if (context?.previousOrder && context?.userEmail) {
        queryClient.setQueryData(
          queryKeys.orders.tracking(context.orderId, context.userEmail),
          context.previousOrder
        );
      }
    },

    // Refetch to ensure consistency after mutation settles
    onSettled: (_data, _error, variables) => {
      // Invalidate tracking query
      queryClient.invalidateQueries({
        queryKey: queryKeys.orders.tracking(variables.orderId, variables.userEmail),
      });
      // Also invalidate order lists that may show this order
      queryClient.invalidateQueries({
        queryKey: queryKeys.orders.all,
      });
    },
  });

  return {
    cancelOrder: cancelOrder.mutateAsync,
    isCancelling: cancelOrder.isPending,
    error: cancelOrder.error,
    isSuccess: cancelOrder.isSuccess,
  };
};
