import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { Order } from '../../../types/order';

interface UseOrderTrackingReturn {
  order: Order | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for fetching and tracking a specific order
 */
export const useOrderTracking = (
  orderId: string,
  currentUserId: string | undefined
): UseOrderTrackingReturn => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!currentUserId || !orderId) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      try {
        // Query orders collection for this specific order belonging to the current user
        const ordersRef = collection(db, 'orders');
        const q = query(
          ordersRef,
          where('customerId', '==', currentUserId),
          where('__name__', '==', orderId)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setError('Order not found or access denied');
          setLoading(false);
          return;
        }

        const orderDoc = querySnapshot.docs[0];
        const orderData = orderDoc.data();

        const fetchedOrder: Order = {
          id: orderDoc.id,
          ...orderData,
          createdAt: orderData.createdAt?.toDate ? orderData.createdAt.toDate() : new Date(orderData.createdAt || Date.now()),
          updatedAt: orderData.updatedAt?.toDate ? orderData.updatedAt.toDate() : new Date(orderData.updatedAt || Date.now()),
          estimatedDeliveryTime: orderData.estimatedDeliveryTime?.toDate ? orderData.estimatedDeliveryTime.toDate() : orderData.estimatedDeliveryTime ? new Date(orderData.estimatedDeliveryTime) : undefined,
          deliveredAt: orderData.deliveredAt?.toDate ? orderData.deliveredAt.toDate() : orderData.deliveredAt ? new Date(orderData.deliveredAt) : undefined
        } as Order;

        setOrder(fetchedOrder);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [currentUserId, orderId]);

  return {
    order,
    loading,
    error,
  };
};
