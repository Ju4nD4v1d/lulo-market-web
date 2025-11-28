/**
 * TanStack Query mutations for order operations
 * Uses orderApi for data mutations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { OrderStatus } from '../../types/order';
import { queryKeys } from '../queries';
import * as orderApi from '../../services/api/orderApi';

interface UpdateOrderStatusVariables {
  orderId: string;
  newStatus: OrderStatus;
}

export const useOrderMutations = (storeId: string) => {
  const queryClient = useQueryClient();

  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, newStatus }: UpdateOrderStatusVariables) => {
      await orderApi.updateOrderStatus(orderId, newStatus);
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
