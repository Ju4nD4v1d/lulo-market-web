import { useState, useCallback } from 'react';
import { StoreData } from '../types/store';
import { useDataProvider } from '../services/DataProvider';
import { useNetworkStatus } from './useNetworkStatus';

/**
 * Custom hook for fetching and managing store data
 */
export const useStoreData = () => {
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasDataError, setHasDataError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isFetching, setIsFetching] = useState(false);

  const dataProvider = useDataProvider();
  const { isOffline, hasNetworkError } = useNetworkStatus();

  /**
   * Fetch stores from Firebase
   */
  const fetchStores = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (isFetching) {
      console.log('🚫 Fetch already in progress, skipping');
      return;
    }

    try {
      console.log('🔄 Starting fetchStores');
      setIsFetching(true);
      setLoading(true);
      setHasDataError(false);
      setErrorMessage('');

      // Check network connectivity first
      if (isOffline || hasNetworkError) {
        setHasDataError(true);
        setErrorMessage('No internet connection. Please check your network and try again.');
        setStores([]);
        setLoading(false);
        setIsFetching(false);
        return;
      }

      // Use real Firebase data
      const storesSnapshot = await dataProvider.getStores();
      const storesData = storesSnapshot.docs.map(
        (doc: { id: string; data: () => unknown }) => {
          const data = doc.data() as {
            createdAt?: { toDate?: () => Date };
            [key: string]: unknown;
          };
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          };
        }
      ) as StoreData[];

      if (storesData.length === 0) {
        setHasDataError(true);
        setErrorMessage('No stores available at the moment. Please try again later.');
      }

      setStores(storesData);
    } catch (error) {
      console.error('Error fetching stores:', error);
      setHasDataError(true);

      // Determine error type and set appropriate message
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          setErrorMessage('Network error. Please check your internet connection and try again.');
        } else if (error.message.includes('permission') || error.message.includes('auth')) {
          setErrorMessage('Unable to load stores. Please try refreshing the page.');
        } else {
          setErrorMessage('Something went wrong. Please try again later.');
        }
      } else {
        setErrorMessage('Unable to connect to our services. Please check your internet connection.');
      }

      setStores([]);
    } finally {
      console.log('✅ Fetch complete');
      setLoading(false);
      setIsFetching(false);
    }
  }, [isOffline, hasNetworkError, dataProvider, isFetching]);

  /**
   * Retry fetching stores
   */
  const retryFetch = useCallback(() => {
    fetchStores();
  }, [fetchStores]);

  return {
    stores,
    loading,
    hasDataError,
    errorMessage,
    fetchStores,
    retryFetch,
  };
};
