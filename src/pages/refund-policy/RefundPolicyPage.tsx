import type * as React from 'react';
/**
 * RefundPolicyPage - Refund & Cancellation Policy for stores and customers
 */

import { RotateCcw } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { LegalPageLayout } from '../../components/shared/legal';
import styles from './RefundPolicyPage.module.css';

export const RefundPolicyPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <LegalPageLayout
      icon={RotateCcw}
      title={t('legal.refundPolicy.title')}
      subtitle={t('legal.refundPolicy.subtitle')}
      lastUpdated={t('legal.refundPolicy.lastUpdated')}
    >
      <div className={styles.content}>
        <p className={styles.preformatted}>{t('legal.refundPolicy.content')}</p>
      </div>
    </LegalPageLayout>
  );
};

export default RefundPolicyPage;
