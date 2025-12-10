import type * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { setRedirectAfterLogin } = useAuth();
  const [showPortalLogin, setShowPortalLogin] = useState(false);

  // Check for portal=true query parameter to auto-open login modal
  useEffect(() => {
    if (searchParams.get('portal') === 'true') {
      setRedirectAfterLogin(null);
      setShowPortalLogin(true);
      // Clean up URL by removing the query parameter
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, setRedirectAfterLogin]);

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
    submitError,
    handleInputChange,
    handleSubmit: handleContactSubmit,
    resetForm
  } = useBusinessContact();

  // Reset form when component unmounts or when navigating away
  useEffect(() => {
    return () => {
      resetForm();
    };
  }, [resetForm]);

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
                onClick={() => navigate('/')}
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
          submitError={submitError}
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
