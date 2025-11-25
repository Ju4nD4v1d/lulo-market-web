import type * as React from 'react';

import { useLanguage } from '../../../context/LanguageContext';

export const ContactSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="bg-gray-50 rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        {t('legal.contact.title')}
      </h2>
      <p className="text-gray-700 leading-relaxed">
        {t('legal.contact.description')}
      </p>
      <div className="mt-4 text-gray-700">
        <p>{t('legal.contact.email')}</p>
      </div>
    </section>
  );
};
