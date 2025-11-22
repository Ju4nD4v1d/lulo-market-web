import type * as React from 'react';

import { StoreData } from '../../../types/store';
import { SearchResults } from '../../../types/search';
import { StoreCard } from './StoreCard';
import { EmptyState } from './EmptyState';
import styles from './StoreGrid.module.css';
import gridStyles from '../../../styles/grid.module.css';

interface VirtualStoreGridProps {
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
  onStoreClick: (store: StoreData, index: number) => void;
  onRetryFetch: () => void;
  onClearSearch: () => void;
  calculateDistance: (store: StoreData) => string;
  isStoreNew: (store: StoreData) => boolean;
  t: (key: string) => string;
  // Virtual scrolling props
  parentRef: React.RefObject<HTMLDivElement>;
  virtualItems: Array<{
    index: number;
    size: number;
    start: number;
    end: number;
    key: string | number;
  }>;
  totalSize: number;
  measureElement?: (node: HTMLElement | null) => void;
  getVirtualStore: (index: number) => StoreData | undefined;
}

/**
 * VirtualStoreGrid Component
 *
 * Virtualized version of StoreGrid that only renders visible stores
 * Uses @tanstack/react-virtual for efficient rendering of large lists
 *
 * Performance benefits:
 * - Handles 500+ stores without lag
 * - Smooth scrolling with minimal DOM nodes
 * - Automatic height measurement for responsive cards
 */
export const VirtualStoreGrid: React.FC<VirtualStoreGridProps> = ({
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
  parentRef,
  virtualItems,
  totalSize,
  measureElement,
  getVirtualStore,
}) => {
  return (
    <section className={styles.section}>
      <div className={styles.titleSection}>
        <div className={styles.badge}>
          <span className={styles.badgeText}>
            {isUsingSearch ? '🔍' : '✨'}
            {' '}
            {isUsingSearch ? (
              searchQuery ? `${t('home.search.resultsFor')} "${searchQuery}"` : t('home.search.badge')
            ) : (
              t('home.featuredRestaurants.badge')
            )}
          </span>
        </div>
        <h2 className={styles.heading}>
          {isUsingSearch ? (
            searchResults
              ? `${searchResults.totalCount} ${
                  searchResults.totalCount === 1 ? t('home.search.storeFound') : t('home.search.storesFound')
                }`
              : t('home.search.searching')
          ) : (
            t('home.featuredRestaurants.title')
          )}
        </h2>
        <p className={styles.description}>
          {isUsingSearch ? (
            isSearching ? (
              t('home.search.searchingDescription')
            ) : searchResults?.stores.length === 0 && !isUsingFallbackSearch ? (
              t('home.search.noResults')
            ) : isUsingFallbackSearch ? (
              t('home.search.fallbackMode')
            ) : (
              t('home.search.resultsDescription')
            )
          ) : (
            t('home.featuredRestaurants.description')
          )}
        </p>
      </div>

      {/* Loading State with Shimmer */}
      {loading || isSearching ? (
        <div className={gridStyles.storeGrid}>
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className={styles.shimmerCard}>
              <div className={styles.aspectSquare}>
                <div className={styles.shimmer} style={{ width: '100%', height: '100%' }}></div>
              </div>
              <div className={styles.shimmerContent}>
                <div className={styles.shimmer}></div>
                <div className={`${styles.shimmer} ${styles.shimmerMedium}`}></div>
                <div className={`${styles.shimmer} ${styles.shimmerTall}`}></div>
              </div>
            </div>
          ))}
        </div>
      ) : stores.length > 0 ? (
        stores.length > 10 ? (
          /* Virtual scrolling container for large lists */
          <div
            ref={parentRef}
            className={styles.virtualScrollContainer}
            style={{
              height: '100vh',
              maxHeight: '100vh',
              overflow: 'auto',
              contain: 'strict',
            }}
          >
            <div
              style={{
                height: `${totalSize}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {/* Virtual items positioned absolutely */}
              <div
                className={gridStyles.storeGrid}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItems[0]?.start ?? 0}px)`,
                }}
              >
                {virtualItems.map((virtualItem) => {
                  const store = getVirtualStore(virtualItem.index);
                  if (!store) return null;

                  return (
                    <div
                      key={virtualItem.key}
                      data-index={virtualItem.index}
                      ref={measureElement}
                    >
                      <StoreCard
                        store={store}
                        index={virtualItem.index}
                        isUsingFallbackSearch={isUsingFallbackSearch}
                        onStoreClick={onStoreClick}
                        calculateDistance={calculateDistance}
                        isStoreNew={isStoreNew}
                        t={t}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Normal grid for small lists (no virtual scrolling) */
          <div className={gridStyles.storeGrid}>
            {stores.map((store, index) => (
              <StoreCard
                key={store.id}
                store={store}
                index={index}
                isUsingFallbackSearch={isUsingFallbackSearch}
                onStoreClick={onStoreClick}
                calculateDistance={calculateDistance}
                isStoreNew={isStoreNew}
                t={t}
              />
            ))}
          </div>
        )
      ) : hasDataError || searchError ? (
        <EmptyState
          type="error"
          errorMessage={errorMessage}
          searchError={searchError}
          isOffline={isOffline}
          loading={loading}
          onRetry={onRetryFetch}
          t={t}
        />
      ) : searchQuery ? (
        <EmptyState
          type="no-search-results"
          searchQuery={searchQuery}
          onClearSearch={onClearSearch}
          t={t}
        />
      ) : (
        <EmptyState type="no-stores" t={t} />
      )}
    </section>
  );
};
