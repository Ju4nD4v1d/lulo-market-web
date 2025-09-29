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
    <main className="relative min-h-screen overflow-hidden bg-lulo text-slate-900 grain-overlay">
      {/* Animated background layers */}
      <div className="pointer-events-none absolute inset-0 blobs" />
      <div className="pointer-events-none absolute inset-0 spotlight" />

      {/* Language toggle button */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-white/30 hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          aria-label="Toggle language"
        >
          <Globe className="w-4 h-4" />
          <span className="font-medium text-sm">
            {locale === 'en' ? 'ES' : 'EN'}
          </span>
          <div className="flex items-center gap-1">
            <span className={`text-xs ${locale === 'en' ? 'opacity-100' : 'opacity-50'}`}>
              🇨🇦
            </span>
            <span className={`text-xs ${locale === 'es' ? 'opacity-100' : 'opacity-50'}`}>
              🇨🇴
            </span>
          </div>
        </button>
      </div>

      <section className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6">
        {/* Brand Title */}
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-sm">
          {t('invitation.title')}
        </h1>
        
        {/* Subtitle with welcoming message */}
        <p className="mt-3 text-base md:text-lg text-slate-700 max-w-2xl text-center">
          {t('invitation.subtitle')}
        </p>

        {/* Main card dialog */}
        <div className="mt-8 w-full max-w-md card-glass rounded-3xl p-6 md:p-8 transition-all duration-200 will-change-transform hover:-translate-y-0.5 hover:shadow-[0_35px_90px_-25px_rgba(15,23,42,.18),0_8px_20px_rgba(15,23,42,.08)]">
          {currentView === 'code' && (
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <label className="block text-sm font-medium text-slate-600 mb-2">
                {t('invitation.codeLabel')}
              </label>
              <input
                id="invitation-code"
                type="text"
                value={invitationCode}
                onChange={(e) => setInvitationCode(e.target.value)}
                placeholder={t('invitation.codePlaceholder')}
                className="h-12 w-full rounded-2xl border border-slate-300/60 bg-white/80 px-4 text-slate-800 placeholder-slate-400 outline-none transition-all duration-200
                         focus:border-brand/60 focus:ring-4 focus:ring-brand/25 uppercase tracking-wider text-center font-mono"
                required
                disabled={isLoading}
              />

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50/80 backdrop-blur-sm border border-red-200/60 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !invitationCode.trim()}
                className="mt-4 h-12 w-full rounded-2xl font-semibold tracking-wide text-slate-900
                         bg-brand shadow-[0_8px_20px_-8px_rgba(133,169,0,.55)] 
                         active:shadow-[0_6px_16px_-8px_rgba(133,169,0,.55)]
                         transition-all duration-200 hover:-translate-y-0.5 
                         focus:outline-none focus:ring-4 focus:ring-brand/35
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
                         flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
                    {t('invitation.verifying')}
                  </>
                ) : (
                  <>
                    {t('invitation.accessButton')}
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {currentView === 'email' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-brand/10 rounded-2xl mb-4">
                  <Mail className="w-6 h-6 text-slate-700" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  {t('invitation.requestTitle')}
                </h2>
                <p className="text-slate-600">
                  {t('invitation.requestSubtitle')}
                </p>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-600 mb-2">
                    {t('invitation.emailLabel')}
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('invitation.emailPlaceholder')}
                    className="h-12 w-full rounded-2xl border border-slate-300/60 bg-white/80 px-4 text-slate-800 placeholder-slate-400 outline-none transition-all duration-200
                             focus:border-brand/60 focus:ring-4 focus:ring-brand/25"
                    required
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50/80 backdrop-blur-sm border border-red-200/60 rounded-xl">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className="h-12 w-full rounded-2xl font-semibold tracking-wide text-slate-900
                           bg-brand shadow-[0_8px_20px_-8px_rgba(133,169,0,.55)] 
                           active:shadow-[0_6px_16px_-8px_rgba(133,169,0,.55)]
                           transition-all duration-200 hover:-translate-y-0.5 
                           focus:outline-none focus:ring-4 focus:ring-brand/35
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
                           flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
                      {t('invitation.submitting')}
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      {t('invitation.requestButton')}
                    </>
                  )}
                </button>
              </form>

              <div className="text-center">
                <button
                  onClick={resetToCode}
                  className="text-slate-500 hover:text-slate-700 text-sm transition-colors"
                >
                  {t('invitation.backToCode')}
                </button>
              </div>
            </div>
          )}

          {currentView === 'success' && (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100/80 backdrop-blur-sm rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  {t('invitation.successTitle')}
                </h2>
                <p className="text-slate-600 mb-4">
                  {t('invitation.successMessage')}
                </p>
                <div className="p-4 bg-amber-50/80 backdrop-blur-sm border border-amber-200/60 rounded-xl">
                  <p className="text-amber-800 text-sm">
                    <strong>{t('invitation.successNext')}</strong> {t('invitation.successNextMessage')}
                  </p>
                </div>
              </div>

              <button
                onClick={resetToCode}
                className="text-slate-700 hover:text-slate-900 font-medium transition-colors duration-200 underline decoration-2 underline-offset-2"
              >
                {t('invitation.tryAnotherCode')}
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};