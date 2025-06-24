import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import { db } from '../config/firebase';

interface WeeklyProductData {
  week: number;
  productsSold: number;
}

interface UseProductsTrendReturn {
  data: WeeklyProductData[];
  loading: boolean;
  error: string | null;
}

export function useProductsTrend(storeId: string): UseProductsTrendReturn {
  const [data, setData] = useState<WeeklyProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductsTrend = async () => {
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
          
          // Extract weekly products sold data and sort by week ascending
          const productsData = weeklyArray
            .filter((item: any) => typeof item.week === 'number' && typeof item.productsSold === 'number')
            .map((item: any) => ({
              week: item.week,
              productsSold: item.productsSold
            }))
            .sort((a: WeeklyProductData, b: WeeklyProductData) => a.week - b.week);
          
          setData(productsData);
        } else {
          // Document doesn't exist, return empty data
          setData([]);
        }
      } catch (err) {
        console.error('Error fetching products trend:', err);
        setError('Failed to load products data');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsTrend();
  }, [storeId]);

  return { data, loading, error };
}