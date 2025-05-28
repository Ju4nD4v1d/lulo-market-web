import React, { useState, useEffect } from 'react';
import { Mail, Lock, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { COMPANY_NAME } from '../config/company';
import { getAuthErrorMessage } from '../utils/auth-errors';

type AuthMode = 'login' | 'register';

export const Login = () => {
  const { t, locale } = useLanguage();
  const { login, register, currentUser } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Redirect if user is already logged in
    if (currentUser) {
      window.location.hash = '#dashboard';
    }
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        window.location.hash = '#dashboard';
      } else {
        await register(email, password);
        setSuccess(t('auth.registrationSuccess'));
        window.location.hash = '#dashboard';
      }
    } catch (err: any) {
      setError(getAuthErrorMessage(err, locale));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Image */}
      <div className="hidden lg:block w-1/2 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/registration.png')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600/90 to-primary-600/70" />
          <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
            <h2 className="text-4xl font-bold mb-4 font-heading">
              {t('auth.welcomeHero')} {COMPANY_NAME}
            </h2>
            <p className="text-lg text-white/90">
              {t('auth.welcomeSubtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col">
        {/* Back Button */}
        <a 
          href="#" 
          className="p-6 text-primary-600 hover:text-primary-700 flex items-center gap-2 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>{t('auth.backToHome')}</span>
        </a>

        <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md">
            {/* Welcome Text */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4 font-heading">
                {t('auth.welcomeMessage')} {COMPANY_NAME}
              </h1>
              <p className="text-gray-600">
                {t('auth.subtitle')}
              </p>
            </div>

            {/* Auth Mode Tabs */}
            <div className="flex mb-8 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setMode('login')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all duration-200
                  ${mode === 'login'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-primary-600'
                  }`}
              >
                {t('auth.login')}
              </button>
              <button
                onClick={() => setMode('register')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all duration-200
                  ${mode === 'register'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-primary-600'
                  }`}
              >
                {t('auth.register')}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 rounded-lg flex items-center text-red-700">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 rounded-lg flex items-center text-green-700">
                <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0" />
                <p className="text-sm">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.email')}
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
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                      placeholder-gray-400 text-gray-900"
                    placeholder={t('auth.emailPlaceholder')}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                      placeholder-gray-400 text-gray-900"
                    placeholder={t('auth.passwordPlaceholder')}
                    required
                  />
                </div>
              </div>

              {/* Additional Links */}
              {mode === 'login' && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      {t('auth.rememberMe')}
                    </label>
                  </div>
                  <a href="#forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                    {t('auth.forgotPassword')}
                  </a>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-primary-600 text-white py-3 px-4 rounded-lg
                  hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2
                  focus:ring-primary-500 font-medium transition-all duration-200
                  transform hover:scale-[1.02] active:scale-[0.98]
                  ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? t('auth.loading') : mode === 'login' ? t('auth.loginButton') : t('auth.registerButton')}
              </button>

              {/* Trust Message */}
              <p className="text-center text-sm text-gray-600 mt-4">
                {t('auth.trustMessage')}
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};