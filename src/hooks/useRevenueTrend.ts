import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { format, subWeeks, subMonths } from 'date-fns';
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
        // Set placeholder data on error
        setData(getPlaceholderData(granularity));
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueTrend();
  }, [storeId, granularity]);

  return { data, loading, error };
}

async function fetchWeeklyData(storeId: string): Promise<RevenueTrendData[]> {
  // For now, return placeholder data
  // TODO: Implement actual Firestore calls to monthlyRevenueSummary/{storeId}_{YYYY-MM}
  
  const now = new Date();
  const weeklyData: RevenueTrendData[] = [];
  
  for (let i = 3; i >= 0; i--) {
    const weekDate = subWeeks(now, i);
    const weekLabel = `Week ${format(weekDate, 'MMM d')}`;
    
    // Placeholder revenue values
    const baseRevenue = 1200;
    const variance = Math.random() * 800 - 400; // ±400
    const revenue = Math.max(0, baseRevenue + variance);
    
    weeklyData.push({
      label: weekLabel,
      value: Math.round(revenue)
    });
  }
  
  return weeklyData;
}

async function fetchMonthlyData(storeId: string): Promise<RevenueTrendData[]> {
  // For now, return placeholder data
  // TODO: Implement actual Firestore calls to monthlyRevenueSummary documents
  
  const now = new Date();
  const monthlyData: RevenueTrendData[] = [];
  
  for (let i = 11; i >= 0; i--) {
    const monthDate = subMonths(now, i);
    const monthLabel = format(monthDate, 'MMM yyyy');
    
    // Placeholder revenue values with seasonal variation
    const baseRevenue = 4800;
    const seasonalMultiplier = 0.8 + (Math.sin((monthDate.getMonth() / 12) * 2 * Math.PI) * 0.3);
    const variance = Math.random() * 1600 - 800; // ±800
    const revenue = Math.max(0, (baseRevenue * seasonalMultiplier) + variance);
    
    monthlyData.push({
      label: monthLabel,
      value: Math.round(revenue)
    });
  }
  
  return monthlyData;
}

function getPlaceholderData(granularity: 'week' | 'month'): RevenueTrendData[] {
  if (granularity === 'week') {
    return [
      { label: 'Week Dec 1', value: 1200 },
      { label: 'Week Dec 8', value: 900 },
      { label: 'Week Dec 15', value: 1600 },
      { label: 'Week Dec 22', value: 1400 }
    ];
  } else {
    return [
      { label: 'Jan 2024', value: 4200 },
      { label: 'Feb 2024', value: 3800 },
      { label: 'Mar 2024', value: 4600 },
      { label: 'Apr 2024', value: 5200 },
      { label: 'May 2024', value: 4800 },
      { label: 'Jun 2024', value: 5400 },
      { label: 'Jul 2024', value: 5800 },
      { label: 'Aug 2024', value: 5600 },
      { label: 'Sep 2024', value: 5200 },
      { label: 'Oct 2024', value: 4800 },
      { label: 'Nov 2024', value: 4400 },
      { label: 'Dec 2024', value: 4600 }
    ];
  }
}