import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, Building2, Mail, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

interface ContactFormProps {
  onBack: () => void;
}

export const ContactForm: React.FC<ContactFormProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    fullName: '',
    businessEmail: '',
    phoneNumber: '',
    businessName: '',
    contactPreference: ''
  });
  const [errors, setErrors] = useState({
    fullName: '',
    businessEmail: '',
    phoneNumber: '',
    businessName: '',
    contactPreference: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Load Calendly widget after successful submission
  useEffect(() => {
    if (isSubmitted) {
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
        // Initialize Calendly badge widget
        if (window.Calendly) {
          window.Calendly.initBadgeWidget({
            url: 'https://calendly.com/juandavidortegat/15min',
            text: t('contact.calendlyButton'),
            color: '#c7e402',
            textColor: '#ffffff'
          });
        }
      };
      document.head.appendChild(script);

      // Cleanup function
      return () => {
        document.head.removeChild(link);
        document.head.removeChild(script);
      };
    }
  }, [isSubmitted, t]);

  const validateForm = () => {
    const newErrors = {
      fullName: '',
      businessEmail: '',
      phoneNumber: '',
      businessName: '',
      contactPreference: ''
    };
    let isValid = true;

    if (!formData.fullName.trim()) {
      newErrors.fullName = t('contact.error.name');
      isValid = false;
    }

    if (!formData.businessEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.businessEmail)) {
      newErrors.businessEmail = t('contact.error.email');
      isValid = false;
    }

    if (!formData.businessName.trim()) {
      newErrors.businessName = t('contact.error.company');
      isValid = false;
    }

    if (!formData.contactPreference) {
      newErrors.contactPreference = t('contact.error.contactPreference');
      isValid = false;
    }

    if (formData.contactPreference === 'phone' && !formData.phoneNumber.trim()) {
      newErrors.phoneNumber = t('contact.error.phone');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await addDoc(collection(db, 'potentialLeads'), {
        fullName: formData.fullName,
        businessEmail: formData.businessEmail,
        phoneNumber: formData.phoneNumber || null,
        businessName: formData.businessName,
        preferredContactMethod: formData.contactPreference,
        submittedAt: serverTimestamp()
      });

      setIsSubmitted(true);
    } catch (error) {
      console.error('Error saving lead:', error);
      setSubmitError('Failed to save your information. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg w-full text-center space-y-8 bg-white rounded-2xl shadow-xl p-12">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-primary-100 rounded-full animate-pulse" />
            </div>
            <div className="relative text-6xl mb-4">🎉</div>
          </div>
          
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {t('contact.successTitle')}
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {t('contact.successMessage')}
            </p>
            
            <div className="bg-primary-50 rounded-lg p-6 mb-8">
              <p className="text-primary-800 font-medium">
                📅 {t('contact.successNote')}
              </p>
            </div>
          </div>

          <button
            onClick={onBack}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent 
              text-base font-medium rounded-xl text-primary-700 bg-primary-100 
              hover:bg-primary-200 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {t('contact.backToPlans')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          {t('contact.back')}
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="md:flex">
            {/* Left Panel */}
            <div className="md:w-1/2 bg-primary-600 p-12 text-white">
              <h2 className="text-3xl font-bold mb-6">
                {t('contact.welcomeTitle')}
              </h2>
              <p className="text-xl mb-8 text-white/90">
                {t('contact.welcomeMessage')}
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-white/10 p-3 rounded-lg">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold mb-1">{t('contact.benefit1.title')}</h3>
                    <p className="text-white/80">{t('contact.benefit1.description')}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-white/10 p-3 rounded-lg">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold mb-1">{t('contact.benefit2.title')}</h3>
                    <p className="text-white/80">{t('contact.benefit2.description')}</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-12 border-t border-white/20">
                <p className="text-white/90 italic">
                  "{t('contact.testimonial')}"
                </p>
                <div className="mt-4">
                  <p className="font-semibold">{t('contact.testimonialAuthor')}</p>
                  <p className="text-white/80">{t('contact.testimonialRole')}</p>
                </div>
              </div>
            </div>

            {/* Right Panel */}
            <div className="md:w-1/2 p-12">
              <div className="max-w-sm mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {t('contact.formTitle')}
                </h3>
                <p className="text-gray-600 mb-8">
                  {t('contact.formSubtitle')}
                </p>

                {submitError && (
                  <div className="mb-6 p-4 bg-red-50 rounded-lg text-red-600">
                    {submitError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                      {t('contact.name')}
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      placeholder={t('contact.namePlaceholder')}
                      className={`mt-1 block w-full rounded-lg ${
                        errors.fullName ? 'border-red-300' : 'border-gray-300'
                      }`}
                      disabled={isSubmitting}
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="businessEmail" className="block text-sm font-medium text-gray-700">
                      {t('contact.email')}
                    </label>
                    <input
                      id="businessEmail"
                      type="email"
                      value={formData.businessEmail}
                      onChange={(e) => handleInputChange('businessEmail', e.target.value)}
                      placeholder={t('contact.emailPlaceholder')}
                      className={`mt-1 block w-full rounded-lg ${
                        errors.businessEmail ? 'border-red-300' : 'border-gray-300'
                      }`}
                      disabled={isSubmitting}
                    />
                    {errors.businessEmail && (
                      <p className="mt-1 text-sm text-red-600">{errors.businessEmail}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                      {t('contact.phone')}
                    </label>
                    <input
                      id="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      placeholder={t('contact.phonePlaceholder')}
                      className={`mt-1 block w-full rounded-lg ${
                        errors.phoneNumber ? 'border-red-300' : 'border-gray-300'
                      }`}
                      disabled={isSubmitting}
                    />
                    {errors.phoneNumber && (
                      <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                      {t('contact.company')}
                    </label>
                    <input
                      id="businessName"
                      type="text"
                      value={formData.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      placeholder={t('contact.companyPlaceholder')}
                      className={`mt-1 block w-full rounded-lg ${
                        errors.businessName ? 'border-red-300' : 'border-gray-300'
                      }`}
                      disabled={isSubmitting}
                    />
                    {errors.businessName && (
                      <p className="mt-1 text-sm text-red-600">{errors.businessName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('contact.contactPreference')}
                    </label>
                    <div className="flex space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          value="email"
                          checked={formData.contactPreference === 'email'}
                          onChange={(e) => handleInputChange('contactPreference', e.target.value)}
                          className="form-radio text-primary-600"
                          disabled={isSubmitting}
                        />
                        <span className="ml-2">{t('contact.contactEmail')}</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          value="phone"
                          checked={formData.contactPreference === 'phone'}
                          onChange={(e) => handleInputChange('contactPreference', e.target.value)}
                          className="form-radio text-primary-600"
                          disabled={isSubmitting}
                        />
                        <span className="ml-2">{t('contact.contactPhone')}</span>
                      </label>
                    </div>
                    {errors.contactPreference && (
                      <p className="mt-1 text-sm text-red-600">{errors.contactPreference}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary-600 text-white py-3 px-6 rounded-xl
                      hover:bg-primary-700 transition-all duration-200 transform
                      hover:scale-[1.02] active:scale-[0.98] font-medium
                      flex items-center justify-center
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin mr-2">⌛</span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        {t('contact.submit')}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};