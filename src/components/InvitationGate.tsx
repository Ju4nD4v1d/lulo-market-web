import React, { useState } from 'react';
import { Mail, ChevronRight, CheckCircle, AlertCircle, Globe } from 'lucide-react';
import { addToWaitlist } from '../services/waitlistService';
import { validateInvitationCode } from '../services/invitationService';
import { useSpotlight } from '../hooks/useSpotlight';
import { useLanguage } from '../context/LanguageContext';

interface InvitationGateProps {
  onValidCode: () => void;
}

type ViewState = 'code' | 'email' | 'success';

export const InvitationGate: React.FC<InvitationGateProps> = ({ onValidCode }) => {
  const [currentView, setCurrentView] = useState<ViewState>('code');
  const [invitationCode, setInvitationCode] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Language context
  const { locale, t, toggleLanguage } = useLanguage();

  // Apply interactive spotlight effect
  useSpotlight();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate invitation code for this device
      const isValid = await validateInvitationCode(invitationCode);
      
      if (isValid) {
        onValidCode();
      } else {
        setError(t('invitation.invalidCode'));
        setTimeout(() => {
          setCurrentView('email');
        }, 2000);
      }
    } catch (error) {
      setError(t('invitation.connectionError'));
      console.error('Error validating code:', error);
    }
    
    setIsLoading(false);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!validateEmail(email)) {
      setError(t('invitation.invalidEmail'));
      setIsLoading(false);
      return;
    }

    try {
      // Store email in Firebase waitlist collection
      await addToWaitlist(email);
      setCurrentView('success');
    } catch (error) {
      setError(t('invitation.submitError'));
      console.error('Error submitting email:', error);
    }
    
    setIsLoading(false);
  };

  const resetToCode = () => {
    setCurrentView('code');
    setError('');
    setEmail('');
    setInvitationCode('');
  };

  // Development helper - add to window for easy testing
  if (typeof window !== 'undefined') {
    (window as any).clearInvitationGate = async () => {
      const { clearInvitationData } = await import('../services/invitationService');
      clearInvitationData();
      window.location.reload();
    };
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0a0a] text-white">
      {/* Hero background with circuit design */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-90"
        style={{ backgroundImage: 'url(/images/hero-bg.svg)' }}
      />

      {/* Subtle animated overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />

      {/* Language toggle button */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-lg border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200"
          aria-label="Toggle language"
        >
          <Globe className="w-4 h-4 text-white/80" />
          <span className="font-medium text-sm text-white/90">
            {locale === 'en' ? 'ES' : 'EN'}
          </span>
          <div className="flex items-center gap-1">
            <span className={`text-xs ${locale === 'en' ? 'opacity-100' : 'opacity-40'}`}>
              🇨🇦
            </span>
            <span className={`text-xs ${locale === 'es' ? 'opacity-100' : 'opacity-40'}`}>
              🇨🇴
            </span>
          </div>
        </button>
      </div>

      <section className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6">

        {/* Brand Title - Large and bold */}
        <h1 className="text-6xl md:text-8xl font-black tracking-tight text-white text-center mb-6 leading-none">
          {t('invitation.title')}
        </h1>

        {/* Subtitle with welcoming message */}
        <p className="mt-3 text-lg md:text-xl text-white/70 max-w-3xl text-center mb-12 leading-relaxed">
          {t('invitation.subtitle')}
        </p>

        {/* Main card dialog */}
        <div className="mt-4 w-full max-w-xl bg-black/40 backdrop-blur-xl rounded-2xl p-8 md:p-10 border border-white/10 shadow-2xl">
          {currentView === 'code' && (
            <>
            <form onSubmit={handleCodeSubmit} className="space-y-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <input
                  id="invitation-code"
                  type="text"
                  value={invitationCode}
                  onChange={(e) => setInvitationCode(e.target.value)}
                  placeholder={t('invitation.codePlaceholder')}
                  className="flex-1 h-14 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm px-3 sm:px-5 text-white placeholder-white/40 outline-none transition-all duration-200
                           focus:border-[#C8E400]/60 focus:bg-white/10 uppercase tracking-wide text-center font-mono text-xs sm:text-base"
                  required
                  disabled={isLoading}
                />

                <button
                  type="submit"
                  disabled={isLoading || !invitationCode.trim()}
                  className="h-14 px-6 sm:px-8 rounded-xl font-semibold tracking-wide text-black text-sm sm:text-base
                           bg-[#C8E400] hover:bg-[#d4f000]
                           transition-all duration-200 hover:scale-105
                           focus:outline-none focus:ring-4 focus:ring-[#C8E400]/35
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                           flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                      <span className="hidden sm:inline">{t('invitation.verifying')}</span>
                    </>
                  ) : (
                    <>
                      {t('invitation.accessButton')}
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}
            </form>

            {/* Request access option */}
            <div className="pt-6 border-t border-white/10">
              <div className="text-center space-y-3">
                <p className="text-white/60 text-sm">
                  {t('invitation.noCode')}
                </p>
                <button
                  onClick={() => setCurrentView('email')}
                  className="text-[#C8E400] hover:text-[#d4f000] font-medium text-sm transition-colors duration-200 underline decoration-2 underline-offset-2"
                >
                  {t('invitation.requestAccessLink')}
                </button>
              </div>
            </div>
            </>
          )}

          {currentView === 'email' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#C8E400]/10 rounded-2xl mb-4 border border-[#C8E400]/20">
                  <Mail className="w-8 h-8 text-[#C8E400]" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">
                  {t('invitation.requestTitle')}
                </h2>
                <p className="text-white/70 text-lg">
                  {t('invitation.requestSubtitle')}
                </p>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('invitation.emailPlaceholder')}
                    className="flex-1 h-14 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm px-3 sm:px-5 text-white placeholder-white/40 outline-none transition-all duration-200
                             focus:border-[#C8E400]/60 focus:bg-white/10 text-xs sm:text-base"
                    required
                    disabled={isLoading}
                  />

                  <button
                    type="submit"
                    disabled={isLoading || !email.trim()}
                    className="h-14 px-6 sm:px-8 rounded-xl font-semibold tracking-wide text-black text-sm sm:text-base
                             bg-[#C8E400] hover:bg-[#d4f000]
                             transition-all duration-200 hover:scale-105
                             focus:outline-none focus:ring-4 focus:ring-[#C8E400]/35
                             disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                             flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                        <span className="hidden sm:inline">{t('invitation.submitting')}</span>
                      </>
                    ) : (
                      <>
                        {t('invitation.requestButton')}
                      </>
                    )}
                  </button>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-4 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-xl">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                )}
              </form>

              <div className="text-center pt-2">
                <button
                  onClick={resetToCode}
                  className="text-white/60 hover:text-white text-sm transition-colors"
                >
                  {t('invitation.backToCode')}
                </button>
              </div>
            </div>
          )}

          {currentView === 'success' && (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/10 backdrop-blur-sm rounded-full mb-4 border border-green-500/20">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-3">
                  {t('invitation.successTitle')}
                </h2>
                <p className="text-white/70 mb-6 text-lg">
                  {t('invitation.successMessage')}
                </p>
                <div className="p-5 bg-[#C8E400]/10 backdrop-blur-sm border border-[#C8E400]/20 rounded-xl">
                  <p className="text-white/80 text-sm leading-relaxed">
                    <strong className="text-[#C8E400]">{t('invitation.successNext')}</strong>{' '}
                    {t('invitation.successNextMessage').split('@lulocart').map((part, index, array) => (
                      <React.Fragment key={index}>
                        {part}
                        {index < array.length - 1 && (
                          <a
                            href="https://www.instagram.com/lulocart/?hl=en"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#C8E400] hover:text-[#d4f000] font-semibold transition-colors underline decoration-2 underline-offset-2"
                          >
                            @lulocart
                          </a>
                        )}
                      </React.Fragment>
                    ))}
                  </p>
                </div>
              </div>

              <button
                onClick={resetToCode}
                className="text-white/60 hover:text-white font-medium transition-colors duration-200 underline decoration-2 underline-offset-2"
              >
                {t('invitation.tryAnotherCode')}
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};export default InvitationGate;
