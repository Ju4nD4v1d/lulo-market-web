import type * as React from 'react';
/**
 * LoginPage - Dual-mode login/register page
 */


import { useLanguage } from '../../context/LanguageContext';
import { COMPANY_NAME } from '../../config/company';
import { AuthLayout, FormMessage } from '../../components/shared/auth';
import { useLoginForm } from './hooks/useLoginForm';
import { LoginForm, RegisterForm } from './components';

export const LoginPage: React.FC = () => {
  const { t, locale } = useLanguage();
  const {
    isLogin,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    fullName,
    setFullName,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    error,
    success,
    isLoading,
    handleSubmit,
    switchTab,
    clearMessages
  } = useLoginForm({ t, locale });

  return (
    <AuthLayout
      heroTitle={isLogin ? `${t('auth.welcomeHero')} ${COMPANY_NAME}` : t('auth.joinTitle')}
      heroSubtitle={
        isLogin
          ? t('auth.welcomeSubtitle')
          : t('auth.joinSubtitle')
      }
      backLink="#"
      backText={t('auth.backToHome')}
    >
      {/* Tab Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 font-heading text-center">
          {t('auth.welcomeTitle')}
        </h1>

        {/* Tab Navigation */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => switchTab(true)}
            className={`
              flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200
              ${isLogin
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            {t('auth.signIn')}
          </button>
          <button
            onClick={() => switchTab(false)}
            className={`
              flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200
              ${!isLogin
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            {t('auth.createAccount')}
          </button>
        </div>

        <p className="text-gray-600 text-center">
          {isLogin
            ? t('auth.subtitle')
            : t('auth.registerSubtitle')
          }
        </p>
      </div>

      <FormMessage type="error" message={error} />
      <FormMessage type="success" message={success} />

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {isLogin ? (
          <LoginForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            clearMessages={clearMessages}
            t={t}
          />
        ) : (
          <RegisterForm
            fullName={fullName}
            setFullName={setFullName}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            showConfirmPassword={showConfirmPassword}
            setShowConfirmPassword={setShowConfirmPassword}
            clearMessages={clearMessages}
            t={t}
          />
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-primary-400 text-gray-900 py-3 px-4 rounded-lg
            hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2
            focus:ring-primary-400 font-medium transition-all duration-200
            transform hover:scale-[1.02] active:scale-[0.98]
            ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isLoading
            ? (isLogin ? t('auth.loading') : t('auth.creatingAccount'))
            : (isLogin ? t('auth.loginButton') : t('auth.createAccount'))
          }
        </button>

        {/* Trust Message */}
        <p className="text-center text-sm text-gray-600 mt-4">
          {isLogin
            ? t('auth.trustMessage')
            : t('auth.agreeToTerms')
          }
        </p>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
