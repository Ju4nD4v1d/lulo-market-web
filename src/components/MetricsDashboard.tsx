import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { Users, Loader2, AlertCircle, BarChart3 } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import TotalWeeklyRevenueCard from './TotalWeeklyRevenueCard';
import TotalWeeklyOrdersCard from './TotalWeeklyOrdersCard';
import TotalWeeklyProductsCard from './TotalWeeklyProductsCard';
import { useRevenueTrend } from '../hooks/useRevenueTrend';
import { loadTopProducts } from '../utils/loadTopProducts';

interface TopProductData {
  label: string;
  value: number;
}

const StatCard = ({ title, value, icon: Icon, trend }: { title: string; value: string; icon: React.ElementType; trend?: string }) => (
  <div className="bg-white rounded-xl p-6 border border-gray-200">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
        {trend && (
          <p className="text-green-600 text-sm mt-1">
            {trend}
          </p>
        )}
      </div>
      <div className="bg-primary-50 p-3 rounded-lg">
        <Icon className="w-6 h-6 text-primary-600" />
      </div>
    </div>
  </div>
);

export const MetricsDashboard = () => {
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const [storeId, setStoreId] = useState<string | null>(null);
  const [granularity, setGranularity] = useState<'week' | 'month'>('week');
  const [topProducts, setTopProducts] = useState<TopProductData[]>([]);
  const [topProductsLoading, setTopProductsLoading] = useState(true);
  const [topProductsError, setTopProductsError] = useState<string | null>(null);

  // Use the revenue trend hook
  const { data: revenueTrendData, loading: revenueTrendLoading, error: revenueTrendError } = useRevenueTrend(
    storeId || '',
    granularity
  );

  useEffect(() => {
    const fetchStoreId = async () => {
      const storesRef = collection(db, 'stores');
      const q = query(storesRef, where('ownerId', '==', currentUser?.uid));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setStoreId(snapshot.docs[0].id);
      }
    };

    if (currentUser) {
      fetchStoreId();
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchTopProducts = async () => {
      if (!storeId) return;

      setTopProductsLoading(true);
      setTopProductsError(null);

      try {
        const data = await loadTopProducts(storeId);
        setTopProducts(data);
      } catch (error) {
        console.error('Error loading top products:', error);
        setTopProductsError('Failed to load top products');
      } finally {
        setTopProductsLoading(false);
      }
    };

    if (storeId) {
      fetchTopProducts();
    }
  }, [storeId]);

  const granularityOptions = [
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' }
  ] as const;

  const renderRevenueTrendContent = () => {
    // Loading state
    if (revenueTrendLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
      );
    }

    // Error state
    if (revenueTrendError) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-red-600">
          <AlertCircle className="w-12 h-12 mb-3 text-red-400" />
          <p className="text-sm font-medium">Could not load data</p>
          <p className="text-xs text-red-500 mt-1">{revenueTrendError}</p>
        </div>
      );
    }

    // No data state
    if (revenueTrendData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <BarChart3 className="w-12 h-12 mb-3 text-gray-400" />
          <p className="text-sm font-medium">No data available</p>
          <p className="text-xs text-gray-400 mt-1">Revenue data will appear here once you start making sales</p>
        </div>
      );
    }

    // Chart with data - adjust height based on whether we need helper text
    const hasInsufficientData = revenueTrendData.length === 1;
    const chartHeight = hasInsufficientData ? 'calc(100% - 2rem)' : '100%';

    return (
      <div className="h-full flex flex-col">
        <div className="flex-1" style={{ height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="label" 
                tick={{ fontSize: 12 }}
                angle={granularity === 'month' ? -45 : 0}
                textAnchor={granularity === 'month' ? 'end' : 'middle'}
                height={granularity === 'month' ? 60 : 30}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                labelStyle={{ color: '#374151' }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#5A7302" 
                strokeWidth={2}
                dot={{ fill: '#5A7302', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#5A7302', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Insufficient data helper text - positioned at bottom with reserved space */}
        {hasInsufficientData && (
          <div className="h-8 flex items-center justify-center">
            <p className="text-xs text-gray-500 text-center px-2">
              Not enough data to show trend. More data points will improve the visualization.
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderTopProductsContent = () => {
    // Loading state
    if (topProductsLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
      );
    }

    // Error state
    if (topProductsError) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-red-600">
          <AlertCircle className="w-12 h-12 mb-3 text-red-400" />
          <p className="text-sm font-medium">Could not load data</p>
          <p className="text-xs text-red-500 mt-1">{topProductsError}</p>
        </div>
      );
    }

    // No data state
    if (topProducts.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <BarChart3 className="w-12 h-12 mb-3 text-gray-400" />
          <p className="text-sm font-medium">No sales data available</p>
          <p className="text-xs text-gray-400 mt-1">Top products will appear here once you start making sales</p>
        </div>
      );
    }

    // Chart with data
    return (
      <div className="h-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={topProducts}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="label" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              formatter={(value: number) => [value, 'Units Sold']}
              labelStyle={{ color: '#374151' }}
            />
            <Bar 
              dataKey="value" 
              fill="#C8E400" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">{t('metrics.title')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {storeId && <TotalWeeklyProductsCard storeId={storeId} />}
        <StatCard
          title={t('metrics.activeCustomers')}
          value="432"
          icon={Users}
          trend="+5.7% from last month"
        />
        {storeId && <TotalWeeklyRevenueCard storeId={storeId} />}
        {storeId && <TotalWeeklyOrdersCard storeId={storeId} />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{t('metrics.revenueTrend')}</h2>
            
            {/* Segmented Control */}
            <div className="bg-gray-100 p-1 rounded-md">
              {granularityOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setGranularity(option.id)}
                  className={`
                    px-3 py-1.5 text-sm font-medium rounded transition-all duration-200
                    ${granularity === option.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Fixed height container that never shifts */}
          <div className="h-80 relative">
            {renderRevenueTrendContent()}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('metrics.topProducts')}</h2>
          <div className="h-80">
            {renderTopProductsContent()}
          </div>
        </div>
      </div>
    </div>
  );
};