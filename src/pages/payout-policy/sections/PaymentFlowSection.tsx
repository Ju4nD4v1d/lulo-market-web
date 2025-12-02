import type * as React from 'react';
import { ArrowRightLeft } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { LegalSection } from '../../../components/shared/legal';

export const PaymentFlowSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <LegalSection number={1} title={t('legal.payout.paymentFlow.title')}>
      <p className="text-gray-700 leading-relaxed mb-4">
        {t('legal.payout.paymentFlow.intro')}
      </p>

      <ul className="space-y-2 text-gray-700 mb-4">
        <li>• {t('legal.payout.paymentFlow.item1')}</li>
        <li>• {t('legal.payout.paymentFlow.item2')}</li>
        <li>• {t('legal.payout.paymentFlow.item3')}</li>
        <li>• {t('legal.payout.paymentFlow.item4')}</li>
      </ul>

      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <p className="text-gray-800 font-medium">
          {t('legal.payout.paymentFlow.result')}
        </p>
      </div>
    </LegalSection>
  );
};
