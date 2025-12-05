import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';
import { useStore } from '../../../../context/StoreContext';
import { queryKeys } from '../../../../hooks/queries/queryKeys';
import { KPICardGrid } from './components/KPICardGrid';
import { StripeBalanceSection } from './components/StripeBalanceSection';
import styles from './MetricsPage.module.css';

export const MetricsPage = () => {
  const { t } = useLanguage();
  const { storeId } = useStore();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (storeId) {
        // Invalidate Stripe balance query to trigger refetch
        await queryClient.invalidateQueries({
          queryKey: queryKeys.stripe.balance(storeId),
        });
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Header Section */}
      <div className={styles.headerSection}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.titleSection}>
              <div>
                <h1 className={styles.title}>{t('metrics.title')}</h1>
                <p className={styles.subtitle}>{t('metrics.subtitle')}</p>
              </div>
            </div>
            <div className={styles.actions}>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={styles.refreshButton}
              >
                <RefreshCw className={`${styles.buttonIcon} ${isRefreshing ? styles.spinning : ''}`} />
                <span className={styles.buttonText}>{t('metrics.refresh')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        {/* KPI Cards */}
        <KPICardGrid storeId={storeId} />

        {/* Stripe Balance Section */}
        <StripeBalanceSection storeId={storeId} />
      </div>
    </div>
  );
};

export default MetricsPage;
