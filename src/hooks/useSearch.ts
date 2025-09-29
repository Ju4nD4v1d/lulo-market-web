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

  // Clear debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const search = useCallback(
    async (query: string, userLocation?: { lat: number; lng: number }) => {
      // Clear previous debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
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
        try {
          // This is a placeholder implementation
          // In a real application, this would call an API endpoint
          // For now, we'll return empty results to allow the component to work
          setResults([]);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Search failed');
          setResults(null);
        } finally {
          setIsSearching(false);
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