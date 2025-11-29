/**
 * TanStack Query hook for fetching orders trend data
 * Uses analyticsApi for data fetching
 */

import { useQuery } from '@tanstack/react-query';
import * as analyticsApi from '../services/api/analyticsApi';

interface WeeklyOrderData {
  week: number;
  orders: number;
}

interface UseOrdersTrendReturn {
  data: WeeklyOrderData[];
  loading: boolean;
  error: string | null;
}

export function useOrdersTrend(storeId: string): UseOrdersTrendReturn {
  const { data, isLoading, error } = useQuery({
    queryKey: ['ordersTrend', storeId],
    queryFn: async () => {
      if (!storeId) return [];
      return analyticsApi.getOrdersTrend(storeId);
    },
    enabled: !!storeId,
    staleTime: 2 * 60 * 1000, // 2 minutes - orders change more frequently
    gcTime: 10 * 60 * 1000,
  });

  return {
    data: data || [],
    loading: isLoading,
    error: error ? (error as Error).message : null,
  };
}
