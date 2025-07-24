import { StoreData } from '../types/store';

export type BadgeType = 'new' | 'rating' | 'none';

/**
 * Determines if a store is considered "new" (created within the last month)
 */
export function isStoreNew(createdAt: Date | undefined | null): boolean {
  if (!createdAt || !(createdAt instanceof Date) || isNaN(createdAt.getTime())) {
    return false;
  }

  const now = new Date();
  const oneMonthAgo = new Date(now);
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  return createdAt > oneMonthAgo;
}

/**
 * Determines what type of badge a store should display
 * Priority: new > rating > none
 */
export function getBadgeType(store: StoreData): BadgeType {
  // Check if store is new (highest priority)
  if (isStoreNew(store.createdAt)) {
    return 'new';
  }

  // Check if store has a rating (second priority)
  if (typeof store.averageRating === 'number' && !isNaN(store.averageRating) && store.averageRating !== 0) {
    return 'rating';
  }

  // No badge
  return 'none';
}