import type * as React from 'react';

import {
  Loader2,
  AlertCircle,
  ShoppingBag
} from 'lucide-react';
import { useCurrentWeekMetrics } from '../../../../../hooks/useCurrentWeekMetrics';
import { useLanguage } from '../../../../../context/LanguageContext';
import styles from './KPICard.module.css';

interface TotalWeeklyOrdersCardProps {
  storeId: string;
}

const TotalWeeklyOrdersCard: React.FC<TotalWeeklyOrdersCardProps> = ({ storeId }) => {
  const { t } = useLanguage();
  const { current, loading, error } = useCurrentWeekMetrics(storeId);

  const currentOrders = current.totalOrders;

  if (loading) {
    return (
      <div className={`${styles.card} ${styles.loadingCard}`}>
        <div className={styles.loadingContent}>
          <Loader2 className={styles.loadingSpinner} />
          <p className={styles.loadingText}>{t('metrics.loadingOrders')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.card} ${styles.errorCard}`}>
        <div className={styles.cardContent}>
          <div className={styles.cardMain}>
            <p className={styles.cardLabel}>{t('metrics.ordersThisWeek')}</p>
            <div className={styles.errorText}>
              <AlertCircle className={styles.errorIcon} />
              <span>{t('metrics.couldNotLoadData')}</span>
            </div>
          </div>
          <div className={styles.errorIconWrapper}>
            <ShoppingBag className={styles.errorCardIcon} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardContent}>
        <div className={styles.cardMain}>
          <p className={styles.cardLabel}>{t('metrics.ordersThisWeek')}</p>
          <h3 className={styles.cardValue}>{currentOrders}</h3>
        </div>
        <div className={styles.iconContainer}>
          <div className={styles.iconWrapper}>
            <ShoppingBag className={styles.cardIcon} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalWeeklyOrdersCard;
