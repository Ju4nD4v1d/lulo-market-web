import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Loader2,
  AlertCircle,
  Info,
  Sparkles
} from 'lucide-react';
import { format } from 'date-fns';
import { db } from '../config/firebase';

interface TotalWeeklyRevenueCardProps {
  storeId: string;
}

interface WeeklyEntry {
  week: number;
  revenue: number;
}

const TotalWeeklyRevenueCard: React.FC<TotalWeeklyRevenueCardProps> = ({ storeId }) => {
  const [currentRevenue, setCurrentRevenue] = useState<number | null>(null);
  const [previousRevenue, setPreviousRevenue] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const now = new Date();
        const weekOfMonth = Math.ceil(now.getDate() / 7);
        const monthKey = format(now, 'yyyy-MM');
        const summaryRef = doc(db, 'monthlyRevenueSummary', `${storeId}_${monthKey}`);
        const snapshot = await getDoc(summaryRef);

        if (!snapshot.exists()) {
          setCurrentRevenue(0);
          setPreviousRevenue(null);
          return;
        }

        const data = snapshot.data() as { weekly?: WeeklyEntry[] };
        const weekly = data.weekly || [];
        const current = weekly.find(w => w.week === weekOfMonth);
        const previous = weekly.find(w => w.week === weekOfMonth - 1);

        setCurrentRevenue(current?.revenue ?? 0);
        setPreviousRevenue(previous?.revenue ?? null);
      } catch (err) {
        console.error('Failed to load weekly revenue', err);
        setError('Failed to load revenue');
      } finally {
        setLoading(false);
      }
    };

    fetchRevenue();
  }, [storeId]);

  const formatter = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD'
  });
  const trend =
    previousRevenue != null && previousRevenue !== 0
      ? ((currentRevenue ?? 0) - previousRevenue) / previousRevenue * 100
      : null;

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200/50 p-6 backdrop-blur-sm">
        <div className="flex items-center justify-center h-24">
          <div className="text-center">
            <Loader2 className="w-6 h-6 text-[#C8E400] animate-spin mx-auto mb-2" />
            <p className="text-xs text-gray-500">Loading revenue...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200/50 p-6 backdrop-blur-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Revenue This Week</p>
            <div className="flex items-center text-red-600 space-x-2 mt-2">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Couldn't load data</span>
            </div>
          </div>
          <div className="p-3 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl">
            <DollarSign className="w-6 h-6 text-red-500" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-200/50 p-6 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-500 text-sm font-medium mb-2">Total Revenue This Week</p>
          <h3 className="text-3xl font-bold text-gray-900 mb-3 group-hover:text-[#C8E400] transition-colors">
            {formatter.format(currentRevenue ?? 0)}
          </h3>
          {trend != null ? (
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                trend >= 0 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {trend >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {`${trend >= 0 ? '+' : ''}${trend.toFixed(1)}%`}
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
          <div className="p-4 bg-gradient-to-br from-[#C8E400] to-[#A3C700] rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow">
            <DollarSign className="w-8 h-8 text-white" />
          </div>
          {trend != null && trend > 0 && (
            <div className="absolute -top-1 -right-1 p-1 bg-green-500 rounded-full">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TotalWeeklyRevenueCard;
