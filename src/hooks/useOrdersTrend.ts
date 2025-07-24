import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import { db } from '../config/firebase';

interface WeeklyOrderData {
  week: number;
  orders: number;
}

interface UseOrdersTrendReturn {
  data: WeeklyOrderData[];
  loading: boolean;
  error: string | null;
}

export function useOrdersTrend(storeId: string): UseOrdersTrendReturn {
  const [data, setData] = useState<WeeklyOrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrdersTrend = async () => {
      if (!storeId) {
        setData([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Compute current month key in YYYY-MM format
        const currentMonthKey = format(new Date(), 'yyyy-MM');
        
        // Fetch the monthly summary document
        const docRef = doc(db, 'monthlyRevenueSummary', `${storeId}_${currentMonthKey}`);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const docData = docSnap.data();
          const weeklyArray = docData.weekly || [];
          
          // Extract weekly order data and sort by week ascending
          const ordersData = weeklyArray
            .filter((item: unknown): item is { week: number; orders: number } => {
              const i = item as { week?: number; orders?: number };
              return typeof i.week === 'number' && typeof i.orders === 'number';
            })
            .map((item) => ({
              week: item.week,
              orders: item.orders
            }))
            .sort((a: WeeklyOrderData, b: WeeklyOrderData) => a.week - b.week);
          
          setData(ordersData);
        } else {
          // Document doesn't exist, return empty data
          setData([]);
        }
      } catch (err) {
        console.error('Error fetching orders trend:', err);
        setError('Failed to load orders data');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrdersTrend();
  }, [storeId]);

  return { data, loading, error };
}