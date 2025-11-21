# Services Layer Architecture

This folder contains all backend interaction logic, keeping API calls and data fetching separate from UI components.

## 📁 File Structure

```
src/services/
├── api.ts              # Centralized Firebase operations
├── queryClient.ts      # React Query configuration & cache keys
├── DataProvider.tsx    # Legacy compatibility layer (being phased out)
├── invitationService.ts # Device invitation management
└── waitlistService.ts  # Waitlist management
```

## 🎯 Core Principles

1. **Separation of Concerns**: All backend logic lives here, not in components
2. **Type Safety**: All functions are properly typed
3. **Reusability**: Import functions anywhere you need them
4. **Consistency**: Centralized error handling and response formatting
5. **Scalability**: Easy to add new endpoints or switch backends

## 📚 Main Services

### `api.ts` - Firebase Operations

Centralized Firebase Firestore operations. Use these functions instead of importing Firebase directly in components.

#### Store Operations
```typescript
import * as api from '@/services/api';

// Get all stores
const stores = await api.getAllStores();

// Get single store
const store = await api.getStoreById('store-123');

// Create store
const storeId = await api.createStore({
  name: 'My Store',
  description: 'Best food in town',
  // ...
});

// Update store
await api.updateStore('store-123', { name: 'Updated Name' });

// Delete store
await api.deleteStore('store-123');
```

#### Product Operations
```typescript
// Get products for a store
const products = await api.getProductsByStoreId('store-123');

// Create product
const productId = await api.createProduct({
  storeId: 'store-123',
  name: 'Empanada',
  price: 3.99,
  // ...
});

// Update/delete product
await api.updateProduct('product-456', { price: 4.99 });
await api.deleteProduct('product-456');
```

#### Order Operations
```typescript
// Get orders with filters
const userOrders = await api.getOrders({ userId: 'user-123' });
const storeOrders = await api.getOrders({ storeId: 'store-123', limitCount: 10 });
const allOrders = await api.getOrders({ limitCount: 50 });

// Create order
const orderId = await api.createOrder({
  userId: 'user-123',
  storeId: 'store-123',
  items: [...],
  total: 45.99,
  // ...
});

// Update order status
await api.updateOrderStatus('order-789', 'delivered');
```

#### Review Operations
```typescript
// Get reviews for a store
const reviews = await api.getReviewsByStoreId('store-123');

// Create review
const reviewId = await api.createReview({
  storeId: 'store-123',
  userId: 'user-123',
  rating: 5,
  comment: 'Amazing food!',
});
```

#### User Operations
```typescript
// Get user profile
const profile = await api.getUserProfile('user-123');

// Set user profile (create or update)
await api.setUserProfile('user-123', {
  displayName: 'John Doe',
  email: 'john@example.com',
  // ...
});

// Update user profile
await api.updateUserProfile('user-123', { displayName: 'Jane Doe' });
```

### `queryClient.ts` - React Query Configuration

Centralized React Query client and cache key management.

#### Using the Query Client
```typescript
import { queryClient } from '@/services/queryClient';

// Invalidate cache
queryClient.invalidateQueries({ queryKey: queryKeys.stores.all });

// Prefetch data
await queryClient.prefetchQuery({
  queryKey: queryKeys.stores.detail('store-123'),
  queryFn: () => api.getStoreById('store-123'),
});

// Set cache data manually
queryClient.setQueryData(queryKeys.stores.lists(), stores);
```

#### Query Keys
Use standardized query keys for consistent caching:

```typescript
import { queryKeys } from '@/services/queryClient';

// Store keys
queryKeys.stores.all           // ['stores']
queryKeys.stores.lists()       // ['stores', 'list']
queryKeys.stores.detail('123') // ['stores', 'detail', '123']

// Order keys
queryKeys.orders.list('user-123') // ['orders', 'list', { userId: 'user-123' }]

// Product keys
queryKeys.products.list('store-123') // ['products', 'list', { storeId: 'store-123' }]

// Search keys
queryKeys.search.stores('tacos', { city: 'Toronto' })
```

### `DataProvider.tsx` - Legacy Compatibility

**⚠️ Deprecated**: This provider exists for backward compatibility with existing code. New code should import functions directly from `api.ts`.

The DataProvider wraps API functions in a Firestore-like response format for components that haven't been migrated yet.

#### Migration Path
```typescript
// ❌ Old way (via DataProvider)
const { getStores } = useDataProvider();
const response = await getStores();
const stores = response.docs.map(doc => doc.data());

// ✅ New way (direct API import)
import * as api from '@/services/api';
const stores = await api.getAllStores();
```

