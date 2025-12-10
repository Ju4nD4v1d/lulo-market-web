/**
 * StoreSidebar - Admin navigation sidebar
 * Shows navigation menu and collapsible store list
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Store, RefreshCw, Loader2, AlertCircle, CheckCircle, Wrench, Truck, ChevronDown, ChevronUp } from 'lucide-react';
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
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [isStoresExpanded, setIsStoresExpanded] = useState(true);

  const filteredStores = useMemo(() => {
    if (!searchQuery.trim()) return stores;
    const query = searchQuery.toLowerCase();
    return stores.filter(store =>
      store.name.toLowerCase().includes(query) ||
      store.cuisine?.toLowerCase().includes(query) ||
      store.location?.address?.toLowerCase().includes(query)
    );
  }, [stores, searchQuery]);

  const handleStoreSelect = (store: StoreData) => {
    onSelectStore(store);
    setIsStoresExpanded(false);
  };

  return (
    <aside className={styles.sidebar}>
      {/* Navigation Menu */}
      <div className={styles.navMenu}>
        {/* Stores Menu Item */}
        <div className={styles.navSection}>
          <div className={styles.navRow}>
            <div
              role="button"
              tabIndex={0}
              className={`${styles.navButton} ${activeView === 'store' ? styles.navButtonActive : ''}`}
              onClick={() => setIsStoresExpanded(!isStoresExpanded)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsStoresExpanded(!isStoresExpanded); }}
            >
              <Store className={styles.navIcon} />
              <span className={styles.navLabel}>{t('admin.dashboard.stores')}</span>
              <span className={styles.navBadge}>{stores.length}</span>
              {isStoresExpanded ? (
                <ChevronUp className={styles.chevronIcon} />
              ) : (
                <ChevronDown className={styles.chevronIcon} />
              )}
            </div>
            <button
              className={styles.refreshButtonSmall}
              onClick={onRefresh}
              disabled={isLoading}
              aria-label={t('admin.dashboard.refresh')}
            >
              <RefreshCw className={`${styles.refreshIconSmall} ${isLoading ? styles.spinning : ''}`} />
            </button>
          </div>

          {/* Collapsible Store List */}
          {isStoresExpanded && (
            <div className={styles.storeListContainer}>
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
                      onClick={() => handleStoreSelect(store)}
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
            </div>
          )}
        </div>

        {/* Dispatcher Menu Item */}
        <button
          className={styles.navButton}
          onClick={() => { navigate('/admin/dispatcher'); }}
        >
          <Truck className={styles.navIcon} />
          <span className={styles.navLabel}>{t('admin.menu.dispatcher')}</span>
        </button>

        {/* Tools Menu Item */}
        <button
          className={`${styles.navButton} ${activeView === 'tools' ? styles.navButtonActive : ''}`}
          onClick={onSelectTools}
        >
          <Wrench className={styles.navIcon} />
          <span className={styles.navLabel}>{t('admin.tools.title')}</span>
        </button>
      </div>
    </aside>
  );
};
