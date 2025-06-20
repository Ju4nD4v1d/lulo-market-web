import { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { format } from 'date-fns';
import { db } from '../config/firebase';

interface RevenueTrendData {
  label: string;
  value: number;
}

interface UseRevenueTrendReturn {
  data: RevenueTrendData[];
  loading: boolean;
  error: string | null;
}

interface WeeklyEntry {
  week: number;
  revenue: number;
}

interface MonthlyData {
  month: string;
  totalRevenue: number;
  storeId: string;
}

export function useRevenueTrend(
  storeId: string,
  granularity: 'week' | 'month'
): UseRevenueTrendReturn {
  const [data, setData] = useState<RevenueTrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRevenueTrend = async () => {
      if (!storeId) {
        setData([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        if (granularity === 'week') {
          // Load weekly totals for the last 4 weeks
          const weeklyData = await fetchWeeklyData(storeId);
          setData(weeklyData);
        } else {
          // Load monthly totals for the last 12 months
          const monthlyData = await fetchMonthlyData(storeId);
          setData(monthlyData);
        }
      } catch (err) {
        console.error('Error fetching revenue trend:', err);
        setError('Failed to load revenue data');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueTrend();
  }, [storeId, granularity]);

  return { data, loading, error };
}

async function fetchWeeklyData(storeId: string): Promise<RevenueTrendData[]> {
  // Get current month key in YYYY-MM format
  const monthKey = format(new Date(), 'yyyy-MM');
  
  try {
    const weeklyDoc = await getDoc(doc(db, 'monthlyRevenueSummary', `${storeId}_${monthKey}`));
    const weeklyArr = weeklyDoc.exists() ? (weeklyDoc.data().weekly as WeeklyEntry[]) : [];
    
    // Sort by week, then take the last 4 entries
    const sorted = weeklyArr.sort((a, b) => a.week - b.week);
    return sorted.slice(-4).map(w => ({ 
      label: `Week ${w.week}`, 
      value: w.revenue 
    }));
  } catch (error) {
    console.error('Error fetching weekly data:', error);
    return [];
  }
}

async function fetchMonthlyData(storeId: string): Promise<RevenueTrendData[]> {
  try {
    const q = query(
      collection(db, 'monthlyRevenueSummary'),
      where('storeId', '==', storeId),
      orderBy('month', 'desc'),
      limit(12)
    );
    
    const snap = await getDocs(q);
    return snap.docs
      .map(d => d.data() as MonthlyData)
      .sort((a, b) => a.month.localeCompare(b.month))
      .map(m => ({ 
        label: m.month, 
        value: m.totalRevenue 
      }));
  } catch (error) {
    console.error('Error fetching monthly data:', error);
    return [];
  }
}