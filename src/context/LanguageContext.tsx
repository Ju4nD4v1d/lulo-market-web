import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { translations, Locale } from '../utils/translations';

type LanguageContextType = {
  locale: Locale;
  t: (key: string) => string;
  toggleLanguage: () => void;
  setLanguage: (locale: Locale) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'lulocart_language_preference';

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Initialize from localStorage or default to 'es' (Spanish for Latino audience)
  const [locale, setLocale] = useState<Locale>(() => {
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return (savedLanguage === 'en' || savedLanguage === 'es') ? savedLanguage : 'es';
  });

  // Save language preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
  }, [locale]);

  const toggleLanguage = () => {
    setLocale(prevLocale => (prevLocale === 'en' ? 'es' : 'en'));
  };

  const setLanguage = (newLocale: Locale) => {
    setLocale(newLocale);
  };

  const t = (key: string): string => {
    return translations[locale][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ locale, t, toggleLanguage, setLanguage }}>
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