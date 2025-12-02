import { QueryClient } from '@tanstack/react-query';

/**
 * Global QueryClient instance for TanStack Query
 *
 * For query keys, import from: src/hooks/queries/queryKeys.ts
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // Data is fresh for 30 seconds
      gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
      refetchOnWindowFocus: true, // Refetch when window regains focus
      retry: 1, // Retry failed requests once
    },
  },
});
