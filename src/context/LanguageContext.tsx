import React, { createContext, useState, useContext, ReactNode } from 'react';
import { translations, Locale } from '../utils/translations';

type LanguageContextType = {
  locale: Locale;
  t: (key: string) => string;
  toggleLanguage: () => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState<Locale>('en');

  const toggleLanguage = () => {
    setLocale(prevLocale => (prevLocale === 'en' ? 'es' : 'en'));
  };

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