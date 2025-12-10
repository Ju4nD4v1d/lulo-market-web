import type * as React from 'react';
/**
 * PayoutPolicyPage - Payout policy for Stripe compliance
 *
 * Fetches content from Firestore legal_agreements collection.
 * Supports optional versionId query param to view specific signed versions.
 */

import { Wallet, Loader2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { LegalPageLayout } from '../../components/shared/legal';
import { useLegalAgreementQuery } from '../../hooks/queries';
import styles from './PayoutPolicyPage.module.css';

export const PayoutPolicyPage: React.FC = () => {
  const { t, locale } = useLanguage();
  const [searchParams] = useSearchParams();

  // Check for versionId in URL query params (e.g., /payout-policy?v=abc123)
  const versionId = searchParams.get('v');

  const { agreement, isLoading, isError } = useLegalAgreementQuery(
    'payoutPolicy',
    versionId
  );

  // Use Firestore content if available, otherwise fall back to translations
  const title = agreement?.title?.[locale] || t('legal.payout.title');
  const subtitle = agreement?.subtitle?.[locale] || t('legal.payout.subtitle');
  const lastUpdated = agreement?.lastUpdated || t('legal.payout.lastUpdated');
  const content = agreement?.content?.[locale] || t('legal.payout.content');

  if (isLoading) {
    return (
      <LegalPageLayout
        icon={Wallet}
        title={t('legal.payout.title')}
        subtitle={t('legal.payout.subtitle')}
        lastUpdated=""
      >
        <div className={styles.loadingContainer}>
          <Loader2 className={styles.spinner} />
          <p>{t('common.loading')}</p>
        </div>
      </LegalPageLayout>
    );
  }

  if (isError) {
    return (
      <LegalPageLayout
        icon={Wallet}
        title={t('legal.payout.title')}
        subtitle={t('legal.payout.subtitle')}
        lastUpdated=""
      >
        <div className={styles.content}>
          <p className={styles.preformatted}>{t('legal.payout.content')}</p>
        </div>
      </LegalPageLayout>
    );
  }

  return (
    <LegalPageLayout
      icon={Wallet}
      title={title}
      subtitle={subtitle}
      lastUpdated={lastUpdated}
    >
      <div className={styles.content}>
        <p className={styles.preformatted}>{content}</p>
      </div>
    </LegalPageLayout>
  );
};

export default PayoutPolicyPage;
