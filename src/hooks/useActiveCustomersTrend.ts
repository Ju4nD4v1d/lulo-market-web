/**
 * TanStack Query hook for fetching active customers trend data
 * Uses analyticsApi for data fetching
 */

import { useQuery } from '@tanstack/react-query';
import * as analyticsApi from '../services/api/analyticsApi';

interface UseActiveCustomersTrendReturn {
  current: number;
  previous: number | null;
  loading: boolean;
  error: string | null;
}

export function useActiveCustomersTrend(storeId: string): UseActiveCustomersTrendReturn {
  const { data, isLoading, error } = useQuery({
    queryKey: ['activeCustomersTrend', storeId],
    queryFn: async () => {
      if (!storeId) return { current: 0, previous: null };
      return analyticsApi.getActiveCustomersTrend(storeId);
    },
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000,
  });

  return {
    current: data?.current ?? 0,
    previous: data?.previous ?? null,
    loading: isLoading,
    error: error ? (error as Error).message : null,
  };
}
