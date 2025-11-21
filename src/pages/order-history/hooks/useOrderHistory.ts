import { useState, useEffect } from 'react';
import { Order } from '../../../types/order';
import { useDataProvider } from '../../../services/DataProvider';

interface UseOrderHistoryReturn {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook to fetch and manage order history for the current user
 */
export const useOrderHistory = (userId: string | undefined): UseOrderHistoryReturn => {
  const { getOrders } = useDataProvider();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const ordersSnapshot = await getOrders(userId);

        let ordersData: Order[] = [];
        if (ordersSnapshot && ordersSnapshot.docs) {
          // Firebase format
          ordersData = ordersSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
              updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt || Date.now()),
              estimatedDeliveryTime: data.estimatedDeliveryTime?.toDate ? data.estimatedDeliveryTime.toDate() : data.estimatedDeliveryTime ? new Date(data.estimatedDeliveryTime) : undefined,
              deliveredAt: data.deliveredAt?.toDate ? data.deliveredAt.toDate() : data.deliveredAt ? new Date(data.deliveredAt) : undefined
            };
          }) as Order[];
        } else if (Array.isArray(ordersSnapshot)) {
          // Mock data format
          ordersData = ordersSnapshot as Order[];
        }

        // Sort by creation date (newest first)
        ordersData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setOrders(ordersData);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError(error instanceof Error ? error.message : 'Failed to load orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId, getOrders]);

  return { orders, loading, error };
};
