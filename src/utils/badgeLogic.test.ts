// Test file for badge logic validation
import { StoreData } from '../types/store';

// Helper function to check if a store is new (copied from Home component)
const isStoreNew = (createdAt?: Date): boolean => {
  if (!createdAt) return false;
  const now = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(now.getMonth() - 1);
  return createdAt > oneMonthAgo;
};

// Badge logic function (extracted from component logic)
const getBadgeType = (store: StoreData): 'new' | 'rating' | 'none' => {
  if (isStoreNew(store.createdAt)) {
    return 'new';
  } else if (store.averageRating) {
    return 'rating';
  } else {
    return 'none';
  }
};

// Test cases
const testCases: Array<{
  name: string;
  store: Partial<StoreData>;
  expectedBadge: 'new' | 'rating' | 'none';
  description: string;
}> = [
  {
    name: 'TEST CASE 1: Old store with rating',
    store: {
      id: 'test-1',
      name: 'Old Store with Rating',
      averageRating: 4.8,
      createdAt: new Date('2024-01-15') // More than a month ago
    },
    expectedBadge: 'rating',
    description: 'Should show rating badge (4.8)'
  },
  {
    name: 'TEST CASE 2: New store without rating',
    store: {
      id: 'test-2',
      name: 'New Store without Rating',
      createdAt: new Date() // Just created
    },
    expectedBadge: 'new',
    description: 'Should show "New" badge'
  },
  {
    name: 'TEST CASE 3: New store with rating',
    store: {
      id: 'test-3',
      name: 'New Store with Rating',
      averageRating: 4.9,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
    },
    expectedBadge: 'new',
    description: 'Should show "New" badge (priority over rating)'
  },
  {
    name: 'TEST CASE 4: Old store without rating',
    store: {
      id: 'test-4',
      name: 'Old Store without Rating',
      createdAt: new Date('2024-05-01') // More than a month ago
    },
    expectedBadge: 'none',
    description: 'Should show NO badge'
  },
  {
    name: 'TEST CASE 5: Store without createdAt',
    store: {
      id: 'test-5',
      name: 'Store without createdAt',
      averageRating: 4.5
    },
    expectedBadge: 'rating',
    description: 'Should show rating badge when no createdAt'
  },
  {
    name: 'TEST CASE 6: Store without createdAt and no rating',
    store: {
      id: 'test-6',
      name: 'Store without createdAt and no rating'
    },
    expectedBadge: 'none',
    description: 'Should show no badge when no createdAt and no rating'
  }
];

import { describe, it, expect } from 'vitest';

describe('Badge Logic Tests', () => {
  console.log('🧪 Running Badge Logic Tests');

  testCases.forEach(({ name, store, expectedBadge, description }) => {
    it(description, () => {
      const result = getBadgeType(store as StoreData);
      expect(result).toBe(expectedBadge);
    });
  });
});

export { getBadgeType, isStoreNew, testCases };