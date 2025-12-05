import type * as React from 'react';
import { Clock, Loader2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../../../../../../context/LanguageContext';
import styles from './BalanceCard.module.css';

interface FuturePayoutsCardProps {
  value: number | undefined;
  loading: boolean;
  error: Error | null;
}

/**
 * Displays pending Stripe balance (scheduled for payout)
 */
export const FuturePayoutsCard: React.FC<FuturePayoutsCardProps> = ({
  value,
  loading,
  error,
}) => {
  const { t } = useLanguage();

  const formatter = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  });

  // Convert cents to dollars
  const formattedValue = value != null ? formatter.format(value / 100) : '--';

  if (loading) {
    return (
      <div className={`${styles.card} ${styles.pendingCard} ${styles.loadingCard}`}>
        <div className={styles.loadingContent}>
          <Loader2 className={styles.loadingSpinner} />
          <p className={styles.loadingText}>{t('metrics.stripeBalance.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.card} ${styles.pendingCard} ${styles.errorCard}`}>
        <div className={styles.cardContent}>
          <div className={styles.cardMain}>
            <p className={styles.cardLabel}>{t('metrics.stripeBalance.pending')}</p>
            <div className={styles.errorText}>
              <AlertCircle className={styles.errorIcon} />
              <span>{t('metrics.stripeBalance.error')}</span>
            </div>
          </div>
          <div className={styles.errorIconWrapper}>
            <Clock className={styles.errorCardIcon} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.card} ${styles.pendingCard}`}>
      <div className={styles.cardContent}>
        <div className={styles.cardMain}>
          <p className={styles.cardLabel}>{t('metrics.stripeBalance.pending')}</p>
          <h3 className={styles.cardValue}>{formattedValue}</h3>
          <p className={styles.cardDescription}>{t('metrics.stripeBalance.pendingDesc')}</p>
        </div>
        <div className={styles.iconContainer}>
          <div className={styles.iconWrapper}>
            <Clock className={styles.cardIcon} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FuturePayoutsCard;
