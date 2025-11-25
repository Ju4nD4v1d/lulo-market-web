import type * as React from 'react';

import {
  Loader2,
  AlertCircle,
  Box
} from 'lucide-react';
import { useCurrentWeekMetrics } from '../../../../../hooks/useCurrentWeekMetrics';
import { useLanguage } from '../../../../../context/LanguageContext';
import styles from './KPICard.module.css';

interface TotalWeeklyProductsCardProps {
  storeId: string;
}

const TotalWeeklyProductsCard: React.FC<TotalWeeklyProductsCardProps> = ({ storeId }) => {
  const { t } = useLanguage();
  const { current, loading, error } = useCurrentWeekMetrics(storeId);

  const currentProductsSold = current.totalProducts;

  if (loading) {
    return (
      <div className={`${styles.card} ${styles.loadingCard}`}>
        <div className={styles.loadingContent}>
          <Loader2 className={styles.loadingSpinner} />
          <p className={styles.loadingText}>{t('metrics.loadingProducts')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.card} ${styles.errorCard}`}>
        <div className={styles.cardContent}>
          <div className={styles.cardMain}>
            <p className={styles.cardLabel}>{t('metrics.productsThisWeek')}</p>
            <div className={styles.errorText}>
              <AlertCircle className={styles.errorIcon} />
              <span>{t('metrics.couldNotLoadData')}</span>
            </div>
          </div>
          <div className={styles.errorIconWrapper}>
            <Box className={styles.errorCardIcon} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardContent}>
        <div className={styles.cardMain}>
          <p className={styles.cardLabel}>{t('metrics.productsThisWeek')}</p>
          <h3 className={styles.cardValue}>{currentProductsSold}</h3>
        </div>
        <div className={styles.iconContainer}>
          <div className={styles.iconWrapper}>
            <Box className={styles.cardIcon} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalWeeklyProductsCard;
