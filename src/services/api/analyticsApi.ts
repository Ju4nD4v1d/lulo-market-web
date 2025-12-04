/**
 * Analytics API - Dashboard metrics and trend operations
 */

import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    onSnapshot,
    orderBy,
    query,
    Unsubscribe,
    where,
} from 'firebase/firestore';
import {format, subMonths} from 'date-fns';
import {db} from '../../config/firebase';
import {getCurrentMonthKey, getCurrentWeekKey, getPreviousWeekKey} from '../../utils/dateUtils';

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

export interface RevenueTrendData {
    label: string;
    value: number;
}

export interface WeeklyProductData {
    week: number;
    productsSold: number;
}

export interface WeeklyOrderData {
    week: number;
    orders: number;
}

export interface ActiveCustomersTrend {
    current: number;
    previous: number | null;
}

// ============================================================================
// Current Week Metrics
// ============================================================================

/**
 * Helper to fetch active customers count from the separate activeCustomers collection
 * Backend stores customers in: activeCustomers/weekly_{YYYY-WNN}
 */
async function getActiveCustomersFromWeeklyDoc(weekKey: string): Promise<number> {
    try {
        const docRef = doc(db, 'activeCustomers', `weekly_${weekKey}`);
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

/**
 * Get current week metrics from new backend structure
 * Falls back to legacy monthlyRevenueSummary if new data unavailable
 *
 * Note: Backend uses different field names than frontend expects:
 * - Backend: revenue, orders, products (in currentWeekMetrics)
 * - Frontend: totalRevenue, totalOrders, totalProducts
 * - Customers are stored in separate activeCustomers collection
 */
export async function getCurrentWeekMetrics(storeId: string): Promise<CurrentWeekMetrics> {
    try {
        const weekKey = getCurrentWeekKey();
        const q = query(
            collection(db, 'currentWeekMetrics'),
            where('storeId', '==', storeId),
            where('weekKey', '==', weekKey)
        );

        const snapshot = await getDocs(q);

        if (snapshot.docs.length > 0) {
            const aggregatedData = snapshot.docs.reduce(
                (acc, docSnap) => {
                    const data = docSnap.data();
                    // Map backend field names to frontend expected names:
                    // Backend uses: revenue, orders, products
                    // Frontend expects: totalRevenue, totalOrders, totalProducts
                    return {
                        totalRevenue: acc.totalRevenue + (data.revenue ?? data.totalRevenue ?? 0),
                        totalOrders: acc.totalOrders + (data.orders ?? data.totalOrders ?? 0),
                        totalProducts: acc.totalProducts + (data.products ?? data.totalProducts ?? 0),
                        activeCustomers: acc.activeCustomers, // Fetched separately from activeCustomers collection
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

            // Fetch active customers from separate collection
            const customersCount = await getActiveCustomersFromWeeklyDoc(weekKey);
            aggregatedData.activeCustomers = customersCount;

            return aggregatedData;
        }
    } catch (error) {
        console.warn('New currentWeekMetrics unavailable, falling back to legacy:', error);
    }

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
                lastUpdated: null,
            };
        }

        const data = docSnap.data();
        const currentWeek = Math.ceil(new Date().getDate() / 7);
        const weekData = data.weekly?.find((w: { week: number }) => w.week === currentWeek);

        return {
            totalRevenue: weekData?.revenue || 0,
            totalOrders: weekData?.orders || 0,
            totalProducts: weekData?.productsSold || 0,
            activeCustomers: data.activeCustomers || 0,
            lastUpdated: data.lastUpdated ? data.lastUpdated.toDate() : null,
        };
    } catch (error) {
        console.error('Error fetching legacy week metrics:', error);
        return {
            totalRevenue: 0,
            totalOrders: 0,
            totalProducts: 0,
            activeCustomers: 0,
            lastUpdated: null,
        };
    }
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
            // Aggregate all documents for this store/week
            const aggregatedData = snapshot.docs.reduce(
                (acc, docSnap) => {
                    const data = docSnap.data();
                    // Map backend field names to frontend expected names
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

            // Fetch active customers from separate collection
            const customersCount = await getActiveCustomersFromWeeklyDoc(prevWeekKey);
            aggregatedData.activeCustomers = customersCount;

            return aggregatedData;
        }
    } catch (error) {
        console.warn('Previous week metrics unavailable:', error);
    }

    return null;
}

// ============================================================================
// Top Products
// ============================================================================

/**
 * Get top products for a specific store from new analytics collection
 * Falls back to legacy products collection if new data unavailable
 */
export async function getTopProductsByStore(storeId: string): Promise<TopProductsResult> {
    try {
        const docRef = doc(db, 'analytics', 'topProducts');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const lastUpdated = data.lastUpdated ? data.lastUpdated.toDate() : null;

            return {
                byQuantity: (data.byQuantity || []).filter((p: TopProductData) => p.storeId === storeId),
                byRevenue: (data.byRevenue || []).filter((p: TopProductData) => p.storeId === storeId),
                byCurrentWeek: (data.byCurrentWeek || []).filter((p: TopProductData) => p.storeId === storeId),
                lastUpdated,
            };
        }
    } catch (error) {
        console.warn('New analytics/topProducts unavailable, falling back to legacy:', error);
    }

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
        const products: TopProductData[] = snapshot.docs.map((d) => {
            const data = d.data();
            return {
                id: d.id,
                productId: d.id,
                productName: data.name || 'Unknown Product',
                storeId: data.storeId || storeId,
                totalQuantitySold: data.totalSold || 0,
                totalRevenue: (data.totalSold || 0) * (data.price || 0),
                lastSoldAt: data.lastSoldAt ? data.lastSoldAt.toDate() : undefined,
            };
        });

        return {
            byQuantity: products,
            byRevenue: [...products].sort((a, b) => b.totalRevenue - a.totalRevenue),
            byCurrentWeek: products,
            lastUpdated: null,
        };
    } catch (error) {
        console.error('Error fetching legacy top products:', error);
        return {
            byQuantity: [],
            byRevenue: [],
            byCurrentWeek: [],
            lastUpdated: null,
        };
    }
}

