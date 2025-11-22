import type * as React from 'react';
/**
 * PrivacyPolicyPage - Privacy policy with modular sections
 */


import { Shield } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { LegalPageLayout, LegalSection } from '../../components/shared/legal';
import {
  IntroductionSection,
  DataCollectionSection,
  DataUsageSection,
  CookiesSection,
  ThirdPartySection,
  SecuritySection,
  RightsSection,
  ContactSection
} from './sections';

export const PrivacyPolicyPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <LegalPageLayout
      icon={Shield}
      title={t('legal.privacy.title')}
      subtitle={t('legal.privacy.subtitle')}
    >
      <IntroductionSection />
      <DataCollectionSection />
      <DataUsageSection />
      <CookiesSection />
      <ThirdPartySection />
      <SecuritySection />
      <RightsSection />
      <ContactSection />
    </LegalPageLayout>
  );
};

export default PrivacyPolicyPage;
