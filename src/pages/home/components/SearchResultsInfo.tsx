import type * as React from 'react';

import { X } from 'lucide-react';
import styles from './SearchResultsInfo.module.css';

interface SearchResultsInfoProps {
  searchQuery: string;
  resultCount: number;
  isSearching: boolean;
  isUsingFallbackSearch: boolean;
  onClearSearch: () => void;
  t: (key: string) => string;
}

/**
 * SearchResultsInfo Component
 *
 * Displays search feedback to users:
 * - Search query and result count
 * - Fallback search indicator
 * - Clear search button
 */
export const SearchResultsInfo: React.FC<SearchResultsInfoProps> = ({
  searchQuery,
  resultCount,
  isSearching,
  isUsingFallbackSearch,
  onClearSearch,
  t,
}) => {
  if (!searchQuery) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Search query and count */}
        <div className={styles.info}>
          <span className={styles.label}>
            {isSearching ? t('home.searching') : t('home.searchResults')}:
          </span>
          <span className={styles.query}>"{searchQuery}"</span>
          {!isSearching && (
            <span className={styles.count}>
              ({resultCount} {resultCount === 1 ? t('home.store') : t('home.stores')})
            </span>
          )}
        </div>

        {/* Fallback indicator */}
        {isUsingFallbackSearch && !isSearching && (
          <span className={styles.fallbackBadge}>
            {t('home.offlineSearch')}
          </span>
        )}

        {/* Clear button */}
        <button
          onClick={onClearSearch}
          className={styles.clearButton}
          aria-label={t('home.clearSearch')}
        >
          <X className={styles.clearIcon} />
          {t('home.clear')}
        </button>
      </div>
    </div>
  );
};
