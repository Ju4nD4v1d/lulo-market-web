import type * as React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { LegalSection } from '../../../components/shared/legal';

export const AdjustmentsSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <LegalSection number={3} title={t('legal.payout.adjustments.title')}>
      <p className="text-gray-700 leading-relaxed mb-4">
        {t('legal.payout.adjustments.intro')}
      </p>

      <ul className="space-y-2 text-gray-700">
        <li>• {t('legal.payout.adjustments.item1')}</li>
        <li>• {t('legal.payout.adjustments.item2')}</li>
        <li>• {t('legal.payout.adjustments.item3')}</li>
        <li>• {t('legal.payout.adjustments.item4')}</li>
      </ul>
    </LegalSection>
  );
};
