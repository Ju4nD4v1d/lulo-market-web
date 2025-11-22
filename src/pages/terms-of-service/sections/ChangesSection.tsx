import type * as React from 'react';

import { useLanguage } from '../../../context/LanguageContext';
import { LegalSection } from '../../../components/shared/legal';

export const ChangesSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <LegalSection number={6} title={t('legal.terms.changes.title')}>
      <p className="text-gray-700 leading-relaxed">
        {t('legal.terms.changes.content')}
      </p>
    </LegalSection>
  );
};
