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
import { ShoppingBag, TrendingUp, Users, Package, Loader2, AlertCircle, BarChart3 } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import TotalWeeklyRevenueCard from './TotalWeeklyRevenueCard';
import { useRevenueTrend } from '../hooks/useRevenueTrend';

const mockData = {
  topProducts: [
    { name: 'Product A', sales: 45 },
    { name: 'Product B', sales: 38 },
    { name: 'Product C', sales: 31 },
    { name: 'Product D', sales: 25 },
    { name: 'Product E', sales: 22 }
  ]
};

const StatCard = ({ title, value, icon: Icon, trend }: { title: string; value: string; icon: React.ElementType; trend?: string }) => (
  <div className="bg-white rounded-xl p-6 border border-gray-200">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
        {trend && (
          <p className="text-green-600 text-sm mt-1">
            <TrendingUp className="w-4 h-4 inline mr-1" />
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

  // Use the new revenue trend hook
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

    // Chart with data
    return (
      <div className="h-full">
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
        
        {/* Insufficient data helper text */}
        {revenueTrendData.length === 1 && (
          <div className="mt-2 text-center">
            <p className="text-xs text-gray-500">
              Not enough data to show trend. More data points will improve the visualization.
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">{t('metrics.title')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t('metrics.orders')}
          value="156"
          icon={ShoppingBag}
          trend="+8.2% from last month"
        />
        <StatCard
          title={t('metrics.productsSold')}
          value="892"
          icon={Package}
          trend="+15.3% from last month"
        />
        <StatCard
          title={t('metrics.activeCustomers')}
          value="432"
          icon={Users}
          trend="+5.7% from last month"
        />
        {storeId && <TotalWeeklyRevenueCard storeId={storeId} />}
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
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockData.topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#C8E400" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};