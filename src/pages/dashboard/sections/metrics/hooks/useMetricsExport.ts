import { useState } from 'react';
import { currencyFormatter } from '../utils/chartConfig';

interface TrendDataPoint {
  label: string;
  value: number;
}

interface OrderDataPoint {
  week: number;
  orders: number;
}

interface ProductDataPoint {
  week: number;
  products: number;
}

interface CustomerDataPoint {
  week: number;
  customers: number;
}

interface TopProductData {
  label: string;
  value: number;
}

interface UseMetricsExportParams {
  storeId: string | null;
  granularity: 'week' | 'month';
  revenueTrendData: TrendDataPoint[];
  ordersTrendData: OrderDataPoint[];
  productsTrendData: ProductDataPoint[];
  customersTrendData: CustomerDataPoint[];
  topProducts: TopProductData[];
  t: (key: string) => string;
}

export const useMetricsExport = ({
  storeId,
  granularity,
  revenueTrendData,
  ordersTrendData,
  productsTrendData,
  customersTrendData,
  topProducts,
  t
}: UseMetricsExportParams) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!storeId) return;

    setIsExporting(true);
    try {
      // Prepare CSV data
      const csvData = [];

      // Add header
      csvData.push([t('metrics.exportTitle')]);
      csvData.push([t('metrics.exportStoreId'), storeId]);
      csvData.push([t('metrics.exportDate'), new Date().toISOString().split('T')[0]]);
      csvData.push([t('metrics.exportTime'), new Date().toLocaleTimeString()]);
      csvData.push([t('metrics.exportGranularity'), t(`metrics.${granularity}`)]);
      csvData.push([]); // Empty line

      // Calculate current week KPIs
      const currentWeek = Math.ceil(new Date().getDate() / 7);

      // KPI Summary
      csvData.push([t('metrics.exportKpiSummary')]);
      csvData.push([t('metrics.exportMetric'), t('metrics.exportCurrentValue'), t('metrics.exportPreviousValue'), t('metrics.exportChange')]);

      // Revenue KPI
      const currentRevenue = revenueTrendData?.find(d => d.label.includes('Week'))?.value || 0;
      const previousRevenue = revenueTrendData?.find(d => d.label.includes('Week'))?.value || 0;
      const revenueChange = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(1) : t('metrics.exportNA');
      csvData.push([t('metrics.exportWeeklyRevenue'), currencyFormatter.format(currentRevenue), currencyFormatter.format(previousRevenue), revenueChange + '%']);

      // Orders KPI
      const currentOrders = ordersTrendData?.find(d => d.week === currentWeek)?.orders || 0;
      const previousOrders = ordersTrendData?.find(d => d.week === currentWeek - 1)?.orders || 0;
      const ordersChange = previousOrders > 0 ? ((currentOrders - previousOrders) / previousOrders * 100).toFixed(1) : t('metrics.exportNA');
      csvData.push([t('metrics.exportWeeklyOrders'), currentOrders, previousOrders, ordersChange + '%']);

      // Products KPI
      const currentProducts = productsTrendData?.find(d => d.week === currentWeek)?.products || 0;
      const previousProducts = productsTrendData?.find(d => d.week === currentWeek - 1)?.products || 0;
      const productsChange = previousProducts > 0 ? ((currentProducts - previousProducts) / previousProducts * 100).toFixed(1) : t('metrics.exportNA');
      csvData.push([t('metrics.exportWeeklyProducts'), currentProducts, previousProducts, productsChange + '%']);

      // Customers KPI
      const currentCustomers = customersTrendData?.find(d => d.week === currentWeek)?.customers || 0;
      const previousCustomers = customersTrendData?.find(d => d.week === currentWeek - 1)?.customers || 0;
      const customersChange = previousCustomers > 0 ? ((currentCustomers - previousCustomers) / previousCustomers * 100).toFixed(1) : t('metrics.exportNA');
      csvData.push([t('metrics.exportWeeklyCustomers'), currentCustomers, previousCustomers, customersChange + '%']);

      csvData.push([]); // Empty line

      // Revenue trend data
      if (revenueTrendData && revenueTrendData.length > 0) {
        csvData.push([t('metrics.exportRevenueTrendData')]);
        csvData.push([t('metrics.exportPeriod'), t('metrics.exportRevenueCurrency')]);
        revenueTrendData.forEach(item => {
          csvData.push([item.label, currencyFormatter.format(item.value)]);
        });
        csvData.push([]); // Empty line
      }

      // Orders trend data
      if (ordersTrendData && ordersTrendData.length > 0) {
        csvData.push([t('metrics.exportOrdersTrendData')]);
        csvData.push([t('metrics.exportWeek'), t('metrics.exportOrders')]);
        ordersTrendData.forEach(item => {
          csvData.push([`${t('metrics.exportWeekLabel')} ${item.week}`, item.orders]);
        });
        csvData.push([]); // Empty line
      }

      // Products trend data
      if (productsTrendData && productsTrendData.length > 0) {
        csvData.push([t('metrics.exportProductsTrendData')]);
        csvData.push([t('metrics.exportWeek'), t('metrics.exportProductsSold')]);
        productsTrendData.forEach(item => {
          csvData.push([`${t('metrics.exportWeekLabel')} ${item.week}`, item.products]);
        });
        csvData.push([]); // Empty line
      }

      // Customers trend data
      if (customersTrendData && customersTrendData.length > 0) {
        csvData.push([t('metrics.exportCustomersTrendData')]);
        csvData.push([t('metrics.exportWeek'), t('metrics.exportActiveCustomers')]);
        customersTrendData.forEach(item => {
          csvData.push([`${t('metrics.exportWeekLabel')} ${item.week}`, item.customers]);
        });
        csvData.push([]); // Empty line
      }

      // Top products data
      if (topProducts.length > 0) {
        csvData.push([t('metrics.exportTopProductsData')]);
        csvData.push([t('metrics.exportProductName'), t('metrics.exportUnitsSold')]);
        topProducts.forEach(product => {
          csvData.push([product.label, product.value]);
        });
        csvData.push([]); // Empty line
      }

      // Business insights
      csvData.push([t('metrics.exportBusinessInsights')]);
      csvData.push([t('metrics.exportInsightCategory'), t('metrics.exportDescription')]);
      csvData.push([t('metrics.growthOpportunity'), t('metrics.growthOpportunityDesc')]);
      csvData.push([t('metrics.marketingFocus'), t('metrics.marketingFocusDesc')]);
      csvData.push([t('metrics.performance'), t('metrics.performanceDesc')]);

      // Convert to CSV string
      const csvString = csvData.map(row =>
        row.map(cell =>
          typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
        ).join(',')
      ).join('\n');

      // Create and download file
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `lulo-market-analytics-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Show success message
      alert(t('metrics.exportSuccess'));

    } catch (error) {
      console.error('Export error:', error);
      alert(t('metrics.exportError'));
    } finally {
      setIsExporting(false);
    }
  };

  return { isExporting, handleExport };
};
