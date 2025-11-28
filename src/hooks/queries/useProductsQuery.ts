/**
 * TanStack Query hook for fetching products
 * Uses productApi for data fetching
 */

import { useQuery } from '@tanstack/react-query';
import { Product } from '../../types';
import { queryKeys } from './queryKeys';
import * as productApi from '../../services/api/productApi';

interface UseProductsQueryOptions {
  storeId: string | null;
  enabled?: boolean;
}

interface ProductsQueryResult {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useProductsQuery = ({
  storeId,
  enabled = true
}: UseProductsQueryOptions): ProductsQueryResult => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.products.byStore(storeId || ''),
    queryFn: async () => {
      if (!storeId) {
        throw new Error('Store ID is required');
      }
      return productApi.getProductsByStoreId(storeId);
    },
    enabled: enabled && !!storeId,
    staleTime: 5 * 60 * 1000, // 5 minutes - products don't change as often
    gcTime: 30 * 60 * 1000, // 30 minutes cache
    refetchOnWindowFocus: false,
    retry: 1,
  });

  return {
    products: data || [],
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
  };
};
