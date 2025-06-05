import React, { useState } from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { ContactForm } from './ContactForm';

export const Pricing = () => {
  const { t } = useLanguage();
  const [showContactForm, setShowContactForm] = useState(false);
  const [isYearly, setIsYearly] = useState(false);

  const handlePlanClick = () => {
    setShowContactForm(true);
  };

  if (showContactForm) {
    return <ContactForm onBack={() => setShowContactForm(false)} />;
  }

  return (
    <section id="pricing" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('pricing.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('pricing.subtitle')}
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center mt-8 space-x-4">
            <span className={`text-sm ${!isYearly ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              {t('pricing.monthly')}
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-gray-200"
              role="switch"
              aria-checked={isYearly}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isYearly ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-sm ${isYearly ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              {t('pricing.yearly')}
              <span className="ml-1.5 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                {t('pricing.savePercent')}
              </span>
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Basic Plan */}
          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {t('pricing.basic.title')}
              </h3>
              <div className="flex items-baseline mb-4">
                <span className="text-4xl font-bold text-primary-600">
                  {isYearly ? t('pricing.basic.yearlyPrice') : t('pricing.basic.monthlyPrice')}
                </span>
                <span className="text-gray-500 ml-2">
                  {isYearly ? t('pricing.yearly.period') : t('pricing.monthly.period')}
                </span>
              </div>
              <p className="text-gray-600">
                {t('pricing.basic.description')}
              </p>
            </div>

            <ul className="space-y-4 mb-8">
              {t('pricing.basic.features', { returnObjects: true }).map((feature: string) => (
                <li key={feature} className="flex items-center text-gray-700">
                  <Check className="w-5 h-5 text-primary-600 mr-3 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handlePlanClick('basic')}
              className="w-full bg-primary-600 text-white py-3 px-6 rounded-xl
                hover:bg-primary-700 transition-all duration-200 transform
                hover:scale-[1.02] active:scale-[0.98] font-medium
                flex items-center justify-center"
            >
              {t('pricing.getStarted')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>

          {/* Premium Plan */}
          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300
            relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
              {t('pricing.recommended')}
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {t('pricing.premium.title')}
              </h3>
              <div className="flex items-baseline mb-4">
                <span className="text-4xl font-bold text-primary-600">
                  {isYearly ? t('pricing.premium.yearlyPrice') : t('pricing.premium.monthlyPrice')}
                </span>
                <span className="text-gray-500 ml-2">
                  {isYearly ? t('pricing.yearly.period') : t('pricing.monthly.period')}
                </span>
              </div>
              <p className="text-gray-600">
                {t('pricing.premium.description')}
              </p>
            </div>

            <ul className="space-y-4 mb-8">
              {t('pricing.premium.features', { returnObjects: true }).map((feature: string) => (
                <li key={feature} className="flex items-center text-gray-700">
                  <Check className="w-5 h-5 text-primary-600 mr-3 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handlePlanClick('premium')}
              className="w-full bg-primary-600 text-white py-3 px-6 rounded-xl
                hover:bg-primary-700 transition-all duration-200 transform
                hover:scale-[1.02] active:scale-[0.98] font-medium
                flex items-center justify-center"
            >
              {t('pricing.getStarted')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>

        <p className="text-center text-gray-600 mt-8">
          {t('pricing.contactUs')}
        </p>
      </div>
    </section>
  );
};