import React from 'react';
import {
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  User2,
  Info
} from 'lucide-react';
import { useActiveCustomersTrend } from '../hooks/useActiveCustomersTrend';

interface TotalActiveCustomersCardProps {
  storeId: string;
}

const TotalActiveCustomersCard: React.FC<TotalActiveCustomersCardProps> = ({ storeId }) => {
  const { current, previous, loading, error } = useActiveCustomersTrend(storeId);

  // Calculate trend percentage when previous month exists and is non-zero
  let trend: number | null = null;
  if (previous !== null && previous !== 0) {
    trend = ((current - previous) / previous) * 100;
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
            <p className="text-gray-500 text-sm">Active Customers</p>
            <div className="flex items-center text-red-600 space-x-2 mt-1">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">Couldn't load data.</span>
            </div>
          </div>
          <div className="bg-primary-50 p-3 rounded-lg">
            <User2 className="w-6 h-6 text-primary-600" />
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
          <p className="text-gray-500 text-sm">Active Customers</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{current.toLocaleString()}</h3>
          {current === 0 || previous === null ? (
            <p className="text-gray-400 text-sm flex items-center space-x-2 mt-1">
              <Info className="w-4 h-4" />
              <span>More data coming soon!</span>
            </p>
          ) : trend !== null ? (
            <p
              className={`${
                trend >= 0 ? 'text-green-600' : 'text-red-600'
              } text-sm mt-1 flex items-center`}
            >
              {trend >= 0 ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              {`${trend >= 0 ? '+' : ''}${trend.toFixed(1)}% from last month`}
            </p>
          ) : null}
        </div>
        <div className="bg-primary-50 p-3 rounded-lg">
          <User2 className="w-6 h-6 text-primary-600" />
        </div>
      </div>
    </div>
  );
};

export default TotalActiveCustomersCard;
