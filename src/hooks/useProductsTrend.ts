/**
 * TanStack Query hook for fetching products trend data
 * Uses analyticsApi for data fetching
 */

import { useQuery } from '@tanstack/react-query';
import * as analyticsApi from '../services/api/analyticsApi';

interface WeeklyProductData {
  week: number;
  productsSold: number;
}

interface UseProductsTrendReturn {
  data: WeeklyProductData[];
  loading: boolean;
  error: string | null;
}

export function useProductsTrend(storeId: string): UseProductsTrendReturn {
  const { data, isLoading, error } = useQuery({
    queryKey: ['productsTrend', storeId],
    queryFn: async () => {
      if (!storeId) return [];
      return analyticsApi.getProductsTrend(storeId);
    },
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000,
  });

  return {
    data: data || [],
    loading: isLoading,
    error: error ? (error as Error).message : null,
  };
}
