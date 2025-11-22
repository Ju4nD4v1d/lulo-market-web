import type * as React from 'react';

import { useLanguage } from '../../../context/LanguageContext';
import { LegalSection } from '../../../components/shared/legal';

export const RightsSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <LegalSection number={7} title={t('legal.privacy.rights.title')}>
      <p className="text-gray-700 leading-relaxed mb-4">
        {t('legal.privacy.rights.intro')}
      </p>
      <ul className="space-y-2 text-gray-700">
        <li className="flex items-start">
          <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
          {t('legal.privacy.rights.item1')}
        </li>
        <li className="flex items-start">
          <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
          {t('legal.privacy.rights.item2')}
        </li>
        <li className="flex items-start">
          <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
          {t('legal.privacy.rights.item3')}
        </li>
        <li className="flex items-start">
          <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
          {t('legal.privacy.rights.item4')}
        </li>
        <li className="flex items-start">
          <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
          {t('legal.privacy.rights.item5')}
        </li>
      </ul>
    </LegalSection>
  );
};
