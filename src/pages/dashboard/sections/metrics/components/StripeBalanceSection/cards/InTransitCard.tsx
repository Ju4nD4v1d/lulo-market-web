import type * as React from 'react';
import { Send, Loader2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../../../../../../context/LanguageContext';
import styles from './BalanceCard.module.css';

interface InTransitCardProps {
  value: number | undefined;
  loading: boolean;
  error: Error | null;
}

/**
 * Displays in-transit Stripe balance (on the way to bank)
 */
export const InTransitCard: React.FC<InTransitCardProps> = ({
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
      <div className={`${styles.card} ${styles.transitCard} ${styles.loadingCard}`}>
        <div className={styles.loadingContent}>
          <Loader2 className={styles.loadingSpinner} />
          <p className={styles.loadingText}>{t('metrics.stripeBalance.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.card} ${styles.transitCard} ${styles.errorCard}`}>
        <div className={styles.cardContent}>
          <div className={styles.cardMain}>
            <p className={styles.cardLabel}>{t('metrics.stripeBalance.inTransit')}</p>
            <div className={styles.errorText}>
              <AlertCircle className={styles.errorIcon} />
              <span>{t('metrics.stripeBalance.error')}</span>
            </div>
          </div>
          <div className={styles.errorIconWrapper}>
            <Send className={styles.errorCardIcon} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.card} ${styles.transitCard}`}>
      <div className={styles.cardContent}>
        <div className={styles.cardMain}>
          <p className={styles.cardLabel}>{t('metrics.stripeBalance.inTransit')}</p>
          <h3 className={styles.cardValue}>{formattedValue}</h3>
          <p className={styles.cardDescription}>{t('metrics.stripeBalance.inTransitDesc')}</p>
        </div>
        <div className={styles.iconContainer}>
          <div className={styles.iconWrapper}>
            <Send className={styles.cardIcon} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InTransitCard;
