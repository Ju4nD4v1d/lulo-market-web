import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { translations, Locale } from '../utils/translations';

type LanguageContextType = {
  locale: Locale;
  t: (key: string) => string;
  toggleLanguage: () => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState<Locale>(() => {
    // Try to get the language from localStorage, default to 'en'
    return (localStorage.getItem('language') as Locale) || 'en';
  });

  const toggleLanguage = () => {
    setLocale(prevLocale => {
      const newLocale = prevLocale === 'en' ? 'es' : 'en';
      localStorage.setItem('language', newLocale);
      return newLocale;
    });
  };

  // Persist language selection to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('language', locale);
  }, [locale]);

  const t = (key: string): string => {
    return translations[locale][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ locale, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};