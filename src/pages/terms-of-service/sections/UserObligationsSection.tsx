import type * as React from 'react';

import { Users } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { LegalSection } from '../../../components/shared/legal';

export const UserObligationsSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <LegalSection icon={Users} title={t('legal.terms.userObligations.title')}>
      <p className="text-white/80 leading-relaxed mb-4">
        {t('legal.terms.userObligations.intro')}
      </p>
      <ul className="space-y-2 text-white/80">
        <li className="flex items-start">
          <span className="w-2 h-2 bg-[#C8E400] rounded-full mt-2 mr-3 flex-shrink-0"></span>
          {t('legal.terms.userObligations.item1')}
        </li>
        <li className="flex items-start">
          <span className="w-2 h-2 bg-[#C8E400] rounded-full mt-2 mr-3 flex-shrink-0"></span>
          {t('legal.terms.userObligations.item2')}
        </li>
        <li className="flex items-start">
          <span className="w-2 h-2 bg-[#C8E400] rounded-full mt-2 mr-3 flex-shrink-0"></span>
          {t('legal.terms.userObligations.item3')}
        </li>
        <li className="flex items-start">
          <span className="w-2 h-2 bg-[#C8E400] rounded-full mt-2 mr-3 flex-shrink-0"></span>
          {t('legal.terms.userObligations.item4')}
        </li>
        <li className="flex items-start">
          <span className="w-2 h-2 bg-[#C8E400] rounded-full mt-2 mr-3 flex-shrink-0"></span>
          {t('legal.terms.userObligations.item5')}
        </li>
      </ul>
    </LegalSection>
  );
};
