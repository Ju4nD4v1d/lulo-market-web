/**
 * Shared types and helper functions for API layer
 */

/**
 * Safely converts various date formats to a Date object
 * Handles Firestore timestamps, Date objects, strings, and numbers
 */
export const safeDate = (dateValue: unknown): Date => {
  if (!dateValue) return new Date();

  try {
    // If it's a Firestore timestamp with toDate method
    if (typeof dateValue === 'object' && dateValue !== null && 'toDate' in dateValue) {
      return (dateValue as { toDate: () => Date }).toDate();
    }

    // If it's already a Date object
    if (dateValue instanceof Date) {
      return dateValue;
    }

    // If it's a string or number, try to parse
    const parsed = new Date(dateValue as string | number);
    if (isNaN(parsed.getTime())) {
      console.warn('Invalid date value:', dateValue, 'using current date');
      return new Date();
    }

    return parsed;
  } catch (error) {
    console.error('Error parsing date:', dateValue, error);
    return new Date();
  }
};

/**
 * Collection names for Firestore
 */
export const COLLECTIONS = {
  STORES: 'stores',
  PRODUCTS: 'products',
  ORDERS: 'orders',
  REVIEWS: 'reviews',
  USERS: 'users',
  WAITLIST: 'waitlist',
  DRIVERS: 'drivers',
  STORE_ACCEPTANCES: 'store_acceptances',
} as const;
