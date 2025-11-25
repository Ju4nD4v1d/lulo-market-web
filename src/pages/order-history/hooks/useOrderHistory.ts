import { Order } from '../../../types/order';
import { useOrdersQuery } from '../../../hooks/queries/useOrdersQuery';

interface UseOrderHistoryReturn {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook to fetch and manage order history for the current user
 * Now uses TanStack Query for better caching and state management
 */
export const useOrderHistory = (userId: string | undefined): UseOrderHistoryReturn => {
  const { orders, isLoading, error } = useOrdersQuery({ userId });

  return {
    orders: orders || [],
    loading: isLoading,
    error: error ? 'Failed to load orders. Please try again.' : null
  };
};
