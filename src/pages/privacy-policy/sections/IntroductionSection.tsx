import type * as React from 'react';

import { Eye } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { LegalSection } from '../../../components/shared/legal';

export const IntroductionSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <LegalSection icon={Eye} title={t('legal.privacy.introduction.title')}>
      <p className="text-gray-700 leading-relaxed">
        {t('legal.privacy.introduction.content1')}
      </p>
      <p className="text-gray-700 leading-relaxed">
        {t('legal.privacy.introduction.content2')}
      </p>
    </LegalSection>
  );
};
