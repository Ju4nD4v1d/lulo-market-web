/**
 * Real-time query hook for fetching products with live updates
 * Uses Firestore onSnapshot for real-time synchronization
 *
 * This hook provides the same interface as useProductsQuery but with
 * real-time updates instead of polling. Use this for dashboard pages
 * where stock changes need to be reflected immediately.
 */

import { useState, useEffect, useCallback } from 'react';
import { Product } from '../../types';
import * as productApi from '../../services/api/productApi';

interface UseProductsRealtimeQueryOptions {
  storeId: string | null;
  enabled?: boolean;
}

interface ProductsRealtimeQueryResult {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  /** Refetch is a no-op for real-time queries (data is always fresh) */
  refetch: () => void;
}

/**
 * Real-time products query hook
 *
 * Provides live updates when product data changes in Firestore.
 * Automatically subscribes when mounted and unsubscribes when unmounted.
 *
 * @param options - Query options
 * @param options.storeId - The store ID to fetch products for
 * @param options.enabled - Whether the query is enabled (default: true)
 *
 * @example
 * ```typescript
 * const { products, isLoading, error } = useProductsRealtimeQuery({
 *   storeId: 'store123',
 *   enabled: true,
 * });
 * ```
 */
export const useProductsRealtimeQuery = ({
  storeId,
  enabled = true,
}: UseProductsRealtimeQueryOptions): ProductsRealtimeQueryResult => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refetch is a no-op for real-time queries since data is always current
  const refetch = useCallback(() => {
    // Real-time data is always fresh, no manual refetch needed
    console.log('Real-time query: data is always current, no refetch needed');
  }, []);

  useEffect(() => {
    // Don't subscribe if disabled or no storeId
    if (!enabled || !storeId) {
      setProducts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Track if this effect is still active (prevents stale updates on rapid storeId changes)
    let isActive = true;

    // Subscribe to real-time updates
    const unsubscribe = productApi.subscribeToProductsByStore(
      storeId,
      (updatedProducts) => {
        // Ignore updates if effect has been cleaned up (storeId changed)
        if (!isActive) return;
        setProducts(updatedProducts);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        // Ignore errors if effect has been cleaned up
        if (!isActive) return;
        console.error('Real-time products subscription error:', err);
        setError(err.message);
        setIsLoading(false);
      }
    );

    // Cleanup: mark as inactive and unsubscribe when component unmounts or storeId changes
    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [storeId, enabled]);

  return {
    products,
    isLoading,
    error,
    refetch,
  };
};
