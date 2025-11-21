import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import styles from './LanguageToggle.module.css';

export const LanguageToggle: React.FC = () => {
  const { locale, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className={styles.button}
      aria-label="Toggle language"
    >
      <Globe className={styles.icon} />
      <span className={styles.text}>{locale === 'en' ? 'ES' : 'EN'}</span>
      <div className={styles.flags}>
        <span className={locale === 'en' ? styles.flagActive : styles.flagInactive}>🇨🇦</span>
        <span className={locale === 'es' ? styles.flagActive : styles.flagInactive}>🇨🇴</span>
      </div>
    </button>
  );
};
