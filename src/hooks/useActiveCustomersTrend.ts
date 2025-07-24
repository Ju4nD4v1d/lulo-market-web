import { useState, useEffect } from 'react';
import { format, subMonths } from 'date-fns';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface UseActiveCustomersTrendReturn {
  current: number;
  previous: number | null;
  loading: boolean;
  error: string | null;
}

export function useActiveCustomersTrend(storeId: string): UseActiveCustomersTrendReturn {
  const [current, setCurrent] = useState<number>(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActiveCustomersTrend = async () => {
      if (!storeId) {
        setCurrent(0);
        setPrevious(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Compute month keys
        const now = new Date();
        const thisKey = format(now, 'yyyy-MM');
        const prevKey = format(subMonths(now, 1), 'yyyy-MM');

        const currentRef = doc(db, 'monthlyRevenueSummary', `${storeId}_${thisKey}`);
        const prevRef = doc(db, 'monthlyRevenueSummary', `${storeId}_${prevKey}`);

        const [currentSnap, prevSnap] = await Promise.all([
          getDoc(currentRef),
          getDoc(prevRef)
        ]);

        const currentActiveCustomers = currentSnap.exists()
          ? (currentSnap.data().activeCustomers ?? 0)
          : 0;

        const previousActiveCustomers = prevSnap.exists()
          ? (prevSnap.data().activeCustomers ?? 0)
          : null;

        setCurrent(currentActiveCustomers);
        setPrevious(previousActiveCustomers);

      } catch (err) {
        console.error('Error fetching active customers trend:', err);
        setError('Failed to load active customers data');
        setCurrent(0);
        setPrevious(null);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveCustomersTrend();
  }, [storeId]);

  return { current, previous, loading, error };
}