import type * as React from 'react';
/**
 * ForgotPasswordPage - Password reset request page
 */


import { Mail } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { AuthLayout, FormMessage } from '../../components/shared/auth';
import { useForgotPasswordForm } from './hooks/useForgotPasswordForm';

export const ForgotPasswordPage: React.FC = () => {
  const { t } = useLanguage();
  const {
    email,
    setEmail,
    error,
    success,
    isLoading,
    handleSubmit
  } = useForgotPasswordForm({ t });

  return (
    <AuthLayout
      heroTitle={t('forgot.heroTitle')}
      heroSubtitle={t('forgot.heroSubtitle')}
      backText={t('forgot.back')}
      backLink="#login"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 font-heading">
          {t('forgot.title')}
        </h1>
        <p className="text-gray-600">
          {t('forgot.description')}
        </p>
      </div>

      <FormMessage type="error" message={error} />
      <FormMessage type="success" message={success} />

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
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
