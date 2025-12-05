import type * as React from 'react';
import { Banknote, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../../../../../../context/LanguageContext';
import styles from './BalanceCard.module.css';

interface TotalBalanceCardProps {
  available: number | undefined;
  pending: number | undefined;
  loading: boolean;
  error: Error | null;
  onViewDashboard?: () => void;
  dashboardLoading?: boolean;
}

/**
 * Displays the total Stripe balance (available + pending)
 * This matches what Stripe shows as "Total balance" in the dashboard
 */
export const TotalBalanceCard: React.FC<TotalBalanceCardProps> = ({
  available,
  pending,
  loading,
  error,
  onViewDashboard,
  dashboardLoading = false,
}) => {
  const { t } = useLanguage();

  const formatter = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  });

  // Calculate total: available + pending (both in cents)
  const totalCents = (available ?? 0) + (pending ?? 0);
  const hasData = available !== undefined || pending !== undefined;
  const formattedValue = hasData ? formatter.format(totalCents / 100) : '--';

  if (loading) {
    return (
      <div className={`${styles.card} ${styles.primaryCard} ${styles.loadingCard}`}>
        <div className={styles.loadingContent}>
          <Loader2 className={styles.loadingSpinner} />
          <p className={styles.loadingText}>{t('metrics.stripeBalance.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.card} ${styles.primaryCard} ${styles.errorCard}`}>
        <div className={styles.cardContent}>
          <div className={styles.cardMain}>
            <p className={styles.cardLabel}>{t('metrics.stripeBalance.total')}</p>
            <div className={styles.errorText}>
              <AlertCircle className={styles.errorIcon} />
              <span>{t('metrics.stripeBalance.error')}</span>
            </div>
          </div>
          <div className={styles.errorIconWrapper}>
            <Banknote className={styles.errorCardIcon} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.card} ${styles.primaryCard}`}>
      <div className={styles.cardContent}>
        <div className={styles.cardMain}>
          <p className={styles.cardLabel}>{t('metrics.stripeBalance.total')}</p>
          <h3 className={styles.cardValue}>{formattedValue}</h3>
          <p className={styles.cardDescription}>{t('metrics.stripeBalance.totalDesc')}</p>
        </div>
        <div className={styles.iconContainer}>
          <div className={styles.iconWrapper}>
            <Banknote className={styles.cardIcon} />
          </div>
        </div>
      </div>
      {onViewDashboard && (
        <button
          type="button"
          className={styles.dashboardButton}
          onClick={onViewDashboard}
          disabled={dashboardLoading}
        >
          {dashboardLoading ? (
            <Loader2 className={styles.buttonSpinner} />
          ) : (
            <ExternalLink className={styles.buttonIcon} />
          )}
          <span>{t('metrics.stripeBalance.viewDashboard')}</span>
        </button>
      )}
    </div>
  );
};

export default TotalBalanceCard;
