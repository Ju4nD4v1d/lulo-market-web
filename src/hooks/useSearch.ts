import { useState, useCallback, useRef, useEffect } from 'react';
import { SearchResultStore, SearchOptions } from '../types/search';

interface UseSearchReturn {
  isSearching: boolean;
  results: SearchResultStore[] | null;
  error: string | null;
  search: (query: string, userLocation?: { lat: number; lng: number }) => Promise<void>;
  trackClick: (store: SearchResultStore, position: number) => Promise<void>;
  clearResults: () => void;
}

export const useSearch = (options: SearchOptions = {}): UseSearchReturn => {
  const {
    enableLocation = true,
    debounceMs = 300,
    minQueryLength = 2
  } = options;

  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResultStore[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Clear debounce timer and abort ongoing requests on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const search = useCallback(
    async (query: string, userLocation?: { lat: number; lng: number }) => {
      // Clear previous debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Abort any ongoing search request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Check minimum query length
      if (query.length < minQueryLength) {
        setResults(null);
        setError(null);
        setIsSearching(false);
        return;
      }

      // Set searching state immediately
      setIsSearching(true);
      setError(null);

      // Debounce the actual search
      debounceTimerRef.current = setTimeout(async () => {
        // Create new AbortController for this request
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        try {
          // This is a placeholder implementation
          // In a real application, this would call an API endpoint with the abort signal
          // Example: const response = await fetch(url, { signal: abortController.signal })

          // Simulate API delay for testing
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(resolve, 100);
            abortController.signal.addEventListener('abort', () => {
              clearTimeout(timeout);
              reject(new Error('Request aborted'));
            });
          });

          // Check if request was aborted
          if (abortController.signal.aborted) {
            return;
          }

          // For now, we'll return empty results to allow the component to work
          setResults([]);
          setError(null);
        } catch (err) {
          // Don't set error state if request was aborted
          if (err instanceof Error && err.message === 'Request aborted') {
            return;
          }
          setError(err instanceof Error ? err.message : 'Search failed');
          setResults(null);
        } finally {
          // Only update searching state if this request wasn't aborted
          if (!abortController.signal.aborted) {
            setIsSearching(false);
          }
        }
      }, debounceMs);
    },
    [debounceMs, minQueryLength]
  );

  const trackClick = useCallback(
    async (store: SearchResultStore, position: number) => {
      try {
        // This is a placeholder for analytics tracking
        // In a real application, this would send analytics data to a backend
        console.log('Search click tracked:', {
          storeId: store.id,
          storeName: store.name,
          position,
          matchType: store.matchType,
          relevanceScore: store.relevanceScore
        });
      } catch (err) {
        console.error('Failed to track search click:', err);
      }
    },
    []
  );

  const clearResults = useCallback(() => {
    setResults(null);
    setError(null);
    setIsSearching(false);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  return {
    isSearching,
    results,
    error,
    search,
    trackClick,
    clearResults
  };
};