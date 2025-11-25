import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Order } from '../../types/order';
import { queryKeys } from './queryKeys';

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
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('id', '==', orderId),
        where('customerInfo.email', '==', userEmail)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      const orderDoc = snapshot.docs[0];
      const orderData = orderDoc.data() as Order;

      return {
        ...orderData,
        id: orderDoc.id
      };
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
