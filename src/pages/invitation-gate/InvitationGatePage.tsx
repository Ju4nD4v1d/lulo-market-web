import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useSpotlight } from '../../hooks/useSpotlight';
import { useInvitationCode, useWaitlistEmail } from './hooks';
import { CodeView, EmailView, SuccessView, LanguageToggle } from './components';
import styles from './InvitationGatePage.module.css';

interface InvitationGatePageProps {
  onValidCode: () => void;
}

type ViewState = 'code' | 'email' | 'success';

export const InvitationGatePage: React.FC<InvitationGatePageProps> = ({ onValidCode }) => {
  const [currentView, setCurrentView] = useState<ViewState>('code');
  const { t } = useLanguage();

  // Apply interactive spotlight effect
  useSpotlight();

  // Invitation code hook
  const {
    invitationCode,
    setInvitationCode,
    error: codeError,
    isLoading: codeLoading,
    handleCodeSubmit,
  } = useInvitationCode(t('invitation.invalidCode'), t('invitation.connectionError'));

  // Waitlist email hook
  const {
    email,
    setEmail,
    error: emailError,
    isLoading: emailLoading,
    handleEmailSubmit,
  } = useWaitlistEmail(t('invitation.invalidEmail'), t('invitation.submitError'));

  const resetToCode = () => {
    setCurrentView('code');
    setInvitationCode('');
    setEmail('');
  };

  const handleCodeSubmitWrapper = async (e: React.FormEvent) => {
    await handleCodeSubmit(e, onValidCode);
    // If there was an error, transition to email view after 2 seconds
    if (codeError) {
      setTimeout(() => {
        setCurrentView('email');
      }, 2000);
    }
  };

  const handleEmailSubmitWrapper = async (e: React.FormEvent) => {
    await handleEmailSubmit(e, () => setCurrentView('success'));
  };

  // Development helper - add to window for easy testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).clearInvitationGate = async () => {
        const { clearInvitationData } = await import('../../services/invitationService');
        clearInvitationData();
        window.location.reload();
      };
    }
  }, []);

  return (
    <main className={styles.page}>
      {/* Hero background with circuit design */}
      <div className={styles.heroBackground} />

      {/* Subtle animated overlay */}
      <div className={styles.overlay} />

      {/* Language toggle button */}
      <div className={styles.languageToggle}>
        <LanguageToggle />
      </div>

      <section className={styles.container}>
        {/* Brand Title - Large and bold */}
        <h1 className={styles.title}>{t('invitation.title')}</h1>

        {/* Subtitle with welcoming message */}
        <p className={styles.subtitle}>{t('invitation.subtitle')}</p>

        {/* Main card dialog */}
        <div className={styles.card}>
          {currentView === 'code' && (
            <CodeView
              invitationCode={invitationCode}
              onCodeChange={setInvitationCode}
              onSubmit={handleCodeSubmitWrapper}
              onRequestAccess={() => setCurrentView('email')}
              error={codeError}
              isLoading={codeLoading}
            />
          )}

          {currentView === 'email' && (
            <EmailView
              email={email}
              onEmailChange={setEmail}
              onSubmit={handleEmailSubmitWrapper}
              onBackToCode={resetToCode}
              error={emailError}
              isLoading={emailLoading}
            />
          )}

          {currentView === 'success' && <SuccessView onTryAnotherCode={resetToCode} />}
        </div>
      </section>
    </main>
  );
};
