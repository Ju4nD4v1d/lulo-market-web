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
import { Loader2, AlertCircle, Info } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import TotalWeeklyRevenueCard from './TotalWeeklyRevenueCard';
import TotalWeeklyOrdersCard from './TotalWeeklyOrdersCard';
import TotalWeeklyProductsCard from './TotalWeeklyProductsCard';
import TotalActiveCustomersCard from './TotalActiveCustomersCard';
import { useRevenueTrend } from '../hooks/useRevenueTrend';
import { loadTopProducts } from '../utils/loadTopProducts';

interface TopProductData {
  label: string;
  value: number;
}

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

  const formatter = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD'
  });

  const renderRevenueTrendContent = () => {
    if (revenueTrendLoading) {
      return (
        <div className="flex items-center justify-center h-60">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
      );
    }

    if (revenueTrendError) {
      return (
        <div className="flex flex-col items-center justify-center h-60 text-red-600">
          <AlertCircle className="w-12 h-12 mb-3 text-red-400" />
          <p className="text-sm font-medium">Could not load data</p>
          <p className="text-xs text-red-500 mt-1">{revenueTrendError}</p>
        </div>
      );
    }

    return (
      <div className="relative bg-white rounded-2xl shadow-sm p-6" style={{ height: 260 }}>
        <ResponsiveContainer>
          <LineChart data={revenueTrendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12 }}
              angle={granularity === 'month' ? -45 : 0}
              textAnchor={granularity === 'month' ? 'end' : 'middle'}
              height={granularity === 'month' ? 60 : 30}
            />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => formatter.format(Number(v))} />
            <Tooltip
              formatter={(value: number) => [formatter.format(value), 'Revenue']}
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
        {revenueTrendData.length < 2 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/75">
            <Info className="w-6 h-6 text-gray-400 mb-2" />
            <p className="text-gray-500 text-sm">More data coming soon!</p>
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
        <div className="h-48 flex flex-col items-center justify-center text-gray-400">
          <Info className="w-6 h-6 mb-1" />
          <p className="text-sm">No sales data yet.</p>
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
              interval={0}
              height={60}
            />
            <YAxis tick={{ fontSize: 12 }} label={{ value: 'Units Sold', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              formatter={(value: number) => [value, 'Units Sold']}
              labelStyle={{ color: '#374151' }}
            />
            <Bar
              dataKey="value"
              fill="#C7E402"
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
        {storeId && <TotalActiveCustomersCard storeId={storeId} />}
        {storeId && <TotalWeeklyRevenueCard storeId={storeId} />}
        {storeId && <TotalWeeklyOrdersCard storeId={storeId} />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{t('metrics.revenueTrend')}</h2>

            {/* Toggle */}
            <div className="flex items-center space-x-2">
              {granularityOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setGranularity(option.id)}
                  className={`px-4 py-1 rounded-full text-sm font-medium cursor-pointer ${
                    granularity === option.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          {renderRevenueTrendContent()}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('metrics.topProducts')}</h2>
          <div className="h-80">
            {renderTopProductsContent()}
          </div>
        </div>
      </div>
    </div>
  );
};