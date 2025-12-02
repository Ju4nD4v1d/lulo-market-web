import type * as React from 'react';
/**
 * PayoutPolicyPage - Payout policy for Stripe compliance
 */

import { Wallet } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { LegalPageLayout } from '../../components/shared/legal';
import styles from './PayoutPolicyPage.module.css';

export const PayoutPolicyPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <LegalPageLayout
      icon={Wallet}
      title={t('legal.payout.title')}
      subtitle={t('legal.payout.subtitle')}
      lastUpdated={t('legal.payout.lastUpdated')}
    >
      <div className={styles.content}>
        <p className={styles.preformatted}>{t('legal.payout.content')}</p>
      </div>
    </LegalPageLayout>
  );
};

export default PayoutPolicyPage;
