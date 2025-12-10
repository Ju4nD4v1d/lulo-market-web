import type * as React from 'react';
/**
 * LegalPageLayout - Shared layout for legal pages (Privacy Policy, Terms of Service)
 */


import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  // Check if user came from a specific page (e.g., dashboard/documents)
  const backPath = localStorage.getItem('backNavigationPath');
  const hasBackPath = backPath && backPath !== window.location.pathname;
  const isFromDashboard = backPath?.includes('dashboard');

  const handleBack = () => {
    if (hasBackPath) {
      localStorage.removeItem('backNavigationPath');
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  // Determine back button text
  const getBackButtonText = () => {
    if (isFromDashboard) {
      return t('legal.backToDocuments');
    }
    return t('legal.backToHome');
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContainer}>
          <div className={styles.headerContent}>
            {hasBackPath ? (
              <button onClick={handleBack} className={styles.backButton}>
                <ArrowLeft className={styles.backIcon} />
                <span>{getBackButtonText()}</span>
              </button>
            ) : (
              <div className={styles.backButtonPlaceholder} />
            )}
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
