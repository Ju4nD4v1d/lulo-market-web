import type * as React from 'react';
/**
 * SellerAgreementPage - Seller Partner Agreement for store partners
 *
 * Fetches content from Firestore legal_agreements collection.
 * Supports optional versionId query param to view specific signed versions.
 */

import { Handshake, Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { LegalPageLayout } from '../../components/shared/legal';
import { useLegalAgreementQuery } from '../../hooks/queries';
import styles from './SellerAgreementPage.module.css';

export const SellerAgreementPage: React.FC = () => {
  const { t, locale } = useLanguage();

  // Check for versionId in URL hash params (e.g., #seller-agreement?v=abc123)
  const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const versionId = hashParams.get('v');

  const { agreement, isLoading, isError } = useLegalAgreementQuery(
    'sellerAgreement',
    versionId
  );

  // Use Firestore content if available, otherwise fall back to translations
  const title = agreement?.title?.[locale] || t('legal.sellerAgreement.title');
  const subtitle = agreement?.subtitle?.[locale] || t('legal.sellerAgreement.subtitle');
  const lastUpdated = agreement?.lastUpdated || t('legal.sellerAgreement.lastUpdated');
  const content = agreement?.content?.[locale] || t('legal.sellerAgreement.content');

  if (isLoading) {
    return (
      <LegalPageLayout
        icon={Handshake}
        title={t('legal.sellerAgreement.title')}
        subtitle={t('legal.sellerAgreement.subtitle')}
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
        icon={Handshake}
        title={t('legal.sellerAgreement.title')}
        subtitle={t('legal.sellerAgreement.subtitle')}
        lastUpdated=""
      >
        <div className={styles.content}>
          <p className={styles.preformatted}>{t('legal.sellerAgreement.content')}</p>
        </div>
      </LegalPageLayout>
    );
  }

  return (
    <LegalPageLayout
      icon={Handshake}
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

export default SellerAgreementPage;
