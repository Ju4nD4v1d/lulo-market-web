import type * as React from 'react';
/**
 * TermsOfServicePage - Terms of service with modular sections
 */


import { FileText } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { LegalPageLayout } from '../../components/shared/legal';
import {
  IntroductionSection,
  UserObligationsSection,
  PlatformUsageSection,
  ProhibitedSection,
  LiabilitySection,
  ChangesSection,
  ContactSection
} from './sections';

export const TermsOfServicePage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <LegalPageLayout
      icon={FileText}
      title={t('legal.terms.title')}
      subtitle={t('legal.terms.subtitle')}
    >
      <IntroductionSection />
      <UserObligationsSection />
      <PlatformUsageSection />
      <ProhibitedSection />
      <LiabilitySection />
      <ChangesSection />
      <ContactSection />
    </LegalPageLayout>
  );
};

export default TermsOfServicePage;
