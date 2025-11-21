import React from 'react';
import { StoreData } from '../../../types/store';
import { SearchResults } from '../../../types/search';
import { VirtualStoreGrid } from '../../../components/home/VirtualStoreGrid';
import { SearchResultsInfo } from './SearchResultsInfo';
import { useVirtualStoreList } from '../hooks/useVirtualStoreList';
import styles from './StoreListContainer.module.css';

interface StoreListContainerProps {
  stores: StoreData[];
  loading: boolean;
  isSearching: boolean;
  isUsingSearch: boolean;
  isUsingFallbackSearch: boolean;
  hasDataError: boolean;
  searchError: string | null;
  searchQuery: string;
  searchResults: SearchResults | null;
  isOffline: boolean;
  errorMessage: string | null;
  onStoreClick: (store: StoreData, position?: number) => void;
  onRetryFetch: () => void;
  onClearSearch: () => void;
  calculateDistance: (store?: StoreData) => string;
  isStoreNew: (store: StoreData) => boolean;
  t: (key: string) => string;
}

/**
 * StoreListContainer Component
 *
 * Container for the store list section with:
 * - Search results info banner
 * - Virtual scrolling store grid for optimal performance
 * - All loading, error, and empty states
 *
 * Performance optimizations:
 * - Virtual scrolling with @tanstack/react-virtual
 * - Only renders visible store cards
 * - Handles 500+ stores efficiently
 */
export const StoreListContainer: React.FC<StoreListContainerProps> = ({
  stores,
  loading,
  isSearching,
  isUsingSearch,
  isUsingFallbackSearch,
  hasDataError,
  searchError,
  searchQuery,
  searchResults,
  isOffline,
  errorMessage,
  onStoreClick,
  onRetryFetch,
  onClearSearch,
  calculateDistance,
  isStoreNew,
  t,
}) => {
  // Virtual scrolling for performance with large lists
  const {
    parentRef,
    virtualItems,
    totalSize,
    measureElement,
    getVirtualStore,
  } = useVirtualStoreList({
    stores,
    estimatedItemHeight: 400, // Estimated height of StoreCard
    overscan: 5, // Render 5 extra items outside viewport
  });

  return (
    <div className={styles.container}>
      {/* Search results feedback */}
      {isUsingSearch && (
        <SearchResultsInfo
          searchQuery={searchQuery}
          resultCount={stores.length}
          isSearching={isSearching}
          isUsingFallbackSearch={isUsingFallbackSearch}
          onClearSearch={onClearSearch}
          t={t}
        />
      )}

      {/* Virtual store grid */}
      <VirtualStoreGrid
        stores={stores}
        loading={loading}
        isSearching={isSearching}
        isUsingSearch={isUsingSearch}
        isUsingFallbackSearch={isUsingFallbackSearch}
        hasDataError={hasDataError}
        searchError={searchError}
        searchQuery={searchQuery}
        searchResults={searchResults}
        isOffline={isOffline}
        errorMessage={errorMessage}
        onStoreClick={onStoreClick}
        onRetryFetch={onRetryFetch}
        onClearSearch={onClearSearch}
        calculateDistance={calculateDistance}
        isStoreNew={isStoreNew}
        t={t}
        // Virtual scrolling props
        parentRef={parentRef}
        virtualItems={virtualItems}
        totalSize={totalSize}
        measureElement={measureElement}
        getVirtualStore={getVirtualStore}
      />
    </div>
  );
};
