import { useMemo } from 'react';
import { Order } from '../../../types/order';
import { useOrdersQuery } from '../../../hooks/queries/useOrdersQuery';
import { filterOrdersForUser } from '../../../utils/orderUtils';

interface UseOrderHistoryReturn {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook to fetch and manage order history for the current user
 * Now uses TanStack Query for better caching and state management
 *
 * Filters out abandoned/orphan orders (status: pending + paymentStatus: pending)
 * to prevent showing incomplete checkout attempts to customers.
 */
export const useOrderHistory = (userId: string | undefined): UseOrderHistoryReturn => {
  const { orders, isLoading, error } = useOrdersQuery({ userId });

  // Filter out orphan orders (abandoned checkouts) - customers should not see them
  const visibleOrders = useMemo(() => {
    return filterOrdersForUser(orders || []);
  }, [orders]);

  return {
    orders: visibleOrders,
    loading: isLoading,
    error: error ? 'Failed to load orders. Please try again.' : null
  };
};
