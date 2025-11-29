import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import * as productApi from '../../services/api/productApi';
import * as storeApi from '../../services/api/storeApi';
import { Product } from '../../types';
import { StoreData } from '../../types';

interface UseProductDetailsQueryOptions {
  productId: string;
  storeId: string;
}

interface ProductDetailsData {
  product: Product;
  store: StoreData | null;
}

interface ProductDetailsQueryResult {
  product: Product | null;
  store: StoreData | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Custom hook for fetching product details and associated store data
 * using TanStack Query for caching and state management.
 *
 * Benefits:
 * - Automatic caching (reduces Firestore reads)
 * - Background refetching when data becomes stale
 * - Automatic retry on failures
 * - Request deduplication
 * - Proper loading and error states
 */
export const useProductDetailsQuery = ({
  productId,
  storeId,
}: UseProductDetailsQueryOptions): ProductDetailsQueryResult => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [...queryKeys.products.detail(productId), storeId],
    queryFn: async (): Promise<ProductDetailsData> => {
      // Fetch product
      const product = await productApi.getProductById(productId);

      // Fetch store (don't fail if store not found)
      let store: StoreData | null = null;
      try {
        store = await storeApi.getStoreById(storeId);
      } catch (storeError) {
        console.warn('Could not fetch store:', storeError);
      }

      return { product, store };
    },
    enabled: !!productId && !!storeId,
    staleTime: 5 * 60 * 1000, // 5 minutes - product details don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes cache
    refetchOnWindowFocus: false,
    retry: 1,
  });

  return {
    product: data?.product ?? null,
    store: data?.store ?? null,
    isLoading,
    isError,
    error: error ? (error as Error).message : null,
    refetch,
  };
};
