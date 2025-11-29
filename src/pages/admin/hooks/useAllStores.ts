/**
 * useAllStores - Hook for fetching all stores (admin use)
 */

import { useQuery } from '@tanstack/react-query';
import { getAllStores } from '../../../services/api/storeApi';

export const useAllStores = () => {
  const query = useQuery({
    queryKey: ['admin', 'stores', 'all'],
    queryFn: getAllStores,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
  });

  return {
    stores: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};
