import type * as React from 'react';

import { useLanguage } from '../../../context/LanguageContext';
import { LegalSection } from '../../../components/shared/legal';

export const DataUsageSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <LegalSection number={3} title={t('legal.privacy.dataUsage.title')}>
      <p className="text-white/80 leading-relaxed mb-4">
        {t('legal.privacy.dataUsage.intro')}
      </p>
      <ul className="space-y-2 text-white/80">
        <li className="flex items-start">
          <span className="w-2 h-2 bg-[#C8E400] rounded-full mt-2 mr-3 flex-shrink-0"></span>
          {t('legal.privacy.dataUsage.item1')}
        </li>
        <li className="flex items-start">
          <span className="w-2 h-2 bg-[#C8E400] rounded-full mt-2 mr-3 flex-shrink-0"></span>
          {t('legal.privacy.dataUsage.item2')}
        </li>
        <li className="flex items-start">
          <span className="w-2 h-2 bg-[#C8E400] rounded-full mt-2 mr-3 flex-shrink-0"></span>
          {t('legal.privacy.dataUsage.item3')}
        </li>
        <li className="flex items-start">
          <span className="w-2 h-2 bg-[#C8E400] rounded-full mt-2 mr-3 flex-shrink-0"></span>
          {t('legal.privacy.dataUsage.item4')}
        </li>
        <li className="flex items-start">
          <span className="w-2 h-2 bg-[#C8E400] rounded-full mt-2 mr-3 flex-shrink-0"></span>
          {t('legal.privacy.dataUsage.item5')}
        </li>
        <li className="flex items-start">
          <span className="w-2 h-2 bg-[#C8E400] rounded-full mt-2 mr-3 flex-shrink-0"></span>
          {t('legal.privacy.dataUsage.item6')}
        </li>
      </ul>
    </LegalSection>
  );
};