// ============================================================================
// Active Customers
// ============================================================================

/**
 * Get active customers count for current week
 */
export async function getActiveCustomersThisWeek(storeId: string): Promise<number> {
    try {
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
 * Get active customers trend (current vs previous month)
 */
export async function getActiveCustomersTrend(storeId: string): Promise<ActiveCustomersTrend> {
    const now = new Date();
    const thisKey = format(now, 'yyyy-MM');
    const prevKey = format(subMonths(now, 1), 'yyyy-MM');

    const currentRef = doc(db, 'monthlyRevenueSummary', `${storeId}_${thisKey}`);
    const prevRef = doc(db, 'monthlyRevenueSummary', `${storeId}_${prevKey}`);

    const [currentSnap, prevSnap] = await Promise.all([getDoc(currentRef), getDoc(prevRef)]);

    const current = currentSnap.exists() ? (currentSnap.data().activeCustomers ?? 0) : 0;
    const previous = prevSnap.exists() ? (prevSnap.data().activeCustomers ?? 0) : null;

    return {current, previous};
}

// ============================================================================
// Revenue Trend
// ============================================================================

/**
 * Get weekly revenue data for the last 4 weeks
 */
export async function getWeeklyRevenueTrend(storeId: string): Promise<RevenueTrendData[]> {
    const monthKey = format(new Date(), 'yyyy-MM');

    try {
        const weeklyDoc = await getDoc(doc(db, 'monthlyRevenueSummary', `${storeId}_${monthKey}`));
        const weeklyArr = weeklyDoc.exists()
            ? (weeklyDoc.data().weekly as { week: number; revenue: number }[])
            : [];

        const sorted = weeklyArr.sort((a, b) => a.week - b.week);
        return sorted.slice(-4).map((w) => ({
            label: `Week ${w.week}`,
            value: w.revenue,
        }));
    } catch (error) {
        console.error('Error fetching weekly revenue data:', error);
        return [];
    }
}

/**
 * Get monthly revenue data for the last 12 months
 */
export async function getMonthlyRevenueTrend(storeId: string): Promise<RevenueTrendData[]> {
    try {
        const q = query(
            collection(db, 'monthlyRevenueSummary'),
            where('storeId', '==', storeId),
            orderBy('month', 'desc'),
            limit(12)
        );

        const snap = await getDocs(q);
        return snap.docs
            .map((d) => d.data() as { month: string; totalRevenue: number })
            .sort((a, b) => a.month.localeCompare(b.month))
            .map((m) => ({
                label: m.month,
                value: m.totalRevenue,
            }));
    } catch (error) {
        console.error('Error fetching monthly revenue data:', error);
        return [];
    }
}

// ============================================================================
// Products Trend
// ============================================================================

/**
 * Get weekly products sold data for the current month
 */
export async function getProductsTrend(storeId: string): Promise<WeeklyProductData[]> {
    const currentMonthKey = format(new Date(), 'yyyy-MM');

    try {
        const docRef = doc(db, 'monthlyRevenueSummary', `${storeId}_${currentMonthKey}`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const docData = docSnap.data();
            const weeklyArray = docData.weekly || [];

            return weeklyArray
                .filter((item: unknown): item is { week: number; products?: number; productsSold?: number } => {
                    const i = item as { week?: number; products?: number; productsSold?: number };
                    // Accept either 'products' (backend) or 'productsSold' (legacy)
                    return typeof i.week === 'number' && (typeof i.products === 'number' || typeof i.productsSold === 'number');
                })
                .map((item: { week: number; products?: number; productsSold?: number }) => ({
                    week: item.week,
                    // Map backend field 'products' to frontend expected 'productsSold'
                    productsSold: item.products ?? item.productsSold ?? 0,
                }))
                .sort((a: WeeklyProductData, b: WeeklyProductData) => a.week - b.week);
        }

        return [];
    } catch (error) {
        console.error('Error fetching products trend:', error);
        return [];
    }
}

// ============================================================================
// Orders Trend
// ============================================================================

/**
 * Get weekly orders data for the current month
 */
export async function getOrdersTrend(storeId: string): Promise<WeeklyOrderData[]> {
    const currentMonthKey = format(new Date(), 'yyyy-MM');

    try {
        const docRef = doc(db, 'monthlyRevenueSummary', `${storeId}_${currentMonthKey}`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const docData = docSnap.data();
            const weeklyArray = docData.weekly || [];

            return weeklyArray
                .filter((item: unknown): item is { week: number; orders: number } => {
                    const i = item as { week?: number; orders?: number };
                    return typeof i.week === 'number' && typeof i.orders === 'number';
                })
                .map((item: { week: number; orders: number }) => ({
                    week: item.week,
                    orders: item.orders,
                }))
                .sort((a: WeeklyOrderData, b: WeeklyOrderData) => a.week - b.week);
        }

        return [];
    } catch (error) {
        console.error('Error fetching orders trend:', error);
        return [];
    }
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
            if (snapshot.docs.length > 0) {
                const aggregatedData = snapshot.docs.reduce(
                    (acc, docSnap) => {
                        const data = docSnap.data();
                        // Map backend field names to frontend expected names
                        return {
                            totalRevenue: acc.totalRevenue + (data.revenue ?? data.totalRevenue ?? 0),
                            totalOrders: acc.totalOrders + (data.orders ?? data.totalOrders ?? 0),
                            totalProducts: acc.totalProducts + (data.products ?? data.totalProducts ?? 0),
                            activeCustomers: acc.activeCustomers, // Fetched separately
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

                // Fetch active customers from separate collection
                const customersCount = await getActiveCustomersFromWeeklyDoc(weekKey);
                aggregatedData.activeCustomers = customersCount;

                callback(aggregatedData);
            } else {
                getLegacyWeekMetrics(storeId).then(callback);
            }
        },
        (error) => {
            console.error('Real-time metrics listener error:', error);
            getLegacyWeekMetrics(storeId).then(callback);
        }
    );
}

/**
 * Set up real-time listener for top products
 */
export function subscribeToTopProducts(
    storeId: string,
    callback: (products: TopProductsResult) => void
): Unsubscribe {
    const docRef = doc(db, 'analytics', 'topProducts');

    return onSnapshot(
        docRef,
        (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const lastUpdated = data.lastUpdated ? data.lastUpdated.toDate() : null;

                const result: TopProductsResult = {
                    byQuantity: (data.byQuantity || []).filter((p: TopProductData) => p.storeId === storeId),
                    byRevenue: (data.byRevenue || []).filter((p: TopProductData) => p.storeId === storeId),
                    byCurrentWeek: (data.byCurrentWeek || []).filter((p: TopProductData) => p.storeId === storeId),
                    lastUpdated,
                };

                callback(result);
            } else {
                getLegacyTopProducts(storeId).then(callback);
            }
        },
        (error) => {
            console.error('Real-time top products listener error:', error);
            getLegacyTopProducts(storeId).then(callback);
        }
    );
}
