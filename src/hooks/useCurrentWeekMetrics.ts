/**
 * Hook for current week metrics with real-time updates
 * Includes fallback to legacy data sources
 */

import { useState, useEffect, useRef } from 'react';
import { 
  getCurrentWeekMetrics, 
  getPreviousWeekMetrics,
  subscribeToCurrentWeekMetrics,
  type CurrentWeekMetrics 
} from '../utils/analytics';

export interface UseCurrentWeekMetricsReturn {
  current: CurrentWeekMetrics;
  previous: CurrentWeekMetrics | null;
  loading: boolean;
  error: string | null;
  trend: {
    revenue: number | null;
    orders: number | null;
    products: number | null;
    customers: number | null;
  };
  dataSource: 'new' | 'legacy' | 'unknown';
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
}

export function useCurrentWeekMetrics(storeId: string): UseCurrentWeekMetricsReturn {
  const [current, setCurrent] = useState<CurrentWeekMetrics>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    activeCustomers: 0,
    lastUpdated: null
  });
  
  const [previous, setPrevious] = useState<CurrentWeekMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'new' | 'legacy' | 'unknown'>('unknown');
  
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Calculate trends
  const trend = {
    revenue: previous && previous.totalRevenue !== 0 
      ? ((current.totalRevenue - previous.totalRevenue) / previous.totalRevenue) * 100 
      : null,
    orders: previous && previous.totalOrders !== 0 
      ? ((current.totalOrders - previous.totalOrders) / previous.totalOrders) * 100 
      : null,
    products: previous && previous.totalProducts !== 0 
      ? ((current.totalProducts - previous.totalProducts) / previous.totalProducts) * 100 
      : null,
    customers: previous && previous.activeCustomers !== 0 
      ? ((current.activeCustomers - previous.activeCustomers) / previous.activeCustomers) * 100 
      : null
  };

  const refetch = async () => {
    if (!storeId) return;
    
    setLoading(true);
    setError(null);

    try {
      const [currentData, previousData] = await Promise.all([
        getCurrentWeekMetrics(storeId),
        getPreviousWeekMetrics(storeId)
      ]);

      setCurrent(currentData);
      setPrevious(previousData);
      
      // Determine data source based on lastUpdated timestamp
      if (currentData.lastUpdated && currentData.lastUpdated > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
        setDataSource('new');
      } else if (currentData.totalRevenue > 0 || currentData.totalOrders > 0) {
        setDataSource('legacy');
      } else {
        setDataSource('unknown');
      }
      
    } catch (err) {
      console.error('Error fetching current week metrics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!storeId) {
      setCurrent({
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        activeCustomers: 0,
        lastUpdated: null
      });
      setPrevious(null);
      setLoading(false);
      return;
    }

    // Initial load
    refetch();

    // Set up real-time listener for current week
    const unsubscribe = subscribeToCurrentWeekMetrics(storeId, (metrics) => {
      setCurrent(metrics);
      
      // Update data source based on real-time data
      if (metrics.lastUpdated && metrics.lastUpdated > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
        setDataSource('new');
      } else if (metrics.totalRevenue > 0 || metrics.totalOrders > 0) {
        setDataSource('legacy');
      }
      
      // Only set loading to false after first real-time update
      if (loading) {
        setLoading(false);
      }
    });

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [storeId]);

  // Load previous week data when current data changes
  useEffect(() => {
    if (storeId && current.totalRevenue > 0) {
      getPreviousWeekMetrics(storeId)
        .then(setPrevious)
        .catch(err => console.warn('Could not load previous week metrics:', err));
    }
  }, [storeId, current.totalRevenue, current.totalOrders]);

  return {
    current,
    previous,
    loading,
    error,
    trend,
    dataSource,
    lastUpdated: current.lastUpdated,
    refetch
  };
}

/**
 * Simplified hook for just current week data without trends
 */
export function useCurrentWeekData(storeId: string) {
  const { current, loading, error, dataSource, refetch } = useCurrentWeekMetrics(storeId);
  
  return {
    totalRevenue: current.totalRevenue,
    totalOrders: current.totalOrders,
    totalProducts: current.totalProducts,
    activeCustomers: current.activeCustomers,
    loading,
    error,
    dataSource,
    lastUpdated: current.lastUpdated,
    refetch
  };
}

/**
 * Hook specifically for trend calculations
 */
export function useWeeklyTrends(storeId: string) {
  const { current, previous, trend, loading, error } = useCurrentWeekMetrics(storeId);
  
  return {
    currentWeek: {
      revenue: current.totalRevenue,
      orders: current.totalOrders,
      products: current.totalProducts,
      customers: current.activeCustomers
    },
    previousWeek: previous ? {
      revenue: previous.totalRevenue,
      orders: previous.totalOrders,
      products: previous.totalProducts,
      customers: previous.activeCustomers
    } : null,
    trends: trend,
    loading,
    error
  };
}