import type * as React from 'react';

import { Globe } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { LegalSection } from '../../../components/shared/legal';

export const ThirdPartySection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <LegalSection icon={Globe} title={t('legal.privacy.thirdParty.title')}>
      <p className="text-gray-700 leading-relaxed mb-4">
        {t('legal.privacy.thirdParty.intro')}
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">{t('legal.privacy.thirdParty.payment.title')}</h4>
          <p className="text-gray-700 text-sm">
            {t('legal.privacy.thirdParty.payment.desc')}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">{t('legal.privacy.thirdParty.analytics.title')}</h4>
          <p className="text-gray-700 text-sm">
            {t('legal.privacy.thirdParty.analytics.desc')}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">{t('legal.privacy.thirdParty.storage.title')}</h4>
          <p className="text-gray-700 text-sm">
            {t('legal.privacy.thirdParty.storage.desc')}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">{t('legal.privacy.thirdParty.communication.title')}</h4>
          <p className="text-gray-700 text-sm">
            {t('legal.privacy.thirdParty.communication.desc')}
          </p>
        </div>
      </div>
    </LegalSection>
  );
};
