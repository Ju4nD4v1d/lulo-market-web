import {useCallback, useEffect, useState} from 'react';
import {StoreData} from '../../../types';
import {SearchResultStore} from '../../../types/search';
import {useSearchStore} from '../../../stores/searchStore';
import {useAllActiveProductsQuery} from '../../../hooks/queries/useAllActiveProductsQuery';
import {sanitizeSearchQuery, searchStoresAndProducts} from '../../../services/searchService';

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
 * Client-side search using Fuse.js for fuzzy matching
 * Searches across store names, descriptions, and products
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
    clearSearch: clearSearchStore,
  } = useSearchStore();

  // TanStack Query for products (shared cache with HorizontalProductRow)
  const { products, error: productsError } = useAllActiveProductsQuery();

  // Local state
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(
    productsError ? 'Failed to load products' : null
  );

  /**
   * Convert SearchResultStore to StoreData format
   * Merges search results with full store data
   */
  const convertSearchResultToStoreData = useCallback(
    (searchResult: SearchResultStore): StoreData => {
      const fullStore = stores.find((store) => store.id === searchResult.id);

      if (fullStore) {
        return {
          ...fullStore,
          searchMetadata: {
            matchType: searchResult.matchType,
            relevanceScore: searchResult.relevanceScore,
            matchedProducts: searchResult.matchedProducts,
            distance: undefined,
          },
        };
      }

      // Fallback if store not found
        return {
          id: searchResult.id,
          name: searchResult.name,
          description: searchResult.description,
          location: {address: '', coordinates: {lat: 0, lng: 0}},
          deliveryOptions: {delivery: false, pickup: false, shipping: false},
          ownerId: '',
          aboutUsSections: [],
          searchMetadata: {
              matchType: searchResult.matchType,
              relevanceScore: searchResult.relevanceScore,
              matchedProducts: searchResult.matchedProducts,
              distance: undefined,
          },
      };
    },
    [stores]
  );

  /**
   * Perform Fuse.js search across stores and products
   */
  const performFuseSearch = useCallback(
    (query: string): StoreData[] => {
      // Sanitize query
      const sanitizedQuery = sanitizeSearchQuery(query);

      if (sanitizedQuery.length < 2) {
        return [];
      }

      // Perform comprehensive search using Fuse.js
      const searchResults = searchStoresAndProducts(stores, products, sanitizedQuery);

      // Convert search results to StoreData format
      return searchResults.map(convertSearchResultToStoreData);
    },
    [stores, products, convertSearchResultToStoreData]
  );

  /**
   * Handle search query changes
   * Performs client-side search using Fuse.js
   */
  useEffect(() => {
    // Clear search if query is too short
    if (!searchQuery || searchQuery.trim().length < 2) {
      setIsUsingSearch(false);
      setIsSearching(false);
      setSearchError(null);
      return;
    }

    setIsUsingSearch(true);
    setIsSearching(true);
    setSearchError(null);

    try {
      // Perform Fuse.js search
      const searchResults = performFuseSearch(searchQuery);

      // Update filtered stores
      setFilteredStores(searchResults);

      // Call optional callback
      if (onSearchResults) {
        onSearchResults(searchResults);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Search failed');
    } finally {
      setIsSearching(false);
    }
  /**
   * Dependency array explanation:
   * - searchQuery: Reactive value that triggers search
   * - performFuseSearch: useCallback with [stores, products, convertSearchResultToStoreData] deps
   * - setFilteredStores, setIsUsingSearch: Zustand setters (stable but not reactive)
   * - onSearchResults: Optional callback (not used in HomePage)
   *
   * We intentionally omit Zustand setters to prevent infinite loops.
   * Only searchQuery should trigger this effect.
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  /**
   * Clear all search state
   */
  const clearSearch = useCallback(() => {
    clearSearchStore();
    setIsSearching(false);
    setSearchError(null);
  }, [clearSearchStore]);

  return {
    isSearching,
    searchError,
    clearSearch,
  };
};
