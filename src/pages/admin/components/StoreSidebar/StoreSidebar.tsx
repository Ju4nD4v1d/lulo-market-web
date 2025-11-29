/**
 * StoreSidebar - Sidebar with list of all stores
 * Allows searching and selecting stores
 */

import { useState, useMemo } from 'react';
import { Search, Store, RefreshCw, Loader2, AlertCircle, CheckCircle, Wrench } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';
import type { StoreData } from '../../../../types/store';
import styles from './StoreSidebar.module.css';

interface StoreSidebarProps {
  stores: StoreData[];
  isLoading: boolean;
  error: Error | null;
  selectedStoreId: string | null;
  activeView: 'store' | 'tools';
  onSelectStore: (store: StoreData) => void;
  onSelectTools: () => void;
  onRefresh: () => void;
}

export const StoreSidebar = ({
  stores,
  isLoading,
  error,
  selectedStoreId,
  activeView,
  onSelectStore,
  onSelectTools,
  onRefresh
}: StoreSidebarProps) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStores = useMemo(() => {
    if (!searchQuery.trim()) return stores;
    const query = searchQuery.toLowerCase();
    return stores.filter(store =>
      store.name.toLowerCase().includes(query) ||
      store.cuisine?.toLowerCase().includes(query) ||
      store.location?.address?.toLowerCase().includes(query)
    );
  }, [stores, searchQuery]);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <Store className={styles.titleIcon} />
          {t('admin.dashboard.stores')}
          <span className={styles.count}>{stores.length}</span>
        </h2>
        <button
          className={styles.refreshButton}
          onClick={onRefresh}
          disabled={isLoading}
          aria-label={t('admin.dashboard.refresh')}
        >
          <RefreshCw className={`${styles.refreshIcon} ${isLoading ? styles.spinning : ''}`} />
        </button>
      </div>

      <div className={styles.searchWrapper}>
        <Search className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder={t('admin.dashboard.searchStores')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className={styles.list}>
        {isLoading && !stores.length ? (
          <div className={styles.loading}>
            <Loader2 className={styles.loadingIcon} />
            <span>{t('admin.dashboard.loading')}</span>
          </div>
        ) : error ? (
          <div className={styles.error}>
            <AlertCircle className={styles.errorIcon} />
            <span>{t('admin.dashboard.loadError')}</span>
          </div>
        ) : filteredStores.length === 0 ? (
          <div className={styles.empty}>
            <span>{t('admin.dashboard.noStores')}</span>
          </div>
        ) : (
          filteredStores.map(store => (
            <button
              key={store.id}
              className={`${styles.storeItem} ${selectedStoreId === store.id ? styles.selected : ''}`}
              onClick={() => onSelectStore(store)}
            >
              <div className={styles.storeImage}>
                {store.storeImage ? (
                  <img src={store.storeImage} alt={store.name} />
                ) : (
                  <Store className={styles.storePlaceholder} />
                )}
              </div>
              <div className={styles.storeInfo}>
                <span className={styles.storeName}>{store.name}</span>
                <span className={styles.storeDetails}>
                  {store.cuisine && t(`store.cuisine.${store.cuisine}`)}
                </span>
              </div>
              <div className={styles.storeStatus}>
                {store.stripeEnabled ? (
                  <CheckCircle className={styles.statusEnabled} />
                ) : (
                  <AlertCircle className={styles.statusDisabled} />
                )}
              </div>
            </button>
          ))
        )}
      </div>

      <div className={styles.footer}>
        <button
          className={`${styles.toolsButton} ${activeView === 'tools' ? styles.toolsActive : ''}`}
          onClick={onSelectTools}
        >
          <Wrench className={styles.toolsIcon} />
          {t('admin.tools.title')}
        </button>
      </div>
    </aside>
  );
};
