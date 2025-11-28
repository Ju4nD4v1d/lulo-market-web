/**
 * TanStack Query hook for fetching all active products
 * Used by homepage product display and search functionality
 * Provides caching to prevent duplicate fetches across components
 */

import { useQuery } from '@tanstack/react-query';
import * as productApi from '../../services/api/productApi';
import { Product } from '../../types/product';

interface UseAllActiveProductsQueryReturn {
  products: Product[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * Fetches all active products with caching
 *
 * Features:
 * - 5-minute stale time to reduce unnecessary refetches
 * - 30-minute garbage collection time
 * - Shared cache key for deduplication across components
 */
export function useAllActiveProductsQuery(): UseAllActiveProductsQueryReturn {
  const { data, isLoading, error } = useQuery({
    queryKey: ['allActiveProducts'],
    queryFn: productApi.getAllActiveProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  return {
    products: data ?? [],
    isLoading,
    error: error as Error | null,
  };
}
