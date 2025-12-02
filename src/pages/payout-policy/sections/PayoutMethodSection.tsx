import type * as React from 'react';
import { CreditCard } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { LegalSection } from '../../../components/shared/legal';

export const PayoutMethodSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <LegalSection number={5} title={t('legal.payout.method.title')}>
      <p className="text-gray-700 leading-relaxed">
        {t('legal.payout.method.content')}
      </p>
    </LegalSection>
  );
};
