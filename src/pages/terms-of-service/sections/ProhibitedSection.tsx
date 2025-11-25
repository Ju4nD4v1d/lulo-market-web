import type * as React from 'react';

import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { LegalSection } from '../../../components/shared/legal';

export const ProhibitedSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <LegalSection
      icon={AlertTriangle}
      iconColor="text-red-600"
      iconBgColor="bg-red-100"
      title={t('legal.terms.prohibited.title')}
    >
      <p className="text-gray-700 leading-relaxed mb-4">
        {t('legal.terms.prohibited.intro')}
      </p>
      <ul className="space-y-2 text-gray-700">
        <li className="flex items-start">
          <span className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
          {t('legal.terms.prohibited.item1')}
        </li>
        <li className="flex items-start">
          <span className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
          {t('legal.terms.prohibited.item2')}
        </li>
        <li className="flex items-start">
          <span className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
          {t('legal.terms.prohibited.item3')}
        </li>
        <li className="flex items-start">
          <span className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
          {t('legal.terms.prohibited.item4')}
        </li>
        <li className="flex items-start">
          <span className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
          {t('legal.terms.prohibited.item5')}
        </li>
      </ul>
    </LegalSection>
  );
};
