import type * as React from 'react';

import {
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Info,
  Sparkles
} from 'lucide-react';
import { useCurrentWeekMetrics } from '../../../../../hooks/useCurrentWeekMetrics';

interface TotalWeeklyOrdersCardProps {
  storeId: string;
}

const TotalWeeklyOrdersCard: React.FC<TotalWeeklyOrdersCardProps> = ({ storeId }) => {
  const { current, loading, error, trend } = useCurrentWeekMetrics(storeId);

  // Extract orders data
  const currentOrders = current.totalOrders;
  const ordersTrend = trend.orders;

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200/50 p-6 backdrop-blur-sm">
        <div className="flex items-center justify-center h-24">
          <div className="text-center">
            <Loader2 className="w-6 h-6 text-primary-400 animate-spin mx-auto mb-2" />
            <p className="text-xs text-gray-500">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200/50 p-6 backdrop-blur-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Orders This Week</p>
            <div className="flex items-center text-red-600 space-x-2 mt-2">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Couldn't load data</span>
            </div>
          </div>
          <div className="p-3 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl">
            <ShoppingBag className="w-6 h-6 text-red-500" />
          </div>
        </div>
      </div>
    );
  }

  // Normal state
  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-200/50 p-6 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-500 text-sm font-medium mb-2">Total Orders This Week</p>
          <h3 className="text-3xl font-bold text-gray-900 mb-3 group-hover:text-primary-400 transition-colors">{currentOrders}</h3>
          {ordersTrend !== null ? (
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                ordersTrend >= 0 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {ordersTrend >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {`${ordersTrend >= 0 ? '+' : ''}${ordersTrend.toFixed(1)}%`}
              </div>
              <span className="text-gray-500 text-sm">from last week</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-400">
              <div className="flex items-center gap-1 px-3 py-1 bg-blue-50 rounded-full">
                <Info className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-600">Building insights</span>
              </div>
            </div>
          )}
        </div>
        <div className="relative">
          <div className="p-4 bg-gradient-to-br from-primary-400 to-primary-500 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          {ordersTrend !== null && ordersTrend > 0 && (
            <div className="absolute -top-1 -right-1 p-1 bg-green-500 rounded-full">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TotalWeeklyOrdersCard;
