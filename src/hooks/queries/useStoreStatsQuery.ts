import { useQueries } from '@tanstack/react-query';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { queryKeys } from './queryKeys';

interface StoreStats {
  totalProducts: number;
  totalOrders: number;
  loading: boolean;
}

export const useStoreStatsQuery = (storeId: string | null): StoreStats => {
  const results = useQueries({
    queries: [
      // Products count query
      {
        queryKey: [...queryKeys.products.byStore(storeId || ''), 'count'],
        queryFn: async () => {
          if (!storeId) return 0;

          const productsRef = collection(db, 'products');
          const q = query(productsRef, where('storeId', '==', storeId));
          const snapshot = await getDocs(q);

          return snapshot.size;
        },
        enabled: !!storeId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000,
      },
      // Orders count query
      {
        queryKey: [...queryKeys.orders.byStore(storeId || ''), 'count'],
        queryFn: async () => {
          if (!storeId) return 0;

          const ordersRef = collection(db, 'orders');
          const q = query(ordersRef, where('storeId', '==', storeId));
          const snapshot = await getDocs(q);

          return snapshot.size;
        },
        enabled: !!storeId,
        staleTime: 2 * 60 * 1000, // 2 minutes - orders change more frequently
        gcTime: 10 * 60 * 1000,
      },
    ],
  });

  const [productsQuery, ordersQuery] = results;

  return {
    totalProducts: productsQuery.data || 0,
    totalOrders: ordersQuery.data || 0,
    loading: productsQuery.isLoading || ordersQuery.isLoading,
  };
};
