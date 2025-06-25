import { useState, useEffect } from 'react';
import { format, subMonths } from 'date-fns';

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
        const prevMonth = subMonths(now, 1);
        const prevKey = format(prevMonth, 'yyyy-MM');

        // TODO: Replace with actual Firestore calls
        // const thisDocRef = doc(db, 'monthlyRevenueSummary', `${storeId}_${thisKey}`);
        // const prevDocRef = doc(db, 'monthlyRevenueSummary', `${storeId}_${prevKey}`);
        // const [thisDoc, prevDoc] = await Promise.all([
        //   getDoc(thisDocRef),
        //   getDoc(prevDocRef)
        // ]);

        // Stubbed data for testing
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

        // Mock current month data
        const currentActiveCustomers = Math.floor(Math.random() * 500) + 100; // 100-600 customers
        
        // Mock previous month data (sometimes null to test that case)
        const hasPreviousData = Math.random() > 0.2; // 80% chance of having previous data
        const previousActiveCustomers = hasPreviousData 
          ? Math.floor(Math.random() * 400) + 80 // 80-480 customers
          : null;

        setCurrent(currentActiveCustomers);
        setPrevious(previousActiveCustomers);

        // Uncomment when implementing real Firestore calls:
        // const currentData = thisDoc.exists() ? thisDoc.data() : null;
        // const previousData = prevDoc.exists() ? prevDoc.data() : null;
        // 
        // setCurrent(currentData?.activeCustomers ?? 0);
        // setPrevious(previousData?.activeCustomers ?? null);

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