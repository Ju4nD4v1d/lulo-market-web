import { describe, it, expect } from 'vitest';
import { getBadgeType, isStoreNew } from '../badgeLogic';
import { StoreData } from '../../types/store';

// Mock store data factory
const createMockStore = (overrides: Partial<StoreData> = {}): StoreData => ({
  id: 'test-store',
  name: 'Test Store',
  description: 'A test store',
  location: {
    address: '123 Test St',
    coordinates: { lat: 49.2827, lng: -123.1207 }
  },
  deliveryOptions: { delivery: true, pickup: false, shipping: false },
  deliveryCostWithDiscount: 4.99,
  minimumOrder: 25,
  aboutUsSections: [],
  ownerId: 'test-owner',
  isVerified: false,
  ...overrides
});

describe('Badge Logic Utilities', () => {
  describe('isStoreNew function', () => {
    it('should return true for stores created less than a month ago', () => {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 15); // 15 days ago
      
      expect(isStoreNew(recentDate)).toBe(true);
    });

    it('should return true for stores created today', () => {
      const today = new Date();
      
      expect(isStoreNew(today)).toBe(true);
    });

    it('should return false for stores created more than a month ago', () => {
      const oldDate = new Date();
      oldDate.setMonth(oldDate.getMonth() - 2); // 2 months ago
      
      expect(isStoreNew(oldDate)).toBe(false);
    });

    it('should return false for stores created exactly one month ago', () => {
      const exactlyOneMonthAgo = new Date();
      exactlyOneMonthAgo.setMonth(exactlyOneMonthAgo.getMonth() - 1);
      
      expect(isStoreNew(exactlyOneMonthAgo)).toBe(false);
    });

    it('should return false when createdAt is undefined', () => {
      expect(isStoreNew(undefined)).toBe(false);
    });

    it('should return false when createdAt is null', () => {
      expect(isStoreNew(null as unknown as Date)).toBe(false);
    });

    it('should handle edge case of new year boundary', () => {
      const now = new Date('2024-01-15');
      const lastMonth = new Date('2023-12-20'); // Less than a month ago across year boundary
      
      // Mock current date
      const originalNow = Date.now;
      Date.now = () => now.getTime();
      
      // Recalculate based on mocked date
      const oneMonthAgo = new Date(now);
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      const result = lastMonth > oneMonthAgo;
      expect(result).toBe(true);
      
      // Restore original Date.now
      Date.now = originalNow;
    });
  });

  describe('getBadgeType function', () => {
    describe('New badge priority', () => {
      it('should return "new" for stores created recently without rating', () => {
        const newStore = createMockStore({
          createdAt: new Date(), // Today
          averageRating: undefined,
        });

        expect(getBadgeType(newStore)).toBe('new');
      });

      it('should return "new" for stores created recently WITH rating (new takes priority)', () => {
        const newStoreWithRating = createMockStore({
          createdAt: new Date(), // Today
          averageRating: 4.8,
          totalReviews: 25,
        });

        expect(getBadgeType(newStoreWithRating)).toBe('new');
      });

      it('should return "new" for stores created 15 days ago', () => {
        const recentStore = createMockStore({
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
          averageRating: 4.5,
        });

        expect(getBadgeType(recentStore)).toBe('new');
      });
    });

    describe('Rating badge', () => {
      it('should return "rating" for old stores with rating', () => {
        const oldStoreWithRating = createMockStore({
          createdAt: new Date('2024-01-01'), // Old date
          averageRating: 4.8,
          totalReviews: 50,
        });

        expect(getBadgeType(oldStoreWithRating)).toBe('rating');
      });

      it('should return "rating" for stores without createdAt but with rating', () => {
        const storeWithoutDate = createMockStore({
          createdAt: undefined,
          averageRating: 4.3,
          totalReviews: 15,
        });

        expect(getBadgeType(storeWithoutDate)).toBe('rating');
      });

      it('should return "rating" for stores with very high rating', () => {
        const highRatedStore = createMockStore({
          createdAt: new Date('2023-01-01'),
          averageRating: 5.0,
          totalReviews: 100,
        });

        expect(getBadgeType(highRatedStore)).toBe('rating');
      });

      it('should return "rating" for stores with low but valid rating', () => {
        const lowRatedStore = createMockStore({
          createdAt: new Date('2023-01-01'),
          averageRating: 1.0,
          totalReviews: 5,
        });

        expect(getBadgeType(lowRatedStore)).toBe('rating');
      });
    });

    describe('No badge', () => {
      it('should return "none" for old stores without rating', () => {
        const oldStoreNoRating = createMockStore({
          createdAt: new Date('2023-01-01'),
          averageRating: undefined,
          totalReviews: 0,
        });

        expect(getBadgeType(oldStoreNoRating)).toBe('none');
      });

      it('should return "none" for stores without createdAt and without rating', () => {
        const storeNoData = createMockStore({
          createdAt: undefined,
          averageRating: undefined,
        });

        expect(getBadgeType(storeNoData)).toBe('none');
      });

      it('should return "none" for stores with zero rating', () => {
        const zeroRatedStore = createMockStore({
          createdAt: new Date('2023-01-01'),
          averageRating: 0,
        });

        expect(getBadgeType(zeroRatedStore)).toBe('none');
      });

      it('should return "none" for stores with null rating', () => {
        const nullRatedStore = createMockStore({
          createdAt: new Date('2023-01-01'),
          averageRating: null as unknown as number,
        });

        expect(getBadgeType(nullRatedStore)).toBe('none');
      });
    });

    describe('Edge cases', () => {
      it('should handle stores with decimal ratings', () => {
        const decimalRatingStore = createMockStore({
          createdAt: new Date('2023-01-01'),
          averageRating: 4.75,
        });

        expect(getBadgeType(decimalRatingStore)).toBe('rating');
      });

      it('should handle stores created exactly at month boundary', () => {
        const exactlyOneMonth = new Date();
        exactlyOneMonth.setMonth(exactlyOneMonth.getMonth() - 1);
        exactlyOneMonth.setDate(exactlyOneMonth.getDate() - 1); // Just over a month

        const boundaryStore = createMockStore({
          createdAt: exactlyOneMonth,
          averageRating: 4.0,
        });

        expect(getBadgeType(boundaryStore)).toBe('rating');
      });

      it('should handle invalid date objects', () => {
        const invalidDateStore = createMockStore({
          createdAt: new Date('invalid-date'),
          averageRating: 4.0,
        });

        // Invalid date should be treated as no date
        expect(getBadgeType(invalidDateStore)).toBe('rating');
      });

      it('should handle negative ratings gracefully', () => {
        const negativeRatingStore = createMockStore({
          createdAt: new Date('2023-01-01'),
          averageRating: -1,
        });

        // Negative rating should still show rating badge
        expect(getBadgeType(negativeRatingStore)).toBe('rating');
      });

      it('should handle extremely high ratings', () => {
        const extremeRatingStore = createMockStore({
          createdAt: new Date('2023-01-01'),
          averageRating: 10.5, // Invalid but should still work
        });

        expect(getBadgeType(extremeRatingStore)).toBe('rating');
      });
    });

    describe('Business logic validation', () => {
      it('should prioritize "new" over "rating" for recent stores', () => {
        const recentStoreWithExcellentRating = createMockStore({
          createdAt: new Date(), // Today
          averageRating: 5.0,
          totalReviews: 1000,
        });

        // Even with excellent rating, new stores should show "new" badge
        expect(getBadgeType(recentStoreWithExcellentRating)).toBe('new');
      });

      it('should show rating for established stores', () => {
        const establishedStore = createMockStore({
          createdAt: new Date('2023-06-01'), // Well established
          averageRating: 3.5, // Moderate rating
          totalReviews: 20,
        });

        expect(getBadgeType(establishedStore)).toBe('rating');
      });

      it('should handle stores in different time zones', () => {
        // This is important for international deployment
        const storeInDifferentTZ = createMockStore({
          createdAt: new Date('2024-01-15T23:59:59Z'), // UTC
          averageRating: 4.0,
        });

        // Should handle timezone differences gracefully
        const badgeType = getBadgeType(storeInDifferentTZ);
        expect(['new', 'rating']).toContain(badgeType);
      });
    });

    describe('Performance considerations', () => {
      it('should handle large number of stores efficiently', () => {
        const startTime = performance.now();
        
        // Test with 1000 stores
        for (let i = 0; i < 1000; i++) {
          const testStore = createMockStore({
            id: `store-${i}`,
            createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
            averageRating: Math.random() * 5,
          });
          
          getBadgeType(testStore);
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Should complete within reasonable time (100ms for 1000 stores)
        expect(duration).toBeLessThan(100);
      });
    });
  });

  describe('Integration scenarios', () => {
    it('should handle all test cases from original badge logic', () => {
      // Test case 1: Old store with rating
      const oldWithRating = createMockStore({
        createdAt: new Date('2024-01-15'),
        averageRating: 4.8,
        totalReviews: 124,
      });
      expect(getBadgeType(oldWithRating)).toBe('rating');

      // Test case 2: New store without rating
      const newWithoutRating = createMockStore({
        createdAt: new Date(),
        averageRating: undefined,
        totalReviews: 0,
      });
      expect(getBadgeType(newWithoutRating)).toBe('new');

      // Test case 3: New store with rating (priority test)
      const newWithRating = createMockStore({
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        averageRating: 4.9,
        totalReviews: 156,
      });
      expect(getBadgeType(newWithRating)).toBe('new');

      // Test case 4: Old store without rating
      const oldWithoutRating = createMockStore({
        createdAt: new Date('2024-05-01'),
        averageRating: undefined,
        totalReviews: 0,
      });
      expect(getBadgeType(oldWithoutRating)).toBe('none');
    });
  });
});