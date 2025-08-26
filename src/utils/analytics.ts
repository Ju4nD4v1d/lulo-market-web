/**
 * Analytics utilities for new backend system
 * Includes fallback mechanisms for backward compatibility
 */

import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  onSnapshot,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { getCurrentWeekKey, getPreviousWeekKey, getCurrentMonthKey } from './dateUtils';

export interface CurrentWeekMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  activeCustomers: number;
  lastUpdated: Date | null;
}

export interface TopProductData {
  id: string;
  productId: string;
  productName: string;
  storeId: string;
  totalQuantitySold: number;
  totalRevenue: number;
  weekSales?: number;
  lastSoldAt?: Date;
}

export interface TopProductsResult {
  byQuantity: TopProductData[];
  byRevenue: TopProductData[];
  byCurrentWeek: TopProductData[];
  lastUpdated: Date | null;
}

/**
 * Get current week metrics from new backend structure
 * Falls back to legacy monthlyRevenueSummary if new data unavailable
 */
export async function getCurrentWeekMetrics(storeId: string): Promise<CurrentWeekMetrics> {
  try {
    // Try new backend structure first
    const weekKey = getCurrentWeekKey();
    const q = query(
      collection(db, 'currentWeekMetrics'),
      where('storeId', '==', storeId),
      where('weekKey', '==', weekKey)
    );

    const snapshot = await getDocs(q);
    
    if (snapshot.docs.length > 0) {
      // Aggregate data from all matching documents (should be only one usually)
      const aggregatedData = snapshot.docs.reduce((acc, doc) => {
        const data = doc.data();
        return {
          totalRevenue: acc.totalRevenue + (data.totalRevenue || 0),
          totalOrders: acc.totalOrders + (data.totalOrders || 0),
          totalProducts: acc.totalProducts + (data.totalProducts || 0),
          activeCustomers: Math.max(acc.activeCustomers, (data.customers || []).length),
          lastUpdated: data.lastUpdated ? data.lastUpdated.toDate() : null
        };
      }, {
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        activeCustomers: 0,
        lastUpdated: null as Date | null
      });

      return aggregatedData;
    }
  } catch (error) {
    console.warn('New currentWeekMetrics unavailable, falling back to legacy:', error);
  }

  // Fallback to legacy monthlyRevenueSummary
  return getLegacyWeekMetrics(storeId);
}

/**
 * Legacy fallback for week metrics using monthlyRevenueSummary
 */
async function getLegacyWeekMetrics(storeId: string): Promise<CurrentWeekMetrics> {
  try {
    const monthKey = getCurrentMonthKey();
    const docRef = doc(db, 'monthlyRevenueSummary', `${storeId}_${monthKey}`);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        activeCustomers: 0,
        lastUpdated: null
      };
    }

    const data = docSnap.data();
    const currentWeek = Math.ceil(new Date().getDate() / 7); // Old week calculation
    const weekData = data.weekly?.find((w: { week: number }) => w.week === currentWeek);

    return {
      totalRevenue: weekData?.revenue || 0,
      totalOrders: weekData?.orders || 0,
      totalProducts: weekData?.productsSold || 0,
      activeCustomers: data.activeCustomers || 0,
      lastUpdated: data.lastUpdated ? data.lastUpdated.toDate() : null
    };
  } catch (error) {
    console.error('Error fetching legacy week metrics:', error);
    return {
      totalRevenue: 0,
      totalOrders: 0,
      totalProducts: 0,
      activeCustomers: 0,
      lastUpdated: null
    };
  }
}

/**
 * Get top products for a specific store from new analytics collection
 * Falls back to legacy products collection if new data unavailable
 */
export async function getTopProductsByStore(storeId: string): Promise<TopProductsResult> {
  try {
    // Try new analytics/topProducts collection first
    const docRef = doc(db, 'analytics', 'topProducts');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const lastUpdated = data.lastUpdated ? data.lastUpdated.toDate() : null;

      return {
        byQuantity: (data.byQuantity || []).filter((p: TopProductData) => p.storeId === storeId),
        byRevenue: (data.byRevenue || []).filter((p: TopProductData) => p.storeId === storeId),
        byCurrentWeek: (data.byCurrentWeek || []).filter((p: TopProductData) => p.storeId === storeId),
        lastUpdated
      };
    }
  } catch (error) {
    console.warn('New analytics/topProducts unavailable, falling back to legacy:', error);
  }

  // Fallback to legacy products collection
  return getLegacyTopProducts(storeId);
}

/**
 * Legacy fallback for top products using products collection
 */
async function getLegacyTopProducts(storeId: string): Promise<TopProductsResult> {
  try {
    const q = query(
      collection(db, 'products'),
      where('storeId', '==', storeId),
      orderBy('totalSold', 'desc'),
      limit(10)
    );
    
    const snapshot = await getDocs(q);
    const products: TopProductData[] = snapshot.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        productId: d.id,
        productName: data.name || 'Unknown Product',
        storeId: data.storeId || storeId,
        totalQuantitySold: data.totalSold || 0,
        totalRevenue: (data.totalSold || 0) * (data.price || 0),
        lastSoldAt: data.lastSoldAt ? data.lastSoldAt.toDate() : null
      };
    });

    return {
      byQuantity: products,
      byRevenue: [...products].sort((a, b) => b.totalRevenue - a.totalRevenue),
      byCurrentWeek: products, // No weekly breakdown in legacy
      lastUpdated: null
    };
  } catch (error) {
    console.error('Error fetching legacy top products:', error);
    return {
      byQuantity: [],
      byRevenue: [],
      byCurrentWeek: [],
      lastUpdated: null
    };
  }
}

