import type * as React from 'react';
/**
 * LegalPageLayout - Shared layout for legal pages (Privacy Policy, Terms of Service)
 */


import { ArrowLeft, LucideIcon } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import styles from './LegalPageLayout.module.css';

interface LegalPageLayoutProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  lastUpdated?: string;
  children: React.ReactNode;
}

export const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({
  icon: Icon,
  title,
  subtitle,
  lastUpdated = 'December 2024',
  children
}) => {
  const { t } = useLanguage();

  const handleBack = () => {
    const backPath = localStorage.getItem('backNavigationPath');
    if (backPath && backPath !== window.location.hash) {
      localStorage.removeItem('backNavigationPath');
      window.location.hash = backPath;
    } else {
      window.location.hash = '#';
    }
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContainer}>
          <div className={styles.headerContent}>
            <button onClick={handleBack} className={styles.backButton}>
              <ArrowLeft className={styles.backIcon} />
              <span>{t('legal.backToHome')}</span>
            </button>
            <div className={styles.lastUpdated}>
              {t('legal.lastUpdated')}: {lastUpdated}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.main}>
        <div className={styles.mainContent}>
          {/* Hero Section */}
          <div className={styles.hero}>
            <div className={styles.iconWrapper}>
              <Icon className={styles.heroIcon} />
            </div>
            <h1 className={styles.title}>
              {title}
            </h1>
            <p className={styles.subtitle}>
              {subtitle}
            </p>
          </div>

          {/* Content */}
          <div className={styles.contentCard}>
            <div className={styles.contentInner}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
