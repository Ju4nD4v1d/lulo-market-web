import React, { useState, useEffect } from 'react';
import { Mail, Lock, AlertCircle, CheckCircle2, ArrowLeft, User, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { COMPANY_NAME } from '../config/company';
import { getAuthErrorMessage } from '../utils/auth-errors';


export const Login = () => {
  const { t, locale } = useLanguage();
  const { login, register, currentUser, redirectAfterLogin } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      // If there's a redirect path, use it; otherwise use default dashboard
      if (redirectAfterLogin) {
        window.location.hash = redirectAfterLogin;
      } else {
        window.location.hash = '#dashboard';
      }
    }
  }, [currentUser, redirectAfterLogin]);

  // Check URL parameters to determine initial mode
  useEffect(() => {
    const checkMode = () => {
      const hash = window.location.hash;
      if (hash.includes('mode=register')) {
        setIsLogin(false);
      } else {
        setIsLogin(true);
      }
    };

    checkMode();

    const handleHashChange = () => {
      checkMode();
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const validateForm = () => {
    if (!isLogin) {
      if (!fullName.trim()) {
        setError('Please enter your full name');
        return false;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        return false;
      }
    }
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return false;
    }
    
    if (!password.trim()) {
      setError('Please enter your password');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        window.location.hash = '#dashboard';
      } else {
        await register(email, password, fullName);
        setSuccess('Account created successfully! You can now access your dashboard.');
        setTimeout(() => {
          window.location.hash = '#dashboard';
        }, 1500);
      }
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err, locale));
    } finally {
      setIsLoading(false);
    }
  };

  const switchTab = (loginMode: boolean) => {
    setIsLogin(loginMode);
    setError('');
    setSuccess('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    
    // Update URL to reflect current mode
    if (loginMode) {
      window.location.hash = '#login';
    } else {
      window.location.hash = '#login?mode=register';
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
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
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600/90 to-primary-600/70" />
          <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
            <h2 className="text-4xl font-bold mb-4 font-heading">
              {isLogin ? `${t('auth.welcomeHero')} ${COMPANY_NAME}` : `Join ${COMPANY_NAME} Today`}
            </h2>
            <p className="text-lg text-white/90">
              {isLogin 
                ? t('auth.welcomeSubtitle')
                : 'Start your journey with us and connect with authentic Latin businesses in your community.'
              }
            </p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 bg-white flex flex-col">
        <a 
          href="#" 
          className="p-6 text-primary-600 hover:text-primary-700 flex items-center gap-2 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>{t('auth.backToHome')}</span>
        </a>

        <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md">
            {/* Tab Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-6 font-heading text-center">
                Welcome to {COMPANY_NAME}
              </h1>
              
              {/* Tab Navigation */}
              <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
                <button
                  onClick={() => switchTab(true)}
                  className={`
                    flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200
                    ${isLogin 
                      ? 'bg-white text-primary-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                    }
                  `}
                >
                  Sign In
                </button>
                <button
                  onClick={() => switchTab(false)}
                  className={`
                    flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200
                    ${!isLogin 
                      ? 'bg-white text-primary-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                    }
                  `}
                >
                  Create Account
                </button>
              </div>

              <p className="text-gray-600 text-center">
                {isLogin 
                  ? t('auth.subtitle')
                  : 'Join our community of Latin entrepreneurs and start growing your business today.'
                }
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

            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              {/* Full Name Field - Only for Registration */}
              <div className={`transition-all duration-300 ${isLogin ? 'hidden' : 'block'}`}>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      clearMessages();
                    }}
                    className="w-full pl-10 border border-gray-300 rounded-lg"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

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
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearMessages();
                    }}
                    className="w-full pl-10 border border-gray-300 rounded-lg"
                    placeholder={t('auth.emailPlaceholder')}
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
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearMessages();
                    }}
                    className="w-full pl-10 pr-10 border border-gray-300 rounded-lg"
                    placeholder={t('auth.passwordPlaceholder')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {!isLogin && (
                  <p className="mt-1 text-xs text-gray-500">
                    Password must be at least 6 characters long
                  </p>
                )}
              </div>

              {/* Confirm Password Field - Only for Registration */}
              <div className={`transition-all duration-300 ${isLogin ? 'hidden' : 'block'}`}>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      clearMessages();
                    }}
                    className="w-full pl-10 pr-10 border border-gray-300 rounded-lg"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password - Only for Login */}
              {isLogin && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      className="h-4 w-4 border-gray-300 rounded"
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
                {isLoading 
                  ? (isLogin ? t('auth.loading') : 'Creating Account...') 
                  : (isLogin ? t('auth.loginButton') : 'Create Account')
                }
              </button>

              {/* Trust Message */}
              <p className="text-center text-sm text-gray-600 mt-4">
                {isLogin 
                  ? t('auth.trustMessage')
                  : 'By creating an account, you agree to our Terms of Service and Privacy Policy.'
                }
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};