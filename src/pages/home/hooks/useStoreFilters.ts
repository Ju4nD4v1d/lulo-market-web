import { useMemo } from 'react';
import { StoreData } from '../../../types/store';
import { useSearchStore } from '../../../stores/searchStore';

interface UseStoreFiltersOptions {
  stores: StoreData[];
}

interface UseStoreFiltersReturn {
  filteredStores: StoreData[];
  displayedStores: StoreData[];
}

/**
 * useStoreFilters Hook
 *
 * Manages store filtering logic:
 * - Search mode vs browse mode
 * - Returns appropriate stores based on search state
 *
 * @param stores - All available stores
 *
 * @returns Filtered and displayed stores
 */
export const useStoreFilters = ({
  stores,
}: UseStoreFiltersOptions): UseStoreFiltersReturn => {
  const {
    searchQuery,
    filteredStores: searchFilteredStores,
    isUsingSearch,
  } = useSearchStore();

  /**
   * Determine which stores to display
   * Priority: Search results > All stores
   */
  const displayedStores = useMemo(() => {
    // If using search, show search results
    if (isUsingSearch && searchQuery) {
      return searchFilteredStores;
    }

    // Otherwise, show all stores
    return stores;
  }, [
    isUsingSearch,
    searchQuery,
    searchFilteredStores,
    stores,
  ]);

  return {
    filteredStores: searchFilteredStores,
    displayedStores,
  };
};
