import type * as React from 'react';
import { TrendingDown } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { LegalSection } from '../../../components/shared/legal';

export const NegativeBalancesSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <LegalSection number={4} title={t('legal.payout.negativeBalance.title')}>
      <p className="text-gray-700 leading-relaxed mb-4">
        {t('legal.payout.negativeBalance.intro')}
      </p>

      <ul className="space-y-2 text-gray-700">
        <li>• {t('legal.payout.negativeBalance.item1')}</li>
        <li>• {t('legal.payout.negativeBalance.item2')}</li>
      </ul>
    </LegalSection>
  );
};
