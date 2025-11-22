import type * as React from 'react';

import clsx from 'clsx';
import styles from './EmptyState.module.css';
import buttonStyles from '../../../styles/button.module.css';

interface EmptyStateProps {
  type: 'error' | 'no-search-results' | 'no-stores';
  searchQuery?: string;
  errorMessage?: string;
  searchError?: string;
  isOffline?: boolean;
  loading?: boolean;
  onRetry?: () => void;
  onClearSearch?: () => void;
  t: (key: string) => string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  searchQuery,
  errorMessage,
  searchError,
  isOffline,
  loading,
  onRetry,
  onClearSearch,
  t,
}) => {
  if (type === 'error') {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={clsx(styles.iconContainer, styles.iconError)}>
            {isOffline ? (
              <svg style={{ width: '100%', height: '100%' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636L5.636 18.364M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM8 12h8" />
              </svg>
            ) : (
              <svg style={{ width: '100%', height: '100%' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            )}
          </div>
          <h3 className={styles.heading}>
            {searchError ? t('error.searchError') :
             isOffline ? t('error.offline') : t('error.connection')}
          </h3>
          <p className={styles.description}>
            {searchError || errorMessage}
          </p>
          <div className={styles.actions}>
            <button
              onClick={onRetry}
              disabled={loading}
              className={clsx(buttonStyles.button, buttonStyles.primary, buttonStyles.fullWidth)}
            >
              {loading ? t('error.retrying') : t('error.tryAgain')}
            </button>
            {isOffline && (
              <div className={styles.helperText}>
                <p>• {t('error.checkConnection')}</p>
                <p>• {t('error.checkWifi')}</p>
                <p>• {t('error.tryRefresh')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'no-search-results') {
    return (
      <div className={styles.container}>
        <div>
          <div className={clsx(styles.iconContainer, styles.iconGray)}>
            <svg style={{ width: '100%', height: '100%' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className={styles.heading}>{t('home.search.noResults')}</h3>
          <p className={styles.descriptionLarge}>
            {t('home.search.noResultsMessage')} "{searchQuery}"
          </p>
          <button
            onClick={onClearSearch}
            className={clsx(buttonStyles.button, buttonStyles.primary)}
          >
            {t('home.search.clearSearch')}
          </button>
        </div>
      </div>
    );
  }

  // type === 'no-stores'
  return (
    <div className={styles.container}>
      <div>
        <div className={clsx(styles.iconContainer, styles.iconGray)}>
          <svg style={{ width: '100%', height: '100%' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h3 className={styles.heading}>{t('empty.noStores')}</h3>
        <p className={styles.descriptionLarge}>
          {t('empty.noStoresMessage')}
        </p>
      </div>
    </div>
  );
};
