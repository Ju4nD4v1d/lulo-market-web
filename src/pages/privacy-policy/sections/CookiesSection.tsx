import type * as React from 'react';

import { Cookie } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { LegalSection } from '../../../components/shared/legal';

export const CookiesSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <LegalSection icon={Cookie} title={t('legal.privacy.cookies.title')}>
      <p className="text-gray-700 leading-relaxed">
        {t('legal.privacy.cookies.intro')}
      </p>

      <div className="mt-4 space-y-3">
        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-primary-400 rounded-full mt-2 flex-shrink-0"></div>
          <div>
            <span className="font-medium text-gray-900">{t('legal.privacy.cookies.essential')}</span>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-primary-400 rounded-full mt-2 flex-shrink-0"></div>
          <div>
            <span className="font-medium text-gray-900">{t('legal.privacy.cookies.analytics')}</span>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-primary-400 rounded-full mt-2 flex-shrink-0"></div>
          <div>
            <span className="font-medium text-gray-900">{t('legal.privacy.cookies.marketing')}</span>
          </div>
        </div>
      </div>

      <p className="text-gray-700 leading-relaxed mt-4">
        {t('legal.privacy.cookies.control')}
      </p>
    </LegalSection>
  );
};
