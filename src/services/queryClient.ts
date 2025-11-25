import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
      gcTime: 30 * 60 * 1000, // Keep unused data in cache for 30 minutes (formerly cacheTime)
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      retry: 1, // Retry failed requests once
    },
  },
});

/**
 * Query key factories for consistent cache management
 * Use these to generate query keys throughout the app
 */
export const queryKeys = {
  // Store-related queries
  stores: {
    all: ['stores'] as const,
    lists: () => [...queryKeys.stores.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.stores.lists(), { filters }] as const,
    details: () => [...queryKeys.stores.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.stores.details(), id] as const,
  },

  // Order-related queries
  orders: {
    all: ['orders'] as const,
    lists: () => [...queryKeys.orders.all, 'list'] as const,
    list: (userId?: string) => [...queryKeys.orders.lists(), { userId }] as const,
    details: () => [...queryKeys.orders.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.orders.details(), id] as const,
  },

  // Product-related queries
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (storeId: string) => [...queryKeys.products.lists(), { storeId }] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,
  },

  // Review-related queries
  reviews: {
    all: ['reviews'] as const,
    lists: () => [...queryKeys.reviews.all, 'list'] as const,
    list: (storeId: string) => [...queryKeys.reviews.lists(), { storeId }] as const,
  },

  // User-related queries
  users: {
    all: ['users'] as const,
    profile: (uid: string) => [...queryKeys.users.all, 'profile', uid] as const,
  },

  // Search-related queries
  search: {
    all: ['search'] as const,
    stores: (query: string, filters?: Record<string, unknown>) =>
      [...queryKeys.search.all, 'stores', query, filters] as const,
  },
};