## 🔄 React Query Integration

Most data fetching should use React Query for automatic caching, refetching, and state management.

### Example: Custom Hook with React Query
```typescript
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/services/queryClient';
import * as api from '@/services/api';

export function useStore(storeId: string) {
  return useQuery({
    queryKey: queryKeys.stores.detail(storeId),
    queryFn: () => api.getStoreById(storeId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!storeId, // Only run if storeId exists
  });
}

// Usage in component
function StoreDetail({ storeId }) {
  const { data: store, isLoading, error } = useStore(storeId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{store.name}</div>;
}
```

### Example: Mutation with React Query
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/services/queryClient';
import * as api from '@/services/api';

export function useCreateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createStore,
    onSuccess: () => {
      // Invalidate stores cache to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.stores.all });
    },
  });
}

// Usage in component
function CreateStoreForm() {
  const createStore = useCreateStore();

  const handleSubmit = async (formData) => {
    await createStore.mutateAsync(formData);
    // Store created and cache invalidated automatically!
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

## 🚀 Best Practices

### 1. Always Use the API Service
```typescript
// ✅ Good
import * as api from '@/services/api';
const stores = await api.getAllStores();

// ❌ Bad - Don't import Firebase directly in components
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
const snapshot = await getDocs(collection(db, 'stores'));
```

### 2. Use React Query for Data Fetching
```typescript
// ✅ Good - Automatic caching, loading states, error handling
const { data, isLoading, error } = useQuery({
  queryKey: queryKeys.stores.lists(),
  queryFn: api.getAllStores,
});

// ❌ Bad - Manual state management
const [stores, setStores] = useState([]);
const [loading, setLoading] = useState(true);
useEffect(() => {
  api.getAllStores().then(setStores).finally(() => setLoading(false));
}, []);
```

### 3. Use Standardized Query Keys
```typescript
// ✅ Good
import { queryKeys } from '@/services/queryClient';
const { data } = useQuery({
  queryKey: queryKeys.stores.detail(storeId),
  queryFn: () => api.getStoreById(storeId),
});

// ❌ Bad - Inconsistent keys make cache invalidation harder
const { data } = useQuery({
  queryKey: ['store', storeId],
  queryFn: () => api.getStoreById(storeId),
});
```

### 4. Handle Errors at Component Level
```typescript
const { data, error } = useQuery({
  queryKey: queryKeys.stores.lists(),
  queryFn: api.getAllStores,
});

if (error) {
  return <ErrorMessage error={error} />;
}
```

### 5. Invalidate Cache After Mutations
```typescript
const createStore = useMutation({
  mutationFn: api.createStore,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.stores.all });
  },
});
```

## 📖 Adding New API Functions

When adding new backend operations:

1. **Add function to `api.ts`**:
```typescript
export async function getStoreAnalytics(storeId: string) {
  const analyticsRef = doc(db, COLLECTIONS.ANALYTICS, storeId);
  const snapshot = await getDoc(analyticsRef);
  return snapshot.data();
}
```

2. **Add query keys to `queryClient.ts`** (if needed):
```typescript
export const queryKeys = {
  // ... existing keys
  analytics: {
    all: ['analytics'] as const,
    store: (storeId: string) => [...queryKeys.analytics.all, storeId] as const,
  },
};
```

3. **Create custom hook** (optional):
```typescript
// src/hooks/useStoreAnalytics.ts
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/services/queryClient';
import * as api from '@/services/api';

export function useStoreAnalytics(storeId: string) {
  return useQuery({
    queryKey: queryKeys.analytics.store(storeId),
    queryFn: () => api.getStoreAnalytics(storeId),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
```

## 🔒 Security Considerations

1. **Validate user permissions** before database operations
2. **Sanitize user input** before storing in database
3. **Use Firestore Security Rules** for server-side protection
4. **Never expose sensitive data** in API responses
5. **Implement rate limiting** for expensive operations

## 📝 Migration Checklist

Migrating a component from DataProvider to direct API imports:

- [ ] Find all `useDataProvider()` calls
- [ ] Replace with direct `import * as api from '@/services/api'`
- [ ] Replace Firestore response format with direct data
- [ ] Consider adding React Query for caching
- [ ] Update error handling if needed
- [ ] Test thoroughly

## 🤝 Contributing

When adding new services:
1. Follow the existing patterns
2. Add proper TypeScript types
3. Document your functions with JSDoc
4. Add examples to this README
5. Consider React Query integration
