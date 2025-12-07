import { useState } from 'react';
import type * as React from 'react';
import { CreditCard, Wallet } from 'lucide-react';
import { useLanguage } from '../../../../../../context/LanguageContext';
import { useStoreQuery } from '../../../../../../hooks/queries/useStoreQuery';
import { useStripeBalanceQuery } from '../../../../../../hooks/queries/useStripeBalanceQuery';
import { createStripeLoginLink } from '../../../../../../services/api/stripeConnectApi';
import {
  TotalBalanceCard,
  AvailableBalanceCard,
  FuturePayoutsCard,
  InTransitCard,
} from './cards';
import styles from './StripeBalanceSection.module.css';

interface StripeBalanceSectionProps {
  storeId: string | null;
}

/**
 * Displays Stripe connected account balance information
 *
 * Shows four cards:
 * - Total balance (available + pending, matches Stripe dashboard)
 * - Available balance (funds ready to withdraw immediately)
 * - Future payouts (pending balance scheduled for payout)
 * - In-transit (funds being transferred to bank)
 *
 * Only renders when the store has a connected Stripe account.
 */
export const StripeBalanceSection: React.FC<StripeBalanceSectionProps> = ({ storeId }) => {
  const { t } = useLanguage();
  const [dashboardLoading, setDashboardLoading] = useState(false);

  // Get store data to check for stripeAccountId
  const { store, isLoading: storeLoading } = useStoreQuery(storeId);
  const stripeAccountId = store?.stripeAccountId;

  // Fetch balance data (only when stripeAccountId exists)
  const { balance, isLoading, error } = useStripeBalanceQuery({
    storeId,
    stripeAccountId,
  });

  // Handle opening Stripe dashboard
  const handleViewDashboard = async () => {
    if (!stripeAccountId || !storeId) return;

    setDashboardLoading(true);
    try {
      const result = await createStripeLoginLink({
        storeId,
        accountId: stripeAccountId,
      });
      if (result.success && result.data?.url) {
        window.open(result.data.url, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      console.error('Failed to open Stripe dashboard:', err);
    } finally {
      setDashboardLoading(false);
    }
  };

  // Don't render anything while store is loading
  if (storeLoading) {
    return null;
  }

  // Don't render if no Stripe account is connected
  if (!stripeAccountId) {
    return (
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionIconWrapper}>
            <CreditCard className={styles.sectionIcon} />
          </div>
          <h2 className={styles.sectionTitle}>{t('metrics.stripeBalance.title')}</h2>
        </div>
        <div className={styles.emptyState}>
          <Wallet className={styles.emptyStateIcon} />
          <p className={styles.emptyStateText}>{t('metrics.stripeBalance.noAccount')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionIconWrapper}>
          <CreditCard className={styles.sectionIcon} />
        </div>
        <div className={styles.sectionTitleGroup}>
          <h2 className={styles.sectionTitle}>{t('metrics.stripeBalance.title')}</h2>
          <p className={styles.sectionDisclaimer}>{t('metrics.stripeBalance.disclaimer')}</p>
        </div>
      </div>
      {/* Total Balance - featured card spanning full width on mobile */}
      <div className={styles.totalBalanceWrapper}>
        <TotalBalanceCard
          available={balance?.available}
          pending={balance?.pending}
          loading={isLoading}
          error={error}
          onViewDashboard={handleViewDashboard}
          dashboardLoading={dashboardLoading}
        />
      </div>

      {/* Breakdown cards */}
      <div className={styles.cardsGrid}>
        <AvailableBalanceCard
          value={balance?.available}
          loading={isLoading}
          error={error}
        />
        <FuturePayoutsCard
          value={balance?.pending}
          loading={isLoading}
          error={error}
        />
        <InTransitCard
          value={balance?.inTransit}
          loading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
};

export default StripeBalanceSection;
