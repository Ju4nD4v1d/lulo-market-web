/**
 * TanStack Query hook for fetching revenue trend data
 * Uses analyticsApi for data fetching
 */

import { useQuery } from '@tanstack/react-query';
import * as analyticsApi from '../services/api/analyticsApi';

interface RevenueTrendData {
  label: string;
  value: number;
}

interface UseRevenueTrendReturn {
  data: RevenueTrendData[];
  loading: boolean;
  error: string | null;
}

export function useRevenueTrend(
  storeId: string,
  granularity: 'week' | 'month'
): UseRevenueTrendReturn {
  const { data, isLoading, error } = useQuery({
    queryKey: ['revenueTrend', storeId, granularity],
    queryFn: async () => {
      if (!storeId) return [];

      if (granularity === 'week') {
        return analyticsApi.getWeeklyRevenueTrend(storeId);
      } else {
        return analyticsApi.getMonthlyRevenueTrend(storeId);
      }
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
