import type * as React from 'react';
/**
 * SellerAgreementPage - Seller Partner Agreement for store partners
 */

import { Handshake } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { LegalPageLayout } from '../../components/shared/legal';
import styles from './SellerAgreementPage.module.css';

export const SellerAgreementPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <LegalPageLayout
      icon={Handshake}
      title={t('legal.sellerAgreement.title')}
      subtitle={t('legal.sellerAgreement.subtitle')}
      lastUpdated={t('legal.sellerAgreement.lastUpdated')}
    >
      <div className={styles.content}>
        <p className={styles.preformatted}>{t('legal.sellerAgreement.content')}</p>
      </div>
    </LegalPageLayout>
  );
};

export default SellerAgreementPage;
