import { useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { OrderStatus } from '../../types/order';
import { queryKeys } from '../queries/queryKeys';

interface UpdateOrderStatusVariables {
  orderId: string;
  newStatus: OrderStatus;
}

export const useOrderMutations = (storeId: string) => {
  const queryClient = useQueryClient();

  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, newStatus }: UpdateOrderStatusVariables) => {
      const orderRef = doc(db, 'orders', orderId);
      const updateData: Record<string, unknown> = {
        status: newStatus,
        updatedAt: serverTimestamp()
      };

      if (newStatus === OrderStatus.DELIVERED) {
        updateData.deliveredAt = serverTimestamp();
      }

      await updateDoc(orderRef, updateData);

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
      queryClient.setQueryData(queryKeys.orders.byStore(storeId), (old: any) => {
        if (!old) return old;
        return old.map((order: any) =>
          order.id === orderId
            ? { ...order, status: newStatus, updatedAt: new Date() }
            : order
        );
      });

      // Return context with previous data for rollback
      return { previousOrders };
    },
    // Rollback on error
    onError: (err, variables, context) => {
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
