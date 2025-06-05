import React, { useState } from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { ContactForm } from './ContactForm';

export const Pricing = () => {
  const { t } = useLanguage();
  const [showContactForm, setShowContactForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'premium' | null>(null);

  const handlePlanClick = (plan: 'basic' | 'premium') => {
    setSelectedPlan(plan);
    setShowContactForm(true);
  };

  if (showContactForm) {
    return <ContactForm onBack={() => setShowContactForm(false)} plan={selectedPlan} />;
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
                  {t('pricing.basic.price')}
                </span>
                <span className="text-gray-500 ml-2">
                  {t('pricing.basic.period')}
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
              Popular
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {t('pricing.premium.title')}
              </h3>
              <div className="flex items-baseline mb-4">
                <span className="text-4xl font-bold text-primary-600">
                  {t('pricing.premium.price')}
                </span>
                <span className="text-gray-500 ml-2">
                  {t('pricing.premium.period')}
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