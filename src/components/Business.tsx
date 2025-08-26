import React, { useState } from 'react';
import { ArrowLeft, LogIn, Eye, EyeOff, Store, TrendingUp, Shield, Star, Check, Users, Mail, Phone, Calendar, Clock, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export const Business = () => {
  const { t } = useLanguage();
  const { portalLogin, setRedirectAfterLogin } = useAuth();
  const [showPortalLogin, setShowPortalLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const handlePortalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    
    try {
      // Use the dedicated Portal login method
      const hasStoreOwnerPermissions = await portalLogin(loginData.email, loginData.password);
      
      if (!hasStoreOwnerPermissions) {
        // User is not a store owner - deny access
        setLoginError(t('business.login.accessDenied'));
        setIsLoggingIn(false);
        return;
      }
      
      // User has permissions - proceed with redirect
      setShowPortalLogin(false);
      // For business portal login, always redirect to dashboard regardless of redirectAfterLogin
      setRedirectAfterLogin('#dashboard');
      // The redirect will be handled by the auth context
      
    } catch (error: unknown) {
      console.error('Login error:', error);
      setLoginError(error instanceof Error ? error.message : t('business.login.error'));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const openCalendly = () => {
    // Load Calendly script only when needed
    if (!window.Calendly) {
      // Add Calendly CSS
      const link = document.createElement('link');
      link.href = 'https://assets.calendly.com/assets/external/widget.css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);

      // Add Calendly script
      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      script.onload = () => {
        // Trigger Calendly popup after script loads
        if (window.Calendly) {
          window.Calendly.showPopupWidget('https://calendly.com/juandavidortegat/15min');
        }
      };
      document.head.appendChild(script);
    } else {
      // Trigger Calendly popup if already loaded
      window.Calendly.showPopupWidget('https://calendly.com/juandavidortegat/15min');
    }
  };

  // Business Contact Form Component
  const BusinessContactForm = () => {
    const [formData, setFormData] = useState({
      fullName: '',
      businessEmail: '',
      phoneNumber: '',
      businessName: '',
      contactPreference: '',
      agreeToTerms: false
    });
    const [errors, setErrors] = useState({
      fullName: '',
      businessEmail: '',
      phoneNumber: '',
      businessName: '',
      contactPreference: '',
      agreeToTerms: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const validateForm = () => {
      const newErrors = {
        fullName: '',
        businessEmail: '',
        phoneNumber: '',
        businessName: '',
        contactPreference: '',
        agreeToTerms: ''
      };
      let isValid = true;

      if (!formData.fullName.trim()) {
        newErrors.fullName = t('business.contact.form.error.name');
        isValid = false;
      }

      if (!formData.businessEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.businessEmail)) {
        newErrors.businessEmail = t('business.contact.form.error.email');
        isValid = false;
      }

      if (!formData.businessName.trim()) {
        newErrors.businessName = t('business.contact.form.error.business');
        isValid = false;
      }

      if (!formData.contactPreference) {
        newErrors.contactPreference = t('business.contact.form.error.preference');
        isValid = false;
      }

      if (formData.contactPreference === 'phone' && !formData.phoneNumber.trim()) {
        newErrors.phoneNumber = t('business.contact.form.error.phone');
        isValid = false;
      }

      if (!formData.agreeToTerms) {
        newErrors.agreeToTerms = t('business.contact.form.error.terms');
        isValid = false;
      }

      setErrors(newErrors);
      return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateForm()) return;

      setIsSubmitting(true);

      try {
        await addDoc(collection(db, 'potentialLeads'), {
          fullName: formData.fullName,
          businessEmail: formData.businessEmail,
          phoneNumber: formData.phoneNumber || null,
          businessName: formData.businessName,
          preferredContactMethod: formData.contactPreference,
          submittedAt: serverTimestamp(),
          privacyConsent: {
            accepted: formData.agreeToTerms,
            acceptedAt: serverTimestamp(),
            version: 'v1.0'
          }
        });

        setIsSubmitted(true);
      } catch (error) {
        console.error('Error saving lead:', error);
        alert(t('business.contact.form.error.submit'));
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleInputChange = (field: string, value: string | boolean) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      setErrors(prev => ({ ...prev, [field]: '' }));
    };

    if (isSubmitted) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            {t('business.contact.form.success.title')}
          </h3>
          <p className="text-gray-600 mb-4">
            {t('business.contact.form.success.message')}
          </p>
          <p className="text-sm text-gray-500">
            {t('business.contact.form.success.response')}
          </p>
        </div>
      );
    }

    return (
      <>
        {!isSubmitted && (
          <div className="mb-6">
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {t('business.contact.formTitle')}
            </h3>
            <p className="text-gray-600 text-sm">
              {t('business.contact.formDescription')}
            </p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
            {t('business.contact.form.fullName')}
          </label>
          <input
            id="fullName"
            type="text"
            value={formData.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            placeholder={t('business.contact.form.fullNamePlaceholder')}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
              errors.fullName ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
          )}
        </div>

        <div>
          <label htmlFor="businessEmail" className="block text-sm font-medium text-gray-700 mb-2">
            {t('business.contact.form.businessEmail')}
          </label>
          <input
            id="businessEmail"
            type="email"
            value={formData.businessEmail}
            onChange={(e) => handleInputChange('businessEmail', e.target.value)}
            placeholder={t('business.contact.form.businessEmailPlaceholder')}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
              errors.businessEmail ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          />
          {errors.businessEmail && (
            <p className="mt-1 text-sm text-red-600">{errors.businessEmail}</p>
          )}
        </div>

        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
            {t('business.contact.form.phoneNumber')}
          </label>
          <input
            id="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            placeholder={t('business.contact.form.phoneNumberPlaceholder')}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
              errors.phoneNumber ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          />
          {errors.phoneNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
          )}
        </div>

        <div>
          <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
            {t('business.contact.form.businessName')}
          </label>
          <input
            id="businessName"
            type="text"
            value={formData.businessName}
            onChange={(e) => handleInputChange('businessName', e.target.value)}
            placeholder={t('business.contact.form.businessNamePlaceholder')}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
              errors.businessName ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          />
          {errors.businessName && (
            <p className="mt-1 text-sm text-red-600">{errors.businessName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {t('business.contact.form.contactPreference')}
          </label>
          <div className="flex space-x-6">
            <label className="flex items-center">
              <input
                type="radio"
                value="email"
                checked={formData.contactPreference === 'email'}
                onChange={(e) => handleInputChange('contactPreference', e.target.value)}
                className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                disabled={isSubmitting}
              />
              <span className="ml-2 text-sm text-gray-700">{t('business.contact.form.email')}</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="phone"
                checked={formData.contactPreference === 'phone'}
                onChange={(e) => handleInputChange('contactPreference', e.target.value)}
                className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                disabled={isSubmitting}
              />
              <span className="ml-2 text-sm text-gray-700">{t('business.contact.form.phone')}</span>
            </label>
          </div>
          {errors.contactPreference && (
            <p className="mt-1 text-sm text-red-600">{errors.contactPreference}</p>
          )}
        </div>

        <div>
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={formData.agreeToTerms}
              onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
              className={`mt-1 w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded ${
                errors.agreeToTerms ? 'border-red-300' : ''
              }`}
              disabled={isSubmitting}
            />
            <span className="ml-2 text-sm text-gray-700">
              {t('business.contact.form.agreeToTerms')}{' '}
              <a 
                href="#privacy" 
                className="text-orange-600 hover:text-orange-700 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('business.contact.form.privacyPolicy')}
              </a>
              {' '}{t('business.contact.form.and')}{' '}
              <a 
                href="#terms" 
                className="text-orange-600 hover:text-orange-700 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('business.contact.form.termsOfService')}
              </a>
              .
            </span>
          </label>
          {errors.agreeToTerms && (
            <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
              <span>{t('business.contact.form.submitting')}</span>
            </>
          ) : (
            <>
              <span>{t('business.contact.form.submit')}</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.location.hash = '#'}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">{t('business.backToMarketplace')}</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <span className="text-xl font-bold text-gray-900">LuloCart</span>
            </div>
            
            {/* Portal Login Button */}
            <button
              onClick={() => {
                // Clear any existing redirect to ensure business login goes to dashboard
                setRedirectAfterLogin(null);
                setShowPortalLogin(true);
              }}
              className="btn-secondary px-6 py-2 flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              {t('business.portalLogin')}
            </button>
          </div>
        </div>
      </header>

      {/* Portal Login Modal */}
      {showPortalLogin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium text-gray-900">{t('business.login.title')}</h2>
              <button
                onClick={() => setShowPortalLogin(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handlePortalLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('business.login.email')}
                </label>
                <input
                  type="email"
                  required
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                  placeholder={t('business.login.emailPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('business.login.password')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 pr-12"
                    placeholder={t('business.login.passwordPlaceholder')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="btn-secondary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingIn ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogIn className="w-5 h-5" />
                )}
                {isLoggingIn ? 'Signing In...' : t('business.login.submit')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Main Content - Business Landing Page */}
      <main>
        {/* Hero Section */}
        <section className="py-16 lg:py-20 relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 via-white to-blue-50/30"></div>
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl"></div>
          
          <div className="relative max-w-6xl mx-auto px-4 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Content */}
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-full border border-orange-200 mb-6">
                  <Star className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-semibold text-orange-600">{t('business.hero.badge')}</span>
                </div>
                <h1 className="text-3xl lg:text-5xl xl:text-6xl font-light text-gray-900 mb-6 leading-tight">
                  {t('business.hero.title')}
                </h1>
                <p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0 font-light leading-relaxed mb-8">
                  {t('business.hero.description')}
                </p>
                
                {/* Key Features */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto lg:mx-0">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>{t('business.hero.feature1')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>{t('business.hero.feature2')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{t('business.hero.feature3')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>{t('business.hero.feature4')}</span>
                  </div>
                </div>
              </div>

              {/* Visual Element */}
              <div className="relative">
                <div className="bg-gradient-to-br from-orange-100 to-blue-100 rounded-2xl p-8 shadow-2xl">
                  {/* Simulated app interface */}
                  <div className="bg-white rounded-xl p-6 mb-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                        <Store className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{t('business.hero.demo.storeName')}</div>
                        <div className="text-xs text-gray-500">{t('business.hero.demo.storeType')}</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{t('business.hero.demo.orders')}</span>
                        <span className="text-sm font-medium text-green-600">{t('business.hero.demo.ordersStatus')}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{t('business.hero.demo.products')}</span>
                        <span className="text-sm font-medium text-blue-600">{t('business.hero.demo.productsStatus')}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{t('business.hero.demo.customers')}</span>
                        <span className="text-sm font-medium text-purple-600">{t('business.hero.demo.customersStatus')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 shadow-md">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-orange-600" />
                        <span className="text-xs font-medium text-gray-700">{t('business.hero.demo.growth')}</span>
                      </div>
                      <div className="text-sm text-gray-600">{t('business.hero.demo.growthDesc')}</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-md">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-medium text-gray-700">{t('business.hero.demo.reach')}</span>
                      </div>
                      <div className="text-sm text-gray-600">{t('business.hero.demo.reachDesc')}</div>
                    </div>
                  </div>
                </div>
                
                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <Star className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 lg:py-20 bg-white/50">
          <div className="max-w-6xl mx-auto px-4 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-2xl lg:text-3xl font-light text-gray-900 mb-4">
                {t('business.benefits.title')}
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {t('business.benefits.description')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-8 border border-gray-200/60 hover:shadow-lg transition-shadow">
                <div className="bg-orange-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">{t('business.benefits.growth.title')}</h3>
                <p className="text-gray-600">{t('business.benefits.growth.description')}</p>
              </div>

              <div className="bg-white rounded-xl p-8 border border-gray-200/60 hover:shadow-lg transition-shadow">
                <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">{t('business.benefits.customers.title')}</h3>
                <p className="text-gray-600">{t('business.benefits.customers.description')}</p>
              </div>

              <div className="bg-white rounded-xl p-8 border border-gray-200/60 hover:shadow-lg transition-shadow">
                <div className="bg-green-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">{t('business.benefits.support.title')}</h3>
                <p className="text-gray-600">{t('business.benefits.support.description')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl lg:text-3xl font-light text-gray-900 mb-4">
                {t('business.contact.title')}
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {t('business.contact.description')}
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Contact Form */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl p-8 border border-gray-200/60 shadow-lg">
                  <BusinessContactForm />
                </div>
              </div>

              {/* Schedule Call & Additional Options */}
              <div className="space-y-6">
                {/* Schedule Call */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200/60 shadow-lg">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t('business.contact.scheduleCall.title')}
                    </h3>
                    <p className="text-gray-600 text-sm mb-6">
                      {t('business.contact.scheduleCall.description')}
                    </p>
                    <button
                      onClick={openCalendly}
                      className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Calendar className="w-5 h-5" />
                      {t('business.contact.scheduleCall.button')}
                    </button>
                  </div>
                </div>

                {/* Quick Contact Options */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200/60 shadow-lg">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    {t('business.contact.quickOptions.title')}
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <Mail className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {t('business.contact.quickOptions.email')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {t('business.contact.quickOptions.emailDesc')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Phone className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {t('business.contact.quickOptions.phone')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {t('business.contact.quickOptions.phoneDesc')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {t('business.contact.quickOptions.support')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {t('business.contact.quickOptions.supportDesc')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Response Time */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200/60">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">
                      {t('business.contact.responseTime.title')}
                    </h4>
                    <p className="text-xs text-gray-600">
                      {t('business.contact.responseTime.description')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
};
