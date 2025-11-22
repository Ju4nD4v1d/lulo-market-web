import type * as React from 'react';

import { Shield } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { LegalSection } from '../../../components/shared/legal';

export const LiabilitySection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <LegalSection icon={Shield} title={t('legal.terms.liability.title')}>
      <p className="text-gray-700 leading-relaxed">
        {t('legal.terms.liability.content1')}
      </p>
      <p className="text-gray-700 leading-relaxed">
        {t('legal.terms.liability.content2')}
      </p>
    </LegalSection>
  );
};
