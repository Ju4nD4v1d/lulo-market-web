import { useEffect, useState } from 'react';
import { Activity, Download, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';
import { useStore } from '../../../../context/StoreContext';
import { useRevenueTrend } from '../../../../hooks/useRevenueTrend';
import { useOrdersTrend } from '../../../../hooks/useOrdersTrend';
import { useProductsTrend } from '../../../../hooks/useProductsTrend';
import { useActiveCustomersTrend } from '../../../../hooks/useActiveCustomersTrend';
import { loadTopProducts } from '../../../../utils/loadTopProducts';
import { useMetricsExport } from './hooks/useMetricsExport';
import { RevenueTrendChart } from './components/RevenueTrendChart';
import { TopProductsChart } from './components/TopProductsChart';
import { KPICardGrid } from './components/KPICardGrid';
import { InsightsSection } from './components/InsightsSection';
import { colorPalette } from './utils/chartConfig';
import styles from './MetricsPage.module.css';

// Import test utilities for development debugging
import '../../../../utils/testAnalytics';
import { validateAnalyticsData, getCurrentWeekMetrics } from '../../../../utils/analytics';
import { getCurrentWeekKey } from '../../../../utils/dateUtils';

interface TopProductData {
  label: string;
  value: number;
  color?: string;
}

// Add debug functions to global scope for development
if (typeof window !== 'undefined') {
  (window as any).debugAnalytics = {
    async checkDataSource(storeId: string) {
      const validation = await validateAnalyticsData(storeId);
      console.log('=== ANALYTICS DEBUG ===');
      console.log('Data source:', validation.dataSource);
      console.log('Current week metrics:', validation.currentWeekMetrics);
      console.log('Top products count:', validation.topProducts.byQuantity.length);
      console.log('Active customers:', validation.activeCustomers);
      return validation;
    },

    async getRawMetrics(storeId: string) {
      const metrics = await getCurrentWeekMetrics(storeId);
      console.log('=== RAW METRICS ===');
      console.log('Total Revenue:', metrics.totalRevenue);
      console.log('Total Orders:', metrics.totalOrders);
      console.log('Total Products:', metrics.totalProducts);
      console.log('Active Customers:', metrics.activeCustomers);
      console.log('Last Updated:', metrics.lastUpdated);
      return metrics;
    },

    checkWeekCalculation() {
      console.log('=== WEEK CALCULATION ===');
      console.log('Current date:', new Date().toISOString());
      console.log('Current week key:', getCurrentWeekKey());
      console.log('Expected format: YYYY-WNN (e.g., 2025-W35)');
    }
  };

  console.log('🧪 Debug functions available:');
  console.log('  window.debugAnalytics.checkDataSource("MxOFNkEGVNrgaNfTaXlN")');
  console.log('  window.debugAnalytics.getRawMetrics("MxOFNkEGVNrgaNfTaXlN")');
  console.log('  window.debugAnalytics.checkWeekCalculation()');
}

export const MetricsPage = () => {
  const { t } = useLanguage();
  const { storeId } = useStore();
  const [granularity, setGranularity] = useState<'week' | 'month'>('week');
  const [topProducts, setTopProducts] = useState<TopProductData[]>([]);
  const [topProductsLoading, setTopProductsLoading] = useState(true);
  const [topProductsError, setTopProductsError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use the trend hooks for comprehensive data
  const { data: revenueTrendData, loading: revenueTrendLoading, error: revenueTrendError } = useRevenueTrend(
    storeId || '',
    granularity
  );
  const { data: ordersTrendData } = useOrdersTrend(storeId || '');
  const { data: productsTrendData } = useProductsTrend(storeId || '');
  const { data: customersTrendData } = useActiveCustomersTrend(storeId || '');

  // Use export hook
  const { isExporting, handleExport } = useMetricsExport({
    storeId,
    granularity,
    revenueTrendData,
    ordersTrendData,
    productsTrendData,
    customersTrendData,
    topProducts,
    t
  });

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
      if (storeId) {
        await fetchTopProducts();
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (storeId) {
      fetchTopProducts();
    }
  }, [storeId]);

  const granularityOptions = [
    { id: 'week', label: t('metrics.week') },
    { id: 'month', label: t('metrics.month') }
  ] as const;

  return (
    <div className={styles.page}>
      {/* Header Section */}
      <div className={styles.headerSection}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.titleSection}>
              <div className={styles.iconWrapper}>
                <Activity className={styles.icon} />
              </div>
              <div>
                <h1 className={styles.title}>{t('metrics.title')}</h1>
                <p className={styles.subtitle}>{t('metrics.subtitle')}</p>
              </div>
            </div>
            <div className={styles.actions}>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={styles.refreshButton}
              >
                <RefreshCw className={`${styles.buttonIcon} ${isRefreshing ? styles.spinning : ''}`} />
                <span className={styles.buttonText}>{t('metrics.refresh')}</span>
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting || !storeId}
                className={styles.exportButton}
              >
                <Download className={`${styles.buttonIcon} ${isExporting ? styles.bouncing : ''}`} />
                <span className={styles.buttonText}>
                  {isExporting ? t('metrics.exporting') : t('metrics.export')}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        {/* KPI Cards */}
        <KPICardGrid storeId={storeId} />

        {/* Charts Section */}
        <div className={styles.chartsGrid}>
          {/* Revenue Trend - Takes 2 columns */}
          <div className={styles.revenueTrendSection}>
            <div className={styles.revenueTrendCard}>
              <div className={styles.revenueTrendHeader}>
                <RevenueTrendChart
                  data={revenueTrendData}
                  loading={revenueTrendLoading}
                  error={revenueTrendError}
                  granularity={granularity}
                  onRefresh={handleRefresh}
                  t={t}
                />
              </div>

              {/* Granularity Toggle */}
              <div className={styles.granularityToggle}>
                {granularityOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setGranularity(option.id)}
                    className={`${styles.toggleButton} ${granularity === option.id ? styles.toggleButtonActive : ''}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Top Products - Takes 1 column */}
          <div className={styles.topProductsSection}>
            <TopProductsChart
              data={topProducts}
              loading={topProductsLoading}
              error={topProductsError}
              onRefresh={handleRefresh}
              t={t}
            />
          </div>
        </div>

        {/* Insights Section */}
        <InsightsSection t={t} />
      </div>
    </div>
  );
};

export default MetricsPage;