/**
 * Get active customers count for current week
 * Falls back to monthlyRevenueSummary if new data unavailable
 */
export async function getActiveCustomersThisWeek(storeId: string): Promise<number> {
  try {
    // Try new activeCustomers collection first
    const weekKey = getCurrentWeekKey();
    const docRef = doc(db, 'activeCustomers', `weekly_${weekKey}`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const customers = docSnap.data().customers || [];
      return customers.length;
    }
  } catch (error) {
    console.warn('New activeCustomers collection unavailable, falling back to legacy:', error);
  }

  // Fallback to current week metrics or legacy monthly summary
  const weekMetrics = await getCurrentWeekMetrics(storeId);
  return weekMetrics.activeCustomers;
}

/**
 * Get active customers for previous week for trend calculation
 */
export async function getActiveCustomersPreviousWeek(): Promise<number | null> {
  try {
    const prevWeekKey = getPreviousWeekKey();
    const docRef = doc(db, 'activeCustomers', `weekly_${prevWeekKey}`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const customers = docSnap.data().customers || [];
      return customers.length;
    }
  } catch (error) {
    console.warn('Previous week active customers unavailable:', error);
  }

  return null;
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
      const doc = snapshot.docs[0];
      const data = doc.data();
      return {
        totalRevenue: data.totalRevenue || 0,
        totalOrders: data.totalOrders || 0,
        totalProducts: data.totalProducts || 0,
        activeCustomers: (data.customers || []).length,
        lastUpdated: data.lastUpdated ? data.lastUpdated.toDate() : null
      };
    }
  } catch (error) {
    console.warn('Previous week metrics unavailable:', error);
  }

  return null;
}

/**
 * Set up real-time listener for current week metrics
 */
export function subscribeToCurrentWeekMetrics(
  storeId: string,
  callback: (metrics: CurrentWeekMetrics) => void
): () => void {
  const weekKey = getCurrentWeekKey();
  const q = query(
    collection(db, 'currentWeekMetrics'),
    where('storeId', '==', storeId),
    where('weekKey', '==', weekKey)
  );

  return onSnapshot(q, (snapshot) => {
    if (snapshot.docs.length > 0) {
      const aggregatedData = snapshot.docs.reduce((acc, doc) => {
        const data = doc.data();
        return {
          totalRevenue: acc.totalRevenue + (data.totalRevenue || 0),
          totalOrders: acc.totalOrders + (data.totalOrders || 0),
          totalProducts: acc.totalProducts + (data.totalProducts || 0),
          activeCustomers: Math.max(acc.activeCustomers, (data.customers || []).length),
          lastUpdated: data.lastUpdated ? data.lastUpdated.toDate() : null
        };
      }, {
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        activeCustomers: 0,
        lastUpdated: null as Date | null
      });

      callback(aggregatedData);
    } else {
      // If no real-time data, fetch legacy as fallback
      getLegacyWeekMetrics(storeId).then(callback);
    }
  }, (error) => {
    console.error('Real-time metrics listener error:', error);
    // Fallback to legacy on error
    getLegacyWeekMetrics(storeId).then(callback);
  });
}

/**
 * Set up real-time listener for top products
 */
export function subscribeToTopProducts(
  storeId: string,
  callback: (products: TopProductsResult) => void
): () => void {
  const docRef = doc(db, 'analytics', 'topProducts');

  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      const lastUpdated = data.lastUpdated ? data.lastUpdated.toDate() : null;

      const result: TopProductsResult = {
        byQuantity: (data.byQuantity || []).filter((p: TopProductData) => p.storeId === storeId),
        byRevenue: (data.byRevenue || []).filter((p: TopProductData) => p.storeId === storeId),
        byCurrentWeek: (data.byCurrentWeek || []).filter((p: TopProductData) => p.storeId === storeId),
        lastUpdated
      };

      callback(result);
    } else {
      // Fallback to legacy on no data
      getLegacyTopProducts(storeId).then(callback);
    }
  }, (error) => {
    console.error('Real-time top products listener error:', error);
    // Fallback to legacy on error
    getLegacyTopProducts(storeId).then(callback);
  });
}

/**
 * Test function to validate analytics data
 */
export async function validateAnalyticsData(storeId: string): Promise<{
  currentWeekMetrics: CurrentWeekMetrics;
  topProducts: TopProductsResult;
  activeCustomers: number;
  dataSource: 'new' | 'legacy' | 'mixed';
}> {
  const [metrics, products, customers] = await Promise.all([
    getCurrentWeekMetrics(storeId),
    getTopProductsByStore(storeId),
    getActiveCustomersThisWeek(storeId)
  ]);

  // Determine data source
  let dataSource: 'new' | 'legacy' | 'mixed' = 'new';
  
  try {
    const weekKey = getCurrentWeekKey();
    const newMetricsQuery = query(
      collection(db, 'currentWeekMetrics'),
      where('storeId', '==', storeId),
      where('weekKey', '==', weekKey)
    );
    const newMetricsSnapshot = await getDocs(newMetricsQuery);
    
    const newProductsDoc = await getDoc(doc(db, 'analytics', 'topProducts'));
    
    const hasNewMetrics = newMetricsSnapshot.docs.length > 0;
    const hasNewProducts = newProductsDoc.exists();
    
    if (!hasNewMetrics && !hasNewProducts) {
      dataSource = 'legacy';
    } else if (!hasNewMetrics || !hasNewProducts) {
      dataSource = 'mixed';
    }
  } catch (error) {
    console.error('Error determining data source:', error);
    dataSource = 'legacy';
  }

  return {
    currentWeekMetrics: metrics,
    topProducts: products,
    activeCustomers: customers,
    dataSource
  };
}