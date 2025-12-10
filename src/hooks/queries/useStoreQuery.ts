import { useQuery } from '@tanstack/react-query';
import { StoreData } from '../../types';
import { queryKeys } from './queryKeys';
import * as storeApi from '../../services/api/storeApi';

/**
 * Return type for useStoreQuery hook
 */
interface UseStoreQueryReturn {
  store: StoreData | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Fetch a single store by ID using TanStack Query
 *
 * Use this hook when you need store details in components like:
 * - Cart page (for store schedule, delivery options)
 * - Checkout (for store business hours, payment info)
 * - Order tracking (for store contact info)
 *
 * Benefits:
 * - Automatic caching and deduplication
 * - Background refetching when stale
 * - Consistent with existing query patterns
 *
 * @param storeId - The ID of the store to fetch
 * @returns Store data and query state
 */
export const useStoreQuery = (storeId: string | null): UseStoreQueryReturn => {
  const {
    data: store = null,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.stores.detail(storeId || ''),
    queryFn: () => storeApi.getStoreById(storeId!),
    enabled: !!storeId, // Only fetch if storeId is provided
    staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });

  return {
    store,
    isLoading,
    isError,
    error: error instanceof Error ? error : null,
    refetch,
  };
};

/**
 * Fetch a single store by identifier (slug or ID) using TanStack Query
 *
 * This hook supports both slug-based URLs (e.g., /store/lujabites) and
 * legacy ID-based URLs (e.g., /store/abc123) for backward compatibility.
 *
 * Use this hook when:
 * - Reading store identifier from URL params
 * - You need to support both slug and ID lookups
 *
 * @param identifier - The slug or ID of the store to fetch
 * @returns Store data and query state
 */
export const useStoreByIdentifierQuery = (identifier: string | null): UseStoreQueryReturn => {
  const {
    data: store = null,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.stores.byIdentifier(identifier || ''),
    queryFn: () => storeApi.getStoreByIdentifier(identifier!),
    enabled: !!identifier,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  return {
    store,
    isLoading,
    isError,
    error: error instanceof Error ? error : null,
    refetch,
  };
};
