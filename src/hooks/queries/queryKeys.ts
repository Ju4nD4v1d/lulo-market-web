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
    byIdentifier: (identifier: string) => [...queryKeys.stores.all, 'identifier', identifier] as const,
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
    orderCount: (userId: string) => [...queryKeys.user.all, 'orderCount', userId] as const,
  },

  // Review queries
  reviews: {
    all: ['reviews'] as const,
    byStore: (storeId: string) => [...queryKeys.reviews.all, 'store', storeId] as const,
  },

  // Checkout queries
  checkout: {
    all: ['checkout'] as const,
    storeReceipt: (storeId: string) => [...queryKeys.checkout.all, 'receipt', storeId] as const,
    stripeAccount: (storeId: string) => [...queryKeys.checkout.all, 'stripe', storeId] as const,
    orderMonitoring: (orderId: string) => [...queryKeys.checkout.all, 'monitoring', orderId] as const,
  },

  // Driver queries (platform-level)
  drivers: {
    all: ['drivers'] as const,
    lists: () => [...queryKeys.drivers.all, 'list'] as const,
    active: () => [...queryKeys.drivers.all, 'active'] as const,
    detail: (id: string) => [...queryKeys.drivers.all, 'detail', id] as const,
  },

  // Legal agreements queries
  legalAgreements: {
    all: ['legalAgreements'] as const,
    latest: (type: string) => [...queryKeys.legalAgreements.all, 'latest', type] as const,
    byId: (id: string) => [...queryKeys.legalAgreements.all, 'detail', id] as const,
    allLatest: () => [...queryKeys.legalAgreements.all, 'allLatest'] as const,
    versions: (type: string) => [...queryKeys.legalAgreements.all, 'versions', type] as const,
  },

  // Stripe queries
  stripe: {
    all: ['stripe'] as const,
    balance: (storeId: string) => [...queryKeys.stripe.all, 'balance', storeId] as const,
  },
} as const;
