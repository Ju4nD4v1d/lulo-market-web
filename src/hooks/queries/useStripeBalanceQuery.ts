import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import {
  getConnectedAccountBalance,
  StripeBalanceData,
} from '../../services/api/stripeConnectApi';

/**
 * Options for the useStripeBalanceQuery hook
 */
interface UseStripeBalanceQueryOptions {
  storeId: string | null;
  stripeAccountId: string | null | undefined;
}

/**
 * Return type for useStripeBalanceQuery hook
 */
interface UseStripeBalanceQueryReturn {
  balance: StripeBalanceData | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Fetch Stripe balance for a connected account using TanStack Query
 *
 * Use this hook to display balance information in the Analytics section:
 * - Available balance (funds ready to withdraw)
 * - Pending balance (scheduled for payout)
 * - In-transit balance (being transferred to bank)
 *
 * Safety features:
 * - Only fetches when both storeId AND stripeAccountId are available
 * - Prevents race conditions by using enabled flag pattern
 * - Short stale time (2 min) since balance changes frequently
 * - No refetch on window focus to prevent excessive API calls
 *
 * @param options - storeId and stripeAccountId for the connected account
 * @returns Balance data and query state
 */
export const useStripeBalanceQuery = ({
  storeId,
  stripeAccountId,
}: UseStripeBalanceQueryOptions): UseStripeBalanceQueryReturn => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.stripe.balance(storeId || ''),
    queryFn: async () => {
      if (!storeId) throw new Error('storeId required');
      const response = await getConnectedAccountBalance({ storeId });
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch balance');
      }
      return response.data;
    },
    // CRITICAL: Only fetch when both IDs are available
    // This prevents unnecessary API calls and race conditions
    enabled: !!storeId && !!stripeAccountId,
    staleTime: 2 * 60 * 1000,    // 2 minutes (balance changes frequently)
    gcTime: 10 * 60 * 1000,      // 10 minutes cache
    retry: 2,
    refetchOnWindowFocus: false, // Prevent excessive API calls
  });

  return {
    balance: data ?? null,
    isLoading,
    isError,
    error: error instanceof Error ? error : null,
    refetch,
  };
};
