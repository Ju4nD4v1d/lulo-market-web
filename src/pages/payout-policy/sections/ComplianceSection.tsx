import type * as React from 'react';
import { ShieldCheck, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { LegalSection } from '../../../components/shared/legal';

export const ComplianceSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <LegalSection number={6} title={t('legal.payout.compliance.title')}>
      <p className="text-gray-700 leading-relaxed mb-4">
        {t('legal.payout.compliance.intro')}
      </p>

      <ul className="space-y-2 text-gray-700 mb-4">
        <li>• {t('legal.payout.compliance.item1')}</li>
      </ul>

      <a
        href="https://stripe.com/restricted-businesses"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
      >
        {t('legal.payout.compliance.link')}
        <ExternalLink className="w-4 h-4" />
      </a>
    </LegalSection>
  );
};
