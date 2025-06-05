import React, { useState } from 'react';
import { ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ContactFormProps {
  onBack: () => void;
  plan: 'basic' | 'premium' | null;
}

export const ContactForm: React.FC<ContactFormProps> = ({ onBack, plan }) => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({ name: '', email: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = () => {
    const newErrors = { name: '', email: '' };
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = t('contact.error.name');
      isValid = false;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t('contact.error.email');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Here you would typically send the data to your backend
      setIsSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-xl p-8">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          {t('contact.back')}
        </button>

        {isSubmitted ? (
          <div className="text-center py-12">
            <CheckCircle2 className="w-16 h-16 text-primary-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('contact.success')}
            </h2>
          </div>
        ) : (
          <>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">
                {t('contact.title')}
              </h2>
              <p className="text-center text-gray-600 mb-8">
                {t('contact.subtitle')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  {t('contact.name')}
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('contact.emailPlaceholder')}
                  className={`mt-1 block w-full rounded-lg ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
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
                <Send className="w-5 h-5 ml-2" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};