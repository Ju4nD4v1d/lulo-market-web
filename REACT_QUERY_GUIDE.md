# React Query Integration Guide

This project uses **TanStack Query (React Query)** for data fetching and caching with Firebase.

## Why React Query?

### Benefits
- ✅ **80% Reduction in Firestore Reads** - Caching prevents unnecessary database calls
- ✅ **Faster Page Transitions** - Data loads instantly from cache
- ✅ **Automatic Background Updates** - Keeps data fresh without manual refetching
- ✅ **Better Error Handling** - Built-in retry logic and error states
- ✅ **Optimistic Updates** - UI updates immediately, syncs in background
- ✅ **Request Deduplication** - Multiple components can request same data without duplicate calls

### Cost Savings Example
**Without Cache:**
- User browses 20 pages in 10 minutes
- Each page fetches stores: 20 Firestore reads
- 1000 users/day: 20,000 reads/day = **$0.12/day**

**With React Query Cache:**
- Same user journey
- Actual reads: 4 (initial + background refreshes)
- 1000 users/day: 4,000 reads/day = **$0.024/day**
- **Savings: 80% fewer Firestore reads**

---

## Configuration

### QueryClient Setup (src/App.tsx)

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // Fresh for 5 minutes
      gcTime: 30 * 60 * 1000,        // Keep cached for 30 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,   // Don't refetch on tab focus
      retry: 1,                      // Retry failed requests once
    },
  },
});
```

### What This Means:
- **staleTime (5 min)**: Data is considered fresh. No refetch happens if within 5 minutes
- **gcTime (30 min)**: Unused data stays in memory. Garbage collected after 30 minutes (formerly cacheTime)
- **refetchOnWindowFocus**: Disabled to prevent unnecessary fetches when user returns to tab
- **retry**: Automatically retries failed requests once

---

## Using React Query with Firebase

### Example: Fetching Stores

**Before (Manual State):**
```typescript
const [stores, setStores] = useState<StoreData[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string>('');

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'stores'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStores(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
```

**After (React Query):**
```typescript
import { useQuery } from '@tanstack/react-query';
import { getDocs, collection } from 'firebase/firestore';

const { data: stores, isLoading, error } = useQuery({
  queryKey: ['stores'],
  queryFn: async () => {
    const snapshot = await getDocs(collection(db, 'stores'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  staleTime: 5 * 60 * 1000,
});
```

**Advantages:**
- Automatic caching across component unmounts
- Loading and error states handled automatically
- Refetch logic built-in
- Less boilerplate code

---

## Query Key Pattern

### Why Query Keys Matter
Query keys uniquely identify cached data. Use a consistent pattern for better cache management.

### Recommended Pattern (src/hooks/useStoreData.ts)

```typescript
export const storeKeys = {
  all: ['stores'] as const,
  lists: () => [...storeKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...storeKeys.lists(), { filters }] as const,
  details: () => [...storeKeys.all, 'detail'] as const,
  detail: (id: string) => [...storeKeys.details(), id] as const,
};

// Usage:
useQuery({ queryKey: storeKeys.lists(), ... });           // ['stores', 'list']
useQuery({ queryKey: storeKeys.detail('store-123'), ... }); // ['stores', 'detail', 'store-123']
```

### Benefits:
- Type-safe query keys
- Easy to invalidate related queries
- Centralized key management

---

## Cache Invalidation

### When to Invalidate Cache

Invalidate cache when data changes to ensure users see fresh data.

**Example: After creating a new store**

```typescript
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

// After successful mutation
await createStore(newStore);

// Invalidate stores list to refetch
queryClient.invalidateQueries({ queryKey: storeKeys.lists() });
```

### Common Invalidation Patterns

```typescript
// Invalidate ALL store queries
queryClient.invalidateQueries({ queryKey: storeKeys.all });

// Invalidate specific store detail
queryClient.invalidateQueries({ queryKey: storeKeys.detail('store-123') });

// Invalidate with refetch
queryClient.invalidateQueries({
  queryKey: storeKeys.lists(),
  refetchType: 'active' // Only refetch currently mounted queries
});
```

---

## Optimistic Updates

Update UI immediately, sync with server in background.

### Example: Update Store

```typescript
const updateStore = useMutation({
  mutationFn: (updatedStore: StoreData) => {
    return updateDoc(doc(db, 'stores', updatedStore.id), updatedStore);
  },

  // Optimistic update
  onMutate: async (updatedStore) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: storeKeys.detail(updatedStore.id) });

    // Snapshot previous value
    const previousStore = queryClient.getQueryData(storeKeys.detail(updatedStore.id));

    // Optimistically update cache
    queryClient.setQueryData(storeKeys.detail(updatedStore.id), updatedStore);

    // Return context for rollback
    return { previousStore };
  },

  // Rollback on error
  onError: (err, updatedStore, context) => {
    queryClient.setQueryData(
      storeKeys.detail(updatedStore.id),
      context?.previousStore
    );
  },

  // Refetch on success
  onSettled: (updatedStore) => {
    queryClient.invalidateQueries({ queryKey: storeKeys.detail(updatedStore.id) });
  },
});
```

---

## Real-Time Updates with Firebase

### Option 1: Polling (Simple)

```typescript
const { data: stores } = useQuery({
  queryKey: storeKeys.lists(),
  queryFn: fetchStores,
  refetchInterval: 60 * 1000, // Refetch every minute
});
```

### Option 2: onSnapshot Integration (Real-time)

```typescript
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { onSnapshot, collection } from 'firebase/firestore';

const useStoresRealtime = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'stores'),
      (snapshot) => {
        const stores = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Update React Query cache
        queryClient.setQueryData(storeKeys.lists(), stores);
      }
    );

    return () => unsubscribe();
  }, [queryClient]);

  // Use cached data
  return useQuery({
    queryKey: storeKeys.lists(),
    queryFn: fetchStores,
    staleTime: Infinity, // Real-time updates handle freshness
  });
};
```

---

## DevTools

React Query DevTools are available in development mode.

### Access DevTools
- **Automatically appears** as floating icon in bottom-left corner
- **Toggle open/close** by clicking icon
- **View all queries** - See what's cached, stale, or loading
- **Inspect query data** - View actual data in cache
- **Force refetch** - Manually trigger refetches
- **Clear cache** - Remove all cached data

### How to Use
```typescript
// Already configured in App.tsx
{process.env.NODE_ENV === 'development' && (
  <ReactQueryDevtools initialIsOpen={false} />
)}
```

---

## Performance Monitoring

### Check Cache Effectiveness

```typescript
// Log cache status
const { data, dataUpdatedAt, isStale } = useQuery({
  queryKey: storeKeys.lists(),
  queryFn: fetchStores,
  onSuccess: () => {
    console.log('✅ Data fetched from Firebase');
  },
});

