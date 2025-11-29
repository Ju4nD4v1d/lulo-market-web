/**
 * StoreMetricsTab - Reuses existing metrics components for admin view
 * Shows KPI cards, revenue trend, and top products
 */

import { useState, useEffect } from 'react';
import { Activity, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';
import { useRevenueTrend } from '../../../../hooks/useRevenueTrend';
import { loadTopProducts } from '../../../../utils/loadTopProducts';
import { KPICardGrid } from '../../../dashboard/sections/metrics/components/KPICardGrid';
import { RevenueTrendChart } from '../../../dashboard/sections/metrics/components/RevenueTrendChart';
import { TopProductsChart } from '../../../dashboard/sections/metrics/components/TopProductsChart';
import { colorPalette } from '../../../dashboard/sections/metrics/utils/chartConfig';
import styles from './StoreMetricsTab.module.css';

interface StoreMetricsTabProps {
  storeId: string;
}

interface TopProductData {
  label: string;
  value: number;
  color?: string;
}

export const StoreMetricsTab = ({ storeId }: StoreMetricsTabProps) => {
  const { t } = useLanguage();
  const [granularity, setGranularity] = useState<'week' | 'month'>('week');
  const [topProducts, setTopProducts] = useState<TopProductData[]>([]);
  const [topProductsLoading, setTopProductsLoading] = useState(true);
  const [topProductsError, setTopProductsError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use the trend hooks for comprehensive data
  const { data: revenueTrendData, loading: revenueTrendLoading, error: revenueTrendError } = useRevenueTrend(
    storeId,
    granularity
  );

  const fetchTopProducts = async () => {
    if (!storeId) return;

    setTopProductsLoading(true);
    setTopProductsError(null);

    try {
      const data = await loadTopProducts(storeId);
      // Add colors to products for enhanced visualization
      const enhancedData = data.map((product, index) => ({
        ...product,
        color: [colorPalette.primary, colorPalette.secondary, colorPalette.accent, colorPalette.success, colorPalette.info][index % 5]
      }));
      setTopProducts(enhancedData);
    } catch (error) {
      console.error('Error loading top products:', error);
      setTopProductsError('Failed to load top products');
    } finally {
      setTopProductsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchTopProducts();
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTopProducts();
  }, [storeId]);

  const granularityOptions = [
    { id: 'week', label: t('metrics.week') },
    { id: 'month', label: t('metrics.month') }
  ] as const;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h2 className={styles.title}>
            <Activity className={styles.titleIcon} />
            {t('admin.storeMetrics.title')}
          </h2>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={styles.refreshButton}
          >
            <RefreshCw className={`${styles.refreshIcon} ${isRefreshing ? styles.spinning : ''}`} />
            {t('metrics.refresh')}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiSection}>
        <KPICardGrid storeId={storeId} />
      </div>

      {/* Charts Section */}
      <div className={styles.chartsGrid}>
        {/* Revenue Trend */}
        <div className={styles.chartCard}>
          <RevenueTrendChart
            data={revenueTrendData}
            loading={revenueTrendLoading}
            error={revenueTrendError}
            granularity={granularity}
            onRefresh={handleRefresh}
            t={t}
          />
          {/* Granularity Toggle */}
          <div className={styles.granularityToggle}>
            {granularityOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setGranularity(option.id)}
                className={`${styles.toggleButton} ${granularity === option.id ? styles.toggleActive : ''}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className={styles.chartCard}>
          <TopProductsChart
            data={topProducts}
            loading={topProductsLoading}
            error={topProductsError}
            onRefresh={handleRefresh}
            t={t}
          />
        </div>
      </div>
    </div>
  );
};
