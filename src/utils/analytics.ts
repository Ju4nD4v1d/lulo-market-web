/**
 * Analytics utilities for new backend system
 * Re-exports from analyticsApi for backward compatibility
 */

// Re-export all types and functions from analyticsApi
export type {
    CurrentWeekMetrics,
    TopProductData,
    TopProductsResult,
} from '../services/api/analyticsApi';

export {
    getCurrentWeekMetrics,
    getPreviousWeekMetrics,
    getTopProductsByStore,
    getActiveCustomersThisWeek,
    getActiveCustomersPreviousWeek,
    subscribeToCurrentWeekMetrics,
    subscribeToTopProducts,
} from '../services/api/analyticsApi';

// Legacy validation function - kept for backward compatibility
import * as analyticsApi from '../services/api/analyticsApi';

export async function validateAnalyticsData(storeId: string): Promise<{
    currentWeekMetrics: analyticsApi.CurrentWeekMetrics;
    topProducts: analyticsApi.TopProductsResult;
    activeCustomers: number;
    dataSource: 'new' | 'legacy' | 'mixed';
}> {
    const [metrics, products, customers] = await Promise.all([
        analyticsApi.getCurrentWeekMetrics(storeId),
        analyticsApi.getTopProductsByStore(storeId),
        analyticsApi.getActiveCustomersThisWeek(storeId),
    ]);

    // Note: dataSource detection would require additional queries
    // For simplicity, return 'mixed' as default
    return {
        currentWeekMetrics: metrics,
        topProducts: products,
        activeCustomers: customers,
        dataSource: 'mixed',
    };
}
