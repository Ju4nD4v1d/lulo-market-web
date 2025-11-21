import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!email) {
      setError(t('forgot.emailRequired'));
      return;
    }

    setIsLoading(true);
    
    try {
      await resetPassword(email);
      setSuccess(t('forgot.success'));
      setEmail(''); // Clear the email field after success
    } catch (error: any) {
      // Handle Firebase auth errors
      if (error.code === 'auth/user-not-found') {
        setError(t('forgot.userNotFound'));
      } else if (error.code === 'auth/invalid-email') {
        setError(t('forgot.invalidEmail'));
      } else {
        setError(t('forgot.errorGeneric'));
      }
      console.error('Password reset error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:block w-1/2 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/registration.png')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary-400/70 to-primary-500/50" />
          <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
            <h2 className="text-4xl font-bold mb-4 font-heading">
              {t('forgot.heroTitle')}
            </h2>
            <p className="text-lg text-white/90">
              {t('forgot.heroSubtitle')}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 bg-white flex flex-col">
        <a 
          href="#login" 
          className="p-6 text-primary-500 hover:text-primary-600 flex items-center gap-2 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>{t('forgot.back')}</span>
        </a>

        <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4 font-heading">
                {t('forgot.title')}
              </h1>
              <p className="text-gray-600">
                {t('forgot.description')}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 rounded-lg flex items-center text-red-700">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 rounded-lg flex items-center text-green-700">
                <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0" />
                <p className="text-sm">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('forgot.email')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 border border-gray-300 rounded-lg"
                    placeholder={t('forgot.emailPlaceholder')}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full bg-primary-400 text-gray-900 py-3 px-4 rounded-lg
                  hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2
                  focus:ring-primary-400 font-medium transition-all duration-200
                  transform hover:scale-[1.02] active:scale-[0.98]
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? t('forgot.sending') : t('forgot.submit')}
              </button>

              <p className="text-center text-sm text-gray-600 mt-4">
                {t('forgot.remember')} <a href="#login" className="text-primary-600 hover:text-primary-700 font-medium">{t('forgot.signIn')}</a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
