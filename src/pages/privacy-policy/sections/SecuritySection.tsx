import type * as React from 'react';

import { Lock } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { LegalSection } from '../../../components/shared/legal';

export const SecuritySection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <LegalSection
      icon={Lock}
      iconColor="text-green-600"
      iconBgColor="bg-green-100"
      title={t('legal.privacy.security.title')}
    >
      <p className="text-gray-700 leading-relaxed">
        {t('legal.privacy.security.content1')}
      </p>
      <p className="text-gray-700 leading-relaxed">
        {t('legal.privacy.security.content2')}
      </p>
    </LegalSection>
  );
};
