import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { DollarSign, TrendingUp, TrendingDown, Loader2, AlertCircle } from 'lucide-react';
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

  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  const trend =
    previousRevenue != null && previousRevenue !== 0
      ? ((currentRevenue ?? 0) - previousRevenue) / previousRevenue * 100
      : null;

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 flex items-center justify-center h-28">
        <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 flex items-center text-red-600 space-x-2">
        <AlertCircle className="w-5 h-5" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm">Total Revenue This Week</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-1">{formatter.format(currentRevenue ?? 0)}</h3>
          {trend != null && (
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
          )}
        </div>
        <div className="bg-primary-50 p-3 rounded-lg">
          <DollarSign className="w-6 h-6 text-primary-600" />
        </div>
      </div>
    </div>
  );
};

export default TotalWeeklyRevenueCard;
