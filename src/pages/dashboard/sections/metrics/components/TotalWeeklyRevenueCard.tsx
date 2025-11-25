import type * as React from 'react';

import {
  DollarSign,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useCurrentWeekMetrics } from '../../../../../hooks/useCurrentWeekMetrics';
import { useLanguage } from '../../../../../context/LanguageContext';
import styles from './KPICard.module.css';

interface TotalWeeklyRevenueCardProps {
  storeId: string;
}

const TotalWeeklyRevenueCard: React.FC<TotalWeeklyRevenueCardProps> = ({ storeId }) => {
  const { t } = useLanguage();
  const { current, loading, error } = useCurrentWeekMetrics(storeId);

  const currentRevenue = current.totalRevenue;

  const formatter = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD'
  });

  if (loading) {
    return (
      <div className={`${styles.card} ${styles.loadingCard}`}>
        <div className={styles.loadingContent}>
          <Loader2 className={styles.loadingSpinner} />
          <p className={styles.loadingText}>{t('metrics.loadingRevenue')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.card} ${styles.errorCard}`}>
        <div className={styles.cardContent}>
          <div className={styles.cardMain}>
            <p className={styles.cardLabel}>{t('metrics.revenueThisWeek')}</p>
            <div className={styles.errorText}>
              <AlertCircle className={styles.errorIcon} />
              <span>{t('metrics.couldNotLoadData')}</span>
            </div>
          </div>
          <div className={styles.errorIconWrapper}>
            <DollarSign className={styles.errorCardIcon} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardContent}>
        <div className={styles.cardMain}>
          <p className={styles.cardLabel}>{t('metrics.revenueThisWeek')}</p>
          <h3 className={styles.cardValue}>
            {formatter.format(currentRevenue)}
          </h3>
        </div>
        <div className={styles.iconContainer}>
          <div className={styles.iconWrapper}>
            <DollarSign className={styles.cardIcon} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalWeeklyRevenueCard;
