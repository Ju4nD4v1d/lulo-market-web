import type * as React from 'react';

import { useLanguage } from '../../../context/LanguageContext';
import { LegalSection } from '../../../components/shared/legal';

export const PlatformUsageSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <LegalSection number={3} title={t('legal.terms.platformUsage.title')}>
      <p className="text-white/80 leading-relaxed">
        {t('legal.terms.platformUsage.content1')}
      </p>
      <p className="text-white/80 leading-relaxed">
        {t('legal.terms.platformUsage.content2')}
      </p>
    </LegalSection>
  );
};
