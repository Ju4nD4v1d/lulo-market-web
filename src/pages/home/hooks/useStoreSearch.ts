import { useEffect, useCallback } from 'react';
import { StoreData } from '../../../types/store';
import { SearchResultStore } from '../../../types/search';
import { useSearch } from '../../../hooks/useSearch';
import { useSearchStore } from '../../../stores/searchStore';

interface UseStoreSearchOptions {
  stores: StoreData[];
  onSearchResults?: (stores: StoreData[]) => void;
}

interface UseStoreSearchReturn {
  isSearching: boolean;
  searchError: string | null;
  clearSearch: () => void;
}

/**
 * useStoreSearch Hook
 *
 * Encapsulates all search logic including:
 * - API search with useSearch hook
 * - Client-side fallback search
 * - Search result conversion
 * - State management via Zustand
 *
 * @param stores - Array of all stores to search through
 * @param onSearchResults - Optional callback when search results change
 *
 * @returns Search state and control functions
 */
export const useStoreSearch = ({
  stores,
  onSearchResults
}: UseStoreSearchOptions): UseStoreSearchReturn => {
  // Zustand store
  const {
    searchQuery,
    setFilteredStores,
    setIsUsingSearch,
    setIsUsingFallbackSearch,
    clearSearch: clearSearchStore,
  } = useSearchStore();

  // Search hook for API search
  const {
    isSearching,
    results: searchResults,
    error: searchError,
    search,
    clearResults,
  } = useSearch({
    enableLocation: true,
    debounceMs: 300,
    minQueryLength: 2,
  });

  /**
   * Convert SearchResultStore to StoreData format
   * Merges API search results with full store data
   */
  const convertSearchResultToStoreData = useCallback(
    (searchResult: SearchResultStore): StoreData => {
      // Find full store data from our stores array
      const fullStore = stores.find((store) => store.id === searchResult.id);

      if (fullStore) {
        return {
          ...fullStore,
          // Add search-specific metadata
          searchMetadata: {
            matchType: searchResult.matchType,
            relevanceScore: searchResult.relevanceScore,
            matchedProducts: searchResult.matchedProducts,
            distance: searchResult.distance,
          },
        };
      }

      // Fallback if store not found in local data
      // Create minimal StoreData with required fields
      const fallbackStore: StoreData = {
        id: searchResult.id,
        name: searchResult.name,
        description: searchResult.description,
        location: { address: '', coordinates: { lat: 0, lng: 0 } },
        deliveryOptions: { delivery: false, pickup: false, shipping: false },
        ownerId: '',
        aboutUsSections: [],
        searchMetadata: {
          matchType: searchResult.matchType,
          relevanceScore: searchResult.relevanceScore,
          matchedProducts: searchResult.matchedProducts,
          distance: searchResult.distance,
        },
      };
      return fallbackStore;
    },
    [stores]
  );

  /**
   * Client-side fallback search
   * Searches through store names, descriptions, and products
   */
  const performClientSideSearch = useCallback(
    (query: string): StoreData[] => {
      const normalizedQuery = query.toLowerCase().trim();

      const results = stores.filter((store) => {
        // Search in store name
        if (store.name.toLowerCase().includes(normalizedQuery)) {
          return true;
        }

        // Search in store description
        if (store.description?.toLowerCase().includes(normalizedQuery)) {
          return true;
        }

        // Search in products if available
        if (store.products && Array.isArray(store.products)) {
          return store.products.some(
            (product) =>
              product.name.toLowerCase().includes(normalizedQuery) ||
              product.description.toLowerCase().includes(normalizedQuery)
          );
        }

        return false;
      });

      // Add search metadata to indicate this is a fallback result
      return results.map((store) => ({
        ...store,
        searchMetadata: {
          matchType: store.name.toLowerCase().includes(normalizedQuery)
            ? ('partial_name' as const)
            : ('description' as const),
          relevanceScore: store.name.toLowerCase().includes(normalizedQuery) ? 80 : 60,
          matchedProducts: [],
          distance: undefined,
        },
      }));
    },
    [stores]
  );

  /**
   * Handle search query changes
   * Triggers API search with fallback to client-side search
   */
  useEffect(() => {
    // Clear search if query is too short
    if (!searchQuery || searchQuery.trim().length < 2) {
      setIsUsingSearch(false);
      setIsUsingFallbackSearch(false);
      clearResults();
      return;
    }

    setIsUsingSearch(true);

    // Try API search first, fallback to client-side search if it fails
    search(searchQuery, {
      filters: {
        onlyAvailable: true,
      },
    }).catch(() => {
      setIsUsingFallbackSearch(true);

      // Perform client-side search
      const clientResults = performClientSideSearch(searchQuery);

      // Update filtered stores with client-side results
      setFilteredStores(clientResults);

      // Call optional callback
      if (onSearchResults) {
        onSearchResults(clientResults);
      }
    });
  /**
   * Dependency array explanation:
   * - searchQuery: Reactive value that triggers search
   * - search: Stable function from useSearch hook (doesn't change)
   * - clearResults: Stable function from useSearch hook (doesn't change)
   * - performClientSideSearch: useCallback with [stores] deps (stable reference)
   * - setFilteredStores, setIsUsingSearch, setIsUsingFallbackSearch: Zustand setters (stable references)
   * - onSearchResults: Optional callback, currently not used in HomePage
   *
   * Only searchQuery should trigger this effect. All other dependencies are stable.
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  /**
   * Update filtered stores when API search results change
   */
  useEffect(() => {
    if (searchResults && searchResults.length >= 0) {
      const convertedResults = searchResults.map(convertSearchResultToStoreData);
      setFilteredStores(convertedResults);

      // Call optional callback
      if (onSearchResults) {
        onSearchResults(convertedResults);
      }
    }
  /**
   * Dependency array explanation:
   * - searchResults: Reactive value from useSearch hook that triggers updates
   * - convertSearchResultToStoreData: useCallback with [stores] deps (stable reference)
   * - setFilteredStores: Zustand setter (stable reference)
   * - onSearchResults: Optional callback, currently not used in HomePage
   *
   * Only searchResults should trigger this effect. All other dependencies are stable.
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchResults]);

  /**
   * Clear all search state
   */
  const clearSearch = useCallback(() => {
    clearSearchStore();
    clearResults();
  }, [clearSearchStore, clearResults]);

  return {
    isSearching,
    searchError,
    clearSearch,
  };
};
