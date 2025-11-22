// Centralized query keys for TanStack Query
// Ensures consistent cache invalidation and prevents key conflicts

export const queryKeys = {
  // Store queries
  stores: {
    all: ['stores'] as const,
    lists: () => [...queryKeys.stores.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.stores.lists(), { filters }] as const,
    details: () => [...queryKeys.stores.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.stores.details(), id] as const,
    stats: (id: string) => [...queryKeys.stores.all, 'stats', id] as const,
    byOwner: (ownerId: string) => [...queryKeys.stores.all, 'owner', ownerId] as const,
  },

  // Product queries
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.products.lists(), { filters }] as const,
    byStore: (storeId: string) => [...queryKeys.products.all, 'store', storeId] as const,
    detail: (id: string) => [...queryKeys.products.all, 'detail', id] as const,
  },

  // Order queries
  orders: {
    all: ['orders'] as const,
    lists: () => [...queryKeys.orders.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.orders.lists(), { filters }] as const,
    byStore: (storeId: string) => [...queryKeys.orders.all, 'store', storeId] as const,
    byUser: (userId: string) => [...queryKeys.orders.all, 'user', userId] as const,
    detail: (id: string) => [...queryKeys.orders.all, 'detail', id] as const,
    tracking: (orderId: string, userEmail: string) =>
      [...queryKeys.orders.all, 'tracking', orderId, userEmail] as const,
  },

  // User/Profile queries
  user: {
    all: ['user'] as const,
    profile: (userId: string) => [...queryKeys.user.all, 'profile', userId] as const,
  },

  // Review queries
  reviews: {
    all: ['reviews'] as const,
    byStore: (storeId: string) => [...queryKeys.reviews.all, 'store', storeId] as const,
  },
} as const;
