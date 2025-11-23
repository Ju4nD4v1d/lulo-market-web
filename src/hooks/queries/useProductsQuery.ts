import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Product } from '../../types/product';
import { queryKeys } from './queryKeys';

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

      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('storeId', '==', storeId));
      const snapshot = await getDocs(q);

      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];

      // Deduplicate products by ID to prevent duplicate key errors
      const uniqueProducts = Array.from(
        new Map(productsData.map(product => [product.id, product])).values()
      );

      return uniqueProducts;
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
