import type * as React from 'react';
import { useState, useEffect } from 'react';
import { ArrowLeft, LogIn } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { usePortalLogin, useBusinessContact, useCalendly } from './hooks';
import {
  PortalLoginModal,
  BusinessHero,
  BenefitsSection,
  ContactSection
} from './components';
import styles from './BusinessPage.module.css';

export const BusinessPage = () => {
  const { t } = useLanguage();
  const { setRedirectAfterLogin } = useAuth();
  const [showPortalLogin, setShowPortalLogin] = useState(false);

  // Check for portal=true query parameter to auto-open login modal
  useEffect(() => {
    const hash = window.location.hash;
    const urlParams = new URLSearchParams(hash.split('?')[1] || '');
    if (urlParams.get('portal') === 'true') {
      setRedirectAfterLogin(null);
      setShowPortalLogin(true);
      // Clean up URL by removing the query parameter
      window.history.replaceState(null, '', '#business');
    }
  }, [setRedirectAfterLogin]);

  // Portal login hook
  const {
    showPassword,
    setShowPassword,
    loginData,
    setLoginData,
    loginError,
    isLoggingIn,
    handlePortalLogin: handleLogin
  } = usePortalLogin();

  // Business contact form hook
  const {
    formData,
    errors,
    isSubmitting,
    isSubmitted,
    handleInputChange,
    handleSubmit: handleContactSubmit
  } = useBusinessContact();

  // Calendly hook
  const { openCalendly } = useCalendly();

  const handlePortalLoginSubmit = async (e: React.FormEvent) => {
    const success = await handleLogin(e, t);
    if (success) {
      setShowPortalLogin(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    handleContactSubmit(e, t);
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <button
                onClick={() => window.location.hash = '#'}
                className={styles.backButton}
              >
                <ArrowLeft className={styles.backIcon} />
                <span className={styles.backText}>{t('business.backToMarketplace')}</span>
              </button>
              <div className={styles.divider}></div>
              <span className={styles.logo}>LuloCart</span>
            </div>

            {/* Portal Login Button */}
            <button
              onClick={() => {
                // Clear any existing redirect to ensure business login goes to dashboard
                setRedirectAfterLogin(null);
                setShowPortalLogin(true);
              }}
              className={styles.portalButton}
            >
              <LogIn className={styles.loginIcon} />
              {t('business.portalLogin')}
            </button>
          </div>
        </div>
      </header>

      {/* Portal Login Modal */}
      <PortalLoginModal
        isOpen={showPortalLogin}
        onClose={() => setShowPortalLogin(false)}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        loginData={loginData}
        setLoginData={setLoginData}
        loginError={loginError}
        isLoggingIn={isLoggingIn}
        onSubmit={handlePortalLoginSubmit}
        t={t}
      />

      {/* Main Content */}
      <main>
        <BusinessHero t={t} />
        <BenefitsSection t={t} />
        <ContactSection
          formData={formData}
          errors={errors}
          isSubmitting={isSubmitting}
          isSubmitted={isSubmitted}
          onInputChange={handleInputChange}
          onSubmit={handleFormSubmit}
          onOpenCalendly={openCalendly}
          t={t}
        />
      </main>
    </div>
  );
};

export default BusinessPage;
