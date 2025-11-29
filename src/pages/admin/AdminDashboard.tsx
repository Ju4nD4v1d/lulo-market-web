/**
 * AdminDashboard - Main admin dashboard component
 * Displays all stores and allows viewing their details, orders, and metrics
 */

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { AdminLayout } from './components/AdminLayout';
import { StoreSidebar } from './components/StoreSidebar';
import { StoreDetailsPanel } from './components/StoreDetailsPanel';
import { OrphanAccountTool } from './components/OrphanAccountTool';
import { useAllStores } from './hooks/useAllStores';
import type { StoreData } from '../../types/store';
import styles from './AdminDashboard.module.css';

type ActiveView = 'store' | 'tools';

export const AdminDashboard = () => {
  const { userType } = useAuth();
  const { t } = useLanguage();
  const { stores, isLoading, error, refetch } = useAllStores();
  const [selectedStore, setSelectedStore] = useState<StoreData | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>('store');

  // Double-check admin access (should already be checked by route)
  if (userType !== 'admin') {
    return (
      <div className={styles.accessDenied}>
        <h1>{t('admin.accessDenied')}</h1>
        <p>{t('admin.accessDeniedMessage')}</p>
      </div>
    );
  }

  const handleSelectStore = (store: StoreData) => {
    setSelectedStore(store);
    setActiveView('store');
  };

  const handleSelectTools = () => {
    setSelectedStore(null);
    setActiveView('tools');
  };

  return (
    <AdminLayout>
      <div className={styles.container}>
        <StoreSidebar
          stores={stores}
          isLoading={isLoading}
          error={error}
          selectedStoreId={selectedStore?.id || null}
          activeView={activeView}
          onSelectStore={handleSelectStore}
          onSelectTools={handleSelectTools}
          onRefresh={refetch}
        />
        <main className={styles.main}>
          {activeView === 'tools' ? (
            <div className={styles.toolsView}>
              <h2 className={styles.toolsViewTitle}>{t('admin.tools.title')}</h2>
              <OrphanAccountTool />
            </div>
          ) : selectedStore ? (
            <StoreDetailsPanel
              store={selectedStore}
              onRefresh={() => {
                refetch();
                // Refresh selected store data
                const updatedStore = stores.find(s => s.id === selectedStore.id);
                if (updatedStore) {
                  setSelectedStore(updatedStore);
                }
              }}
            />
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyContent}>
                <div className={styles.emptyIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path d="M9 22V12h6v10" />
                  </svg>
                </div>
                <h2 className={styles.emptyTitle}>{t('admin.dashboard.selectStore')}</h2>
                <p className={styles.emptySubtitle}>
                  {t('admin.dashboard.selectStoreHint')}
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
