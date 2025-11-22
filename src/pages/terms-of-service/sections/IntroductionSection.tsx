import type * as React from 'react';

import { useLanguage } from '../../../context/LanguageContext';
import { LegalSection } from '../../../components/shared/legal';

export const IntroductionSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <LegalSection number={1} title={t('legal.terms.introduction.title')}>
      <p className="text-gray-700 leading-relaxed">
        {t('legal.terms.introduction.content1')}
      </p>
      <p className="text-gray-700 leading-relaxed">
        {t('legal.terms.introduction.content2')}
      </p>
    </LegalSection>
  );
};
