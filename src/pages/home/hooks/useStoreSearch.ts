import { useEffect, useCallback, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { StoreData } from '../../../types/store';
import { Product } from '../../../types/product';
import { SearchResultStore } from '../../../types/search';
import { useSearchStore } from '../../../stores/searchStore';
import {
  searchStoresAndProducts,
  sanitizeSearchQuery
} from '../../../services/searchService';

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

  // Local state
  const [products, setProducts] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  /**
   * Fetch all products on mount
   */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsRef = collection(db, 'products');
        const snapshot = await getDocs(productsRef);

        const productsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];

        // Deduplicate products by ID
        const uniqueProducts = Array.from(
          new Map(productsData.map(product => [product.id, product])).values()
        );

        setProducts(uniqueProducts);
      } catch (error) {
        console.error('Error fetching products for search:', error);
        setSearchError('Failed to load products');
      }
    };

    fetchProducts();
  }, []);

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
          distance: undefined,
        },
      };
      return fallbackStore;
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
