/**
 * Analytics API - Current week metrics operations
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  Unsubscribe,
  where,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { getCurrentWeekKey, getPreviousWeekKey } from '../../utils/dateUtils';

// ============================================================================
// Types
// ============================================================================

export interface CurrentWeekMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  activeCustomers: number;
  lastUpdated: Date | null;
}

// ============================================================================
// Internal Helpers
// ============================================================================

/**
 * Helper to fetch active customers count from the separate activeCustomers collection
 * Backend stores customers in: activeCustomers/weekly_{YYYY-WNN}_{storeId}
 *
 * @param weekKey - The week identifier in YYYY-WNN format
 * @param storeId - The store ID to filter customers by
 */
async function getActiveCustomersFromWeeklyDoc(weekKey: string, storeId: string): Promise<number> {
  try {
    // Document path includes storeId to get per-store customer counts
    const docRef = doc(db, 'activeCustomers', `weekly_${weekKey}_${storeId}`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const customers = docSnap.data().customers || [];
      return customers.length;
    }
  } catch (error) {
    console.warn('Could not fetch active customers from weekly doc:', error);
  }
  return 0;
}

// ============================================================================
// Current Week Metrics
// ============================================================================

/**
 * Get current week metrics from backend
 */
export async function getCurrentWeekMetrics(storeId: string): Promise<CurrentWeekMetrics> {
  const weekKey = getCurrentWeekKey();
  const q = query(
    collection(db, 'currentWeekMetrics'),
    where('storeId', '==', storeId),
    where('weekKey', '==', weekKey)
  );

  const snapshot = await getDocs(q);

  const aggregatedData = snapshot.docs.reduce(
    (acc, docSnap) => {
      const data = docSnap.data();
      return {
        totalRevenue: acc.totalRevenue + (data.revenue ?? data.totalRevenue ?? 0),
        totalOrders: acc.totalOrders + (data.orders ?? data.totalOrders ?? 0),
        totalProducts: acc.totalProducts + (data.products ?? data.totalProducts ?? 0),
        activeCustomers: acc.activeCustomers,
        lastUpdated: data.lastUpdated ? data.lastUpdated.toDate() : null,
      };
    },
    {
      totalRevenue: 0,
      totalOrders: 0,
      totalProducts: 0,
      activeCustomers: 0,
      lastUpdated: null as Date | null,
    }
  );

  // Fetch active customers from separate collection (per-store)
  const customersCount = await getActiveCustomersFromWeeklyDoc(weekKey, storeId);
  aggregatedData.activeCustomers = customersCount;

  return aggregatedData;
}

/**
 * Get previous week metrics for trend calculations
 */
export async function getPreviousWeekMetrics(storeId: string): Promise<CurrentWeekMetrics | null> {
  try {
    const prevWeekKey = getPreviousWeekKey();
    const q = query(
      collection(db, 'currentWeekMetrics'),
      where('storeId', '==', storeId),
      where('weekKey', '==', prevWeekKey)
    );

    const snapshot = await getDocs(q);

    if (snapshot.docs.length > 0) {
      const aggregatedData = snapshot.docs.reduce(
        (acc, docSnap) => {
          const data = docSnap.data();
          return {
            totalRevenue: acc.totalRevenue + (data.revenue ?? data.totalRevenue ?? 0),
            totalOrders: acc.totalOrders + (data.orders ?? data.totalOrders ?? 0),
            totalProducts: acc.totalProducts + (data.products ?? data.totalProducts ?? 0),
            activeCustomers: acc.activeCustomers,
            lastUpdated: data.lastUpdated ? data.lastUpdated.toDate() : acc.lastUpdated,
          };
        },
        {
          totalRevenue: 0,
          totalOrders: 0,
          totalProducts: 0,
          activeCustomers: 0,
          lastUpdated: null as Date | null,
        }
      );

      // Fetch active customers from separate collection (per-store)
      const customersCount = await getActiveCustomersFromWeeklyDoc(prevWeekKey, storeId);
      aggregatedData.activeCustomers = customersCount;

      return aggregatedData;
    }
  } catch (error) {
    console.warn('Previous week metrics unavailable:', error);
  }

  return null;
}

// ============================================================================
// Real-time Subscriptions
// ============================================================================

/**
 * Set up real-time listener for current week metrics
 */
export function subscribeToCurrentWeekMetrics(
  storeId: string,
  callback: (metrics: CurrentWeekMetrics) => void
): Unsubscribe {
  const weekKey = getCurrentWeekKey();
  const q = query(
    collection(db, 'currentWeekMetrics'),
    where('storeId', '==', storeId),
    where('weekKey', '==', weekKey)
  );

  return onSnapshot(
    q,
    async (snapshot) => {
      const aggregatedData = snapshot.docs.reduce(
        (acc, docSnap) => {
          const data = docSnap.data();
          return {
            totalRevenue: acc.totalRevenue + (data.revenue ?? data.totalRevenue ?? 0),
            totalOrders: acc.totalOrders + (data.orders ?? data.totalOrders ?? 0),
            totalProducts: acc.totalProducts + (data.products ?? data.totalProducts ?? 0),
            activeCustomers: acc.activeCustomers,
            lastUpdated: data.lastUpdated ? data.lastUpdated.toDate() : null,
          };
        },
        {
          totalRevenue: 0,
          totalOrders: 0,
          totalProducts: 0,
          activeCustomers: 0,
          lastUpdated: null as Date | null,
        }
      );

      // Fetch active customers from separate collection (per-store)
      const customersCount = await getActiveCustomersFromWeeklyDoc(weekKey, storeId);
      aggregatedData.activeCustomers = customersCount;

      callback(aggregatedData);
    },
    (error) => {
      console.error('Real-time metrics listener error:', error);
    }
  );
}
