import React from 'react';
import { Loader2, AlertCircle, TrendingUp, TrendingDown, ShoppingBag } from 'lucide-react';
import { useOrdersTrend } from '../hooks/useOrdersTrend';

interface TotalWeeklyOrdersCardProps {
  storeId: string;
}

const TotalWeeklyOrdersCard: React.FC<TotalWeeklyOrdersCardProps> = ({ storeId }) => {
  const { data, loading, error } = useOrdersTrend(storeId);

  // Compute current week and find current/previous data
  const currentWeek = Math.ceil(new Date().getDate() / 7);
  const current = data.find(d => d.week === currentWeek);
  const previous = data.find(d => d.week === currentWeek - 1);

  // Calculate trend percentage
  const currentOrders = current?.orders ?? 0;
  const previousOrders = previous?.orders ?? 0;
  
  let trend: number | null = null;
  if (previous && previousOrders !== 0) {
    trend = ((currentOrders - previousOrders) / previousOrders) * 100;
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-center h-16">
          <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total Orders This Week</p>
            <div className="flex items-center text-red-600 space-x-2 mt-1">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">Couldn't load orders.</span>
            </div>
          </div>
          <div className="bg-primary-50 p-3 rounded-lg">
            <ShoppingBag className="w-6 h-6 text-primary-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm">Total Orders This Week</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{currentOrders}</h3>
          {trend !== null ? (
            <p
              className={`${trend >= 0 ? 'text-green-600' : 'text-red-600'} text-sm mt-1 flex items-center`}
            >
              {trend >= 0 ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              {`${trend >= 0 ? '+' : ''}${trend.toFixed(1)}% from last week`}
            </p>
          ) : (
            <p className="text-sm mt-1 text-gray-400">Not enough data to compare this week.</p>
          )}
        </div>
        <div className="bg-primary-50 p-3 rounded-lg">
          <ShoppingBag className="w-6 h-6 text-primary-600" />
        </div>
      </div>
    </div>
  );
};

export default TotalWeeklyOrdersCard;