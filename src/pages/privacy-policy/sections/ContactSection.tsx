import type * as React from 'react';

import { useLanguage } from '../../../context/LanguageContext';

export const ContactSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="bg-white/5 border border-white/10 rounded-lg p-6">
      <h2 className="text-xl font-bold text-white mb-4">
        {t('legal.contact.title')}
      </h2>
      <p className="text-white/80 leading-relaxed">
        {t('legal.contact.description')}
      </p>
      <div className="mt-4 text-white/80">
        <p>{t('legal.contact.email')}</p>
      </div>
    </section>
  );
};
