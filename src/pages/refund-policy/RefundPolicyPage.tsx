import type * as React from 'react';
/**
 * RefundPolicyPage - Refund & Cancellation Policy for stores and customers
 *
 * Fetches content from Firestore legal_agreements collection.
 * Supports optional versionId query param to view specific signed versions.
 */

import { RotateCcw, Loader2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { LegalPageLayout } from '../../components/shared/legal';
import { useLegalAgreementQuery } from '../../hooks/queries';
import styles from './RefundPolicyPage.module.css';

export const RefundPolicyPage: React.FC = () => {
  const { t, locale } = useLanguage();
  const [searchParams] = useSearchParams();

  // Check for versionId in URL query params (e.g., /refund-policy?v=abc123)
  const versionId = searchParams.get('v');

  const { agreement, isLoading, isError } = useLegalAgreementQuery(
    'refundPolicy',
    versionId
  );

  // Use Firestore content if available, otherwise fall back to translations
  const title = agreement?.title?.[locale] || t('legal.refundPolicy.title');
  const subtitle = agreement?.subtitle?.[locale] || t('legal.refundPolicy.subtitle');
  const lastUpdated = agreement?.lastUpdated || t('legal.refundPolicy.lastUpdated');
  const content = agreement?.content?.[locale] || t('legal.refundPolicy.content');

  if (isLoading) {
    return (
      <LegalPageLayout
        icon={RotateCcw}
        title={t('legal.refundPolicy.title')}
        subtitle={t('legal.refundPolicy.subtitle')}
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
        icon={RotateCcw}
        title={t('legal.refundPolicy.title')}
        subtitle={t('legal.refundPolicy.subtitle')}
        lastUpdated=""
      >
        <div className={styles.content}>
          <p className={styles.preformatted}>{t('legal.refundPolicy.content')}</p>
        </div>
      </LegalPageLayout>
    );
  }

  return (
    <LegalPageLayout
      icon={RotateCcw}
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

export default RefundPolicyPage;
