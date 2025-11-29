/**
 * StoreDetailsPanel - Main content area with tabs for store info
 * Shows store details, orders, and metrics
 */

import { useState } from 'react';
import { Info, ShoppingCart, BarChart3 } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';
import { StoreInfoTab } from '../StoreInfoTab';
import { StoreOrdersTab } from '../StoreOrdersTab';
import { StoreMetricsTab } from '../StoreMetricsTab';
import type { StoreData } from '../../../../types/store';
import styles from './StoreDetailsPanel.module.css';

interface StoreDetailsPanelProps {
  store: StoreData;
  onRefresh: () => void;
}

type TabId = 'info' | 'orders' | 'metrics';

export const StoreDetailsPanel = ({ store, onRefresh }: StoreDetailsPanelProps) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabId>('info');

  const tabs = [
    { id: 'info' as TabId, label: t('admin.tabs.info'), icon: Info },
    { id: 'orders' as TabId, label: t('admin.tabs.orders'), icon: ShoppingCart },
    { id: 'metrics' as TabId, label: t('admin.tabs.metrics'), icon: BarChart3 },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.storeHeader}>
          <div className={styles.storeImage}>
            {store.storeImage ? (
              <img src={store.storeImage} alt={store.name} />
            ) : (
              <div className={styles.storePlaceholder}>{store.name.charAt(0)}</div>
            )}
          </div>
          <div className={styles.storeInfo}>
            <h1 className={styles.storeName}>{store.name}</h1>
            <p className={styles.storeId}>ID: {store.id}</p>
          </div>
        </div>

        <nav className={styles.tabs}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className={styles.tabIcon} />
              <span className={styles.tabLabel}>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className={styles.content}>
        {activeTab === 'info' && (
          <StoreInfoTab store={store} onRefresh={onRefresh} />
        )}
        {activeTab === 'orders' && (
          <StoreOrdersTab storeId={store.id} />
        )}
        {activeTab === 'metrics' && (
          <StoreMetricsTab storeId={store.id} />
        )}
      </div>
    </div>
  );
};
