import type * as React from 'react';
import { Wallet, Loader2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../../../../../../context/LanguageContext';
import styles from './BalanceCard.module.css';

interface AvailableBalanceCardProps {
  value: number | undefined;
  loading: boolean;
  error: Error | null;
}

/**
 * Displays the available Stripe balance (funds ready to withdraw immediately)
 */
export const AvailableBalanceCard: React.FC<AvailableBalanceCardProps> = ({
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
      <div className={`${styles.card} ${styles.loadingCard}`}>
        <div className={styles.loadingContent}>
          <Loader2 className={styles.loadingSpinner} />
          <p className={styles.loadingText}>{t('metrics.stripeBalance.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.card} ${styles.errorCard}`}>
        <div className={styles.cardContent}>
          <div className={styles.cardMain}>
            <p className={styles.cardLabel}>{t('metrics.stripeBalance.available')}</p>
            <div className={styles.errorText}>
              <AlertCircle className={styles.errorIcon} />
              <span>{t('metrics.stripeBalance.error')}</span>
            </div>
          </div>
          <div className={styles.errorIconWrapper}>
            <Wallet className={styles.errorCardIcon} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardContent}>
        <div className={styles.cardMain}>
          <p className={styles.cardLabel}>{t('metrics.stripeBalance.available')}</p>
          <h3 className={styles.cardValue}>{formattedValue}</h3>
          <p className={styles.cardDescription}>{t('metrics.stripeBalance.availableDesc')}</p>
        </div>
        <div className={styles.iconContainer}>
          <div className={styles.iconWrapper}>
            <Wallet className={styles.cardIcon} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailableBalanceCard;
