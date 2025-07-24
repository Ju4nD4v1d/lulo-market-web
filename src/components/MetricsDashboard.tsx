import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart,
  Cell
} from 'recharts';
import { 
  Loader2, 
  AlertCircle, 
  Info, 
  TrendingUp, 
  Download,
  RefreshCw,
  Sparkles,
  Target,
  Award,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Activity
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import TotalWeeklyRevenueCard from './TotalWeeklyRevenueCard';
import TotalWeeklyOrdersCard from './TotalWeeklyOrdersCard';
import TotalWeeklyProductsCard from './TotalWeeklyProductsCard';
import TotalActiveCustomersCard from './TotalActiveCustomersCard';
import { useRevenueTrend } from '../hooks/useRevenueTrend';
import { useOrdersTrend } from '../hooks/useOrdersTrend';
import { useProductsTrend } from '../hooks/useProductsTrend';
import { useActiveCustomersTrend } from '../hooks/useActiveCustomersTrend';
import { loadTopProducts } from '../utils/loadTopProducts';

interface TopProductData {
  label: string;
  value: number;
  color?: string;
}


export const MetricsDashboard = () => {
  const { t } = useLanguage();
  const { storeId } = useStore();
  const [granularity, setGranularity] = useState<'week' | 'month'>('week');
  const [topProducts, setTopProducts] = useState<TopProductData[]>([]);
  const [topProductsLoading, setTopProductsLoading] = useState(true);
  const [topProductsError, setTopProductsError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Use the trend hooks for comprehensive data
  const { data: revenueTrendData, loading: revenueTrendLoading, error: revenueTrendError } = useRevenueTrend(
    storeId || '',
    granularity
  );
  const { data: ordersTrendData } = useOrdersTrend(storeId || '');
  const { data: productsTrendData } = useProductsTrend(storeId || '');
  const { data: customersTrendData } = useActiveCustomersTrend(storeId || '');

  // Enhanced color palette for professional design
  const colorPalette = {
    primary: '#C8E400',
    secondary: '#A3C700',
    accent: '#7A8B00',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    purple: '#8B5CF6',
    pink: '#EC4899',
    orange: '#F97316',
    teal: '#14B8A6',
    indigo: '#6366F1',
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827'
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
      csvData.push([t('metrics.exportWeeklyRevenue'), formatter.format(currentRevenue), formatter.format(previousRevenue), revenueChange + '%']);
      
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
          csvData.push([item.label, formatter.format(item.value)]);
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

  useEffect(() => {
    if (storeId) {
      fetchTopProducts();
    }
  }, [storeId]);

  const granularityOptions = [
    { id: 'week', label: t('metrics.week') },
    { id: 'month', label: t('metrics.month') }
  ] as const;

  const formatter = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD'
  });

  const renderRevenueTrendContent = () => {
    if (revenueTrendLoading) {
      return (
        <div className="flex items-center justify-center h-80">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-[#C8E400] animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-600">{t('metrics.loadingRevenue')}</p>
          </div>
        </div>
      );
    }

    if (revenueTrendError) {
      return (
        <div className="flex flex-col items-center justify-center h-80 text-red-600">
          <div className="p-4 bg-red-50 rounded-full mb-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <p className="text-lg font-semibold text-gray-900 mb-2">{t('metrics.unableToLoadRevenue')}</p>
          <p className="text-sm text-gray-600 mb-4">{revenueTrendError}</p>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-[#C8E400] text-white rounded-lg hover:bg-[#A3C700] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            {t('metrics.retry')}
          </button>
        </div>
      );
    }

    return (
      <div className="relative h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={revenueTrendData}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C8E400" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#C8E400" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: '#6B7280' }}
              angle={granularity === 'month' ? -45 : 0}
              textAnchor={granularity === 'month' ? 'end' : 'middle'}
              height={granularity === 'month' ? 60 : 30}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6B7280' }} 
              tickFormatter={(v) => formatter.format(Number(v))}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value: number) => [formatter.format(value), t('metrics.revenue')]}
              labelStyle={{ color: '#374151' }}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                padding: '12px'
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#C8E400"
              strokeWidth={3}
              fill="url(#revenueGradient)"
              dot={{ fill: '#C8E400', strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, stroke: '#C8E400', strokeWidth: 3, fill: '#FFF' }}
            />
          </AreaChart>
        </ResponsiveContainer>
        {revenueTrendData.length < 2 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
            <div className="p-4 bg-blue-50 rounded-full mb-4">
              <Info className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-gray-900 font-semibold mb-2">{t('metrics.buildingInsights')}</p>
            <p className="text-gray-600 text-sm text-center">{t('metrics.moreDataSoon')}</p>
          </div>
        )}
      </div>
    );
  };

  const renderTopProductsContent = () => {
    // Loading state
    if (topProductsLoading) {
      return (
        <div className="flex items-center justify-center h-80">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-[#C8E400] animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-600">{t('metrics.loadingProducts')}</p>
          </div>
        </div>
      );
    }

    // Error state
    if (topProductsError) {
      return (
        <div className="flex flex-col items-center justify-center h-80 text-red-600">
          <div className="p-4 bg-red-50 rounded-full mb-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <p className="text-lg font-semibold text-gray-900 mb-2">{t('metrics.unableToLoadProducts')}</p>
          <p className="text-sm text-gray-600 mb-4">{topProductsError}</p>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-[#C8E400] text-white rounded-lg hover:bg-[#A3C700] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            {t('metrics.retry')}
          </button>
        </div>
      );
    }

    // No data state
    if (topProducts.length === 0) {
      return (
        <div className="h-80 flex flex-col items-center justify-center">
          <div className="p-4 bg-blue-50 rounded-full mb-4">
            <BarChart3 className="w-12 h-12 text-blue-500" />
          </div>
          <p className="text-lg font-semibold text-gray-900 mb-2">{t('metrics.noProductSales')}</p>
          <p className="text-sm text-gray-600 text-center">{t('metrics.startSelling')}</p>
        </div>
      );
    }

    // Chart with data
    return (
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={topProducts} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
            <defs>
              {topProducts.map((product, index) => (
                <linearGradient key={`gradient-${index}`} id={`productGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={product.color} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={product.color} stopOpacity={0.6}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#6B7280' }}
              angle={-45}
              textAnchor="end"
              interval={0}
              height={80}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6B7280' }} 
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value: number) => [value, t('metrics.unitsSold')]}
              labelStyle={{ color: '#374151' }}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                padding: '12px'
              }}
            />
            <Bar
              dataKey="value"
              radius={[8, 8, 0, 0]}
              fill={(data) => data.color}
            >
              {topProducts.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={`url(#productGradient-${index})`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-[#C8E400] to-[#A3C700] rounded-2xl shadow-lg">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {t('metrics.title')}
                </h1>
                <p className="text-gray-600 mt-1">{t('metrics.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="text-sm font-medium">{t('metrics.refresh')}</span>
              </button>
              <button 
                onClick={handleExport}
                disabled={isExporting || !storeId}
                className="flex items-center gap-2 px-4 py-2 bg-[#C8E400] hover:bg-[#A3C700] text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
                <span className="text-sm font-medium">
                  {isExporting ? t('metrics.exporting') : t('metrics.export')}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {storeId && <TotalWeeklyProductsCard storeId={storeId} />}
          {storeId && <TotalActiveCustomersCard storeId={storeId} />}
          {storeId && <TotalWeeklyRevenueCard storeId={storeId} />}
          {storeId && <TotalWeeklyOrdersCard storeId={storeId} />}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Revenue Trend - Takes 2 columns */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200/50 p-8 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-[#C8E400]/20 to-[#A3C700]/20 rounded-xl">
                    <LineChartIcon className="w-6 h-6 text-[#C8E400]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{t('metrics.revenueTrend')}</h2>
                    <p className="text-gray-600 text-sm">{t('metrics.revenueTrendSubtitle')}</p>
                  </div>
                </div>

                {/* Enhanced Toggle */}
                <div className="flex items-center bg-gray-100 rounded-2xl p-1">
                  {granularityOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setGranularity(option.id)}
                      className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        granularity === option.id
                          ? 'bg-[#C8E400] text-white shadow-lg transform scale-105'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              {renderRevenueTrendContent()}
            </div>
          </div>

          {/* Top Products - Takes 1 column */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200/50 p-8 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-[#C8E400]/20 to-[#A3C700]/20 rounded-xl">
                  <PieChartIcon className="w-6 h-6 text-[#C8E400]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{t('metrics.topProducts')}</h2>
                  <p className="text-gray-600 text-sm">{t('metrics.topProductsSubtitle')}</p>
                </div>
              </div>
              {renderTopProductsContent()}
            </div>
          </div>
        </div>

        {/* Insights Section */}
        <div className="mt-8 bg-gradient-to-r from-[#C8E400]/10 to-[#A3C700]/10 rounded-3xl p-8 border border-[#C8E400]/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-[#C8E400] to-[#A3C700] rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{t('metrics.smartInsights')}</h3>
              <p className="text-gray-600">{t('metrics.smartInsightsSubtitle')}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/80 rounded-2xl p-6 border border-white/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900">{t('metrics.growthOpportunity')}</h4>
              </div>
              <p className="text-gray-600 text-sm">
                {t('metrics.growthOpportunityDesc')}
              </p>
            </div>
            
            <div className="bg-white/80 rounded-2xl p-6 border border-white/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900">{t('metrics.marketingFocus')}</h4>
              </div>
              <p className="text-gray-600 text-sm">
                {t('metrics.marketingFocusDesc')}
              </p>
            </div>
            
            <div className="bg-white/80 rounded-2xl p-6 border border-white/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <Award className="w-5 h-5 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900">{t('metrics.performance')}</h4>
              </div>
              <p className="text-gray-600 text-sm">
                {t('metrics.performanceDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};