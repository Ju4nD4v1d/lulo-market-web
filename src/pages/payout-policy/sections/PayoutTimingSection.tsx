import type * as React from 'react';
import { Clock } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { LegalSection } from '../../../components/shared/legal';

export const PayoutTimingSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <LegalSection number={2} title={t('legal.payout.timing.title')}>
      <p className="text-gray-700 leading-relaxed mb-4">
        {t('legal.payout.timing.intro')}
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 font-medium">
          {t('legal.payout.timing.schedule')}
        </p>
      </div>
    </LegalSection>
  );
};
