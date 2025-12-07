/**
 * Hook to fetch user's total paid order count
 * Used for determining delivery fee discount eligibility
 */

import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { queryKeys } from './queries/queryKeys';

interface UseUserOrderCountResult {
  totalOrders: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Fetches the user's total paid order count from Firestore
 * @param userId - The Firebase Auth user ID (null if not logged in)
 * @returns Object containing totalOrders count and loading/error states
 */
export const useUserOrderCount = (userId: string | null): UseUserOrderCountResult => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.user.orderCount(userId || ''),
    queryFn: async () => {
      if (!userId) {
        return { totalOrders: 0 };
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        const userData = userDoc.data();
        return {
          totalOrders: userData?.totalOrders ?? 0,
        };
      } catch (err) {
        console.error('Error fetching user order count:', err);
        return { totalOrders: 0 };
      }
    },
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute - shorter to ensure discount eligibility is accurate
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: true, // Refresh when user returns to tab for accurate discount display
    retry: 2,
  });

  return {
    totalOrders: data?.totalOrders ?? 0,
    isLoading,
    error: error as Error | null,
    refetch,
  };
};
