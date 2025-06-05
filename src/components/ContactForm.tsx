import React, { useState } from 'react';
import { ArrowLeft, Send, CheckCircle2, Building2, Mail, Users, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ContactFormProps {
  onBack: () => void;
  plan: 'basic' | 'premium' | null;
}

export const ContactForm: React.FC<ContactFormProps> = ({ onBack, plan }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    employees: ''
  });
  const [errors, setErrors] = useState({ name: '', email: '', company: '', employees: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const validateForm = () => {
    const newErrors = { name: '', email: '', company: '', employees: '' };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = t('contact.error.name');
      isValid = false;
    }

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('contact.error.email');
      isValid = false;
    }

    if (!formData.company.trim()) {
      newErrors.company = t('contact.error.company');
      isValid = false;
    }

    if (!formData.employees.trim()) {
      newErrors.employees = t('contact.error.employees');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitted(true);
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
            <CheckCircle2 className="relative w-32 h-32 text-primary-600 mx-auto animate-scale" />
          </div>
          
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('contact.successTitle')}
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              {t('contact.successMessage')}
            </p>
            <p className="text-gray-500">
              {t('contact.successDetail')}
            </p>
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
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold mb-1">{t('contact.benefit1.title')}</h3>
                    <p className="text-white/80">{t('contact.benefit1.description')}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-white/10 p-3 rounded-lg">
                    <Building2 className="w-6 h-6" />
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

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      {t('contact.name')}
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder={t('contact.namePlaceholder')}
                      className={`mt-1 block w-full rounded-lg ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      {t('contact.email')}
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder={t('contact.emailPlaceholder')}
                      className={`mt-1 block w-full rounded-lg ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                      {t('contact.company')}
                    </label>
                    <input
                      id="company"
                      type="text"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      placeholder={t('contact.companyPlaceholder')}
                      className={`mt-1 block w-full rounded-lg ${
                        errors.company ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.company && (
                      <p className="mt-1 text-sm text-red-600">{errors.company}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="employees" className="block text-sm font-medium text-gray-700">
                      {t('contact.employees')}
                    </label>
                    <select
                      id="employees"
                      value={formData.employees}
                      onChange={(e) => handleInputChange('employees', e.target.value)}
                      className={`mt-1 block w-full rounded-lg ${
                        errors.employees ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">{t('contact.employeesPlaceholder')}</option>
                      <option value="1-10">1-10</option>
                      <option value="11-50">11-50</option>
                      <option value="51-200">51-200</option>
                      <option value="201+">201+</option>
                    </select>
                    {errors.employees && (
                      <p className="mt-1 text-sm text-red-600">{errors.employees}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary-600 text-white py-3 px-6 rounded-xl
                      hover:bg-primary-700 transition-all duration-200 transform
                      hover:scale-[1.02] active:scale-[0.98] font-medium
                      flex items-center justify-center"
                  >
                    {t('contact.submit')}
                    <ArrowRight className="w-5 h-5 ml-2" />
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