console.log({
  lastUpdated: new Date(dataUpdatedAt),
  isStale,
  isFromCache: !isStale,
});
```

### Expected Console Output

**First visit:**
```
✅ Data fetched from Firebase
{ lastUpdated: '2024-01-01T10:00:00', isStale: false, isFromCache: false }
```

**Navigate away and back within 5 min:**
```
{ lastUpdated: '2024-01-01T10:00:00', isStale: false, isFromCache: true }
```
_(No Firebase fetch!)_

**After 5 minutes:**
```
✅ Data fetched from Firebase (background)
{ lastUpdated: '2024-01-01T10:05:00', isStale: false, isFromCache: false }
```

---

## Best Practices

### 1. Use Query Keys Consistently
```typescript
// ✅ GOOD: Use query key factory
queryKey: storeKeys.detail(storeId)

// ❌ BAD: Hardcoded strings
queryKey: ['store', storeId]
```

### 2. Set Appropriate Stale Times
```typescript
// Static data (rarely changes)
staleTime: 30 * 60 * 1000  // 30 minutes

// Dynamic data (changes frequently)
staleTime: 1 * 60 * 1000   // 1 minute

// Real-time data (use onSnapshot)
staleTime: Infinity
```

### 3. Handle Loading States
```typescript
const { data, isLoading, isError, error } = useQuery(...);

if (isLoading) return <LoadingSpinner />;
if (isError) return <Error message={error.message} />;
return <DataDisplay data={data} />;
```

### 4. Prefetch on Hover
```typescript
const queryClient = useQueryClient();

const handleMouseEnter = (storeId: string) => {
  queryClient.prefetchQuery({
    queryKey: storeKeys.detail(storeId),
    queryFn: () => fetchStoreDetail(storeId),
  });
};
```

### 5. Background Refetch Pattern
```typescript
// User sees cached data immediately
// Fresh data loads in background
const { data } = useQuery({
  queryKey: storeKeys.lists(),
  queryFn: fetchStores,
  staleTime: 5 * 60 * 1000,
  refetchOnMount: false,    // Don't block render
  initialData: [],          // Show something while loading
});
```

---

## Migration Checklist

When converting existing hooks to React Query:

- [ ] Install `@tanstack/react-query`
- [ ] Wrap App with `QueryClientProvider`
- [ ] Create query key factory
- [ ] Replace `useState` + `useEffect` with `useQuery`
- [ ] Handle loading/error states
- [ ] Add cache invalidation on mutations
- [ ] Test cache behavior with DevTools
- [ ] Monitor Firestore read count reduction

---

## Troubleshooting

### Cache Not Working
**Issue:** Data refetches on every mount
**Solution:** Check `staleTime` is set and not 0

### Stale Data Displayed
**Issue:** Updates not reflected
**Solution:** Invalidate cache after mutations

### Memory Leaks
**Issue:** Cache grows too large
**Solution:** Reduce `gcTime` (formerly `cacheTime`) or use `refetchOnMount: false`

### Slow Initial Load
**Issue:** First fetch takes long
**Solution:** Use `initialData` or skeleton loaders

---

## Resources

- [TanStack Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [Firebase + React Query Guide](https://tanstack.com/query/latest/docs/react/guides/window-focus-refetching)
- [DevTools Documentation](https://tanstack.com/query/latest/docs/react/devtools)

---

**Last Updated:** Phase 3.1 - TanStack Query Integration
**Author:** Claude Code Refactoring Team
