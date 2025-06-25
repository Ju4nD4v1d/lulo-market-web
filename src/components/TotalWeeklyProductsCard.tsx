import React from 'react';
import {
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Box,
  Info
} from 'lucide-react';
import { useProductsTrend } from '../hooks/useProductsTrend';

interface TotalWeeklyProductsCardProps {
  storeId: string;
}

const TotalWeeklyProductsCard: React.FC<TotalWeeklyProductsCardProps> = ({ storeId }) => {
  const { data, loading, error } = useProductsTrend(storeId);

  // Compute current week and find current/previous data
  const currentWeek = Math.ceil(new Date().getDate() / 7);
  const current = data.find(d => d.week === currentWeek);
  const previous = data.find(d => d.week === currentWeek - 1);

  // Calculate trend percentage
  const currentProductsSold = current?.productsSold ?? 0;
  const previousProductsSold = previous?.productsSold ?? 0;
  
  let trend: number | null = null;
  if (previous && previousProductsSold !== 0) {
    trend = ((currentProductsSold - previousProductsSold) / previousProductsSold) * 100;
  }

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-center h-16">
          <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-500 text-sm">Products Sold This Week</p>
            <div className="flex items-center text-red-600 space-x-2 mt-1">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">Couldn't load data.</span>
            </div>
          </div>
          <div className="bg-primary-50 p-3 rounded-lg">
            <Box className="w-6 h-6 text-primary-600" />
          </div>
        </div>
      </div>
    );
  }

  // Normal state with data
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm">Products Sold This Week</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-1">
            {currentProductsSold}
          </h3>
          {previous ? (
            <p
              className={`${
                trend !== null && trend >= 0 ? 'text-green-600' : 'text-red-600'
              } text-sm mt-1 flex items-center`}
            >
              {trend !== null && trend >= 0 ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              {trend !== null ? `${trend >= 0 ? '+' : ''}${trend.toFixed(1)}% from last week` : 'No change'}
            </p>
          ) : (
            <p className="text-gray-400 text-sm flex items-center space-x-2 mt-1">
              <Info className="w-4 h-4" />
              <span>More data coming soon!</span>
            </p>
          )}
        </div>
        <div className="bg-primary-50 p-3 rounded-lg">
          <Box className="w-6 h-6 text-primary-600" />
        </div>
      </div>
    </div>
  );
};

export default TotalWeeklyProductsCard;
