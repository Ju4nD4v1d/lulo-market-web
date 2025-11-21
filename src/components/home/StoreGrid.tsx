import React from 'react';
import {StoreData} from '../../types/store';
import {SearchResult} from '../../types/search';
import {StoreCard} from './StoreCard';
import {EmptyState} from './EmptyState';
import styles from './StoreGrid.module.css';
import gridStyles from '../../styles/grid.module.css';

interface StoreGridProps {
    stores: StoreData[];
    loading: boolean;
    isSearching: boolean;
    isUsingSearch: boolean;
    isUsingFallbackSearch: boolean;
    hasDataError: boolean;
    searchError?: string;
    searchQuery: string;
    searchResults?: SearchResult | null;
    isOffline: boolean;
    errorMessage: string;
    onStoreClick: (store: StoreData, index: number) => void;
    onRetryFetch: () => void;
    onClearSearch: () => void;
    calculateDistance: (store: StoreData) => string;
    isStoreNew: (createdAt?: Date) => boolean;
    t: (key: string) => string;
}

export const StoreGrid: React.FC<StoreGridProps> = ({
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
    return (
        <section className={styles.section}>
            <div className={styles.titleSection}>
                <div className={styles.badge}>
          <span className={styles.badgeText}>
            {isUsingSearch ? '🔍' : '✨'}
              {' '}
              {isUsingSearch ? (
                  searchQuery ? `Resultados para "${searchQuery}"` : 'Búsqueda'
              ) : (
                  t('home.featuredRestaurants.badge')
              )}
          </span>
                </div>
                <h2 className={styles.heading}>
                    {isUsingSearch ? (
                        searchResults
                            ? `${searchResults.totalCount} ${
                                searchResults.totalCount === 1 ? 'tienda encontrada' : 'tiendas encontradas'
                            }`
                            : 'Buscando...'
                    ) : (
                        t('home.featuredRestaurants.title')
                    )}
                </h2>
                <p className={styles.description}>
                    {isUsingSearch ? (
                        isSearching ? (
                            'Buscando productos y tiendas...'
                        ) : searchResults?.stores.length === 0 && !isUsingFallbackSearch ? (
                            'No se encontraron resultados. Intenta con otros términos.'
                        ) : isUsingFallbackSearch ? (
                            'Búsqueda local activada (API temporalmente no disponible)'
                        ) : (
                            'Resultados basados en nombres de tiendas y productos'
                        )
                    ) : (
                        t('home.featuredRestaurants.description')
                    )}
                </p>
            </div>

            {/* Loading State with Shimmer */}
            {loading || isSearching ? (
                <div className={gridStyles.storeGrid}>
                    {Array.from({length: 10}).map((_, index) => (
                        <div key={index} className={styles.shimmerCard}>
                            <div className={styles.aspectSquare}>
                                <div className={styles.shimmer} style={{width: '100%', height: '100%'}}></div>
                            </div>
                            <div className={styles.shimmerContent}>
                                <div className={styles.shimmer}></div>
                                <div className={`${styles.shimmer} ${styles.shimmerMedium}`}></div>
                                <div className={`${styles.shimmer} ${styles.shimmerTall}`}></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={gridStyles.storeGrid}>
                    {stores.length > 0 ? (
                        stores.map((store, index) => (
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
                        ))
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
                        <EmptyState type="no-search-results" searchQuery={searchQuery} onClearSearch={onClearSearch}
                                    t={t}/>
                    ) : (
                        <EmptyState type="no-stores" t={t}/>
                    )}
                </div>
            )}
        </section>
    );
};
