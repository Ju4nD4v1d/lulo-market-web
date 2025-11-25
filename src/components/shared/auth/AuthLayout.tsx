import type * as React from 'react';
/**
 * AuthLayout - Shared layout for authentication pages
 */


import { ArrowLeft } from 'lucide-react';
import styles from './AuthLayout.module.css';

interface AuthLayoutProps {
  heroTitle: string;
  heroSubtitle: string;
  backLink?: string;
  backText?: string;
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  heroTitle,
  heroSubtitle,
  backLink = '#login',
  backText = 'Back',
  children
}) => {
  return (
    <div className={styles.container}>
      {/* Hero Image Side */}
      <div className={styles.heroSide}>
        <div
          className={styles.heroBackground}
          style={{
            backgroundImage: "url('/registration.png')",
          }}
        >
          <div className={styles.heroOverlay} />
          <div className={styles.heroContent}>
            <h2 className={styles.heroTitle}>
              {heroTitle}
            </h2>
            <p className={styles.heroSubtitle}>
              {heroSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className={styles.formSide}>
        <a href={backLink} className={styles.backLink}>
          <ArrowLeft size={20} />
          <span>{backText}</span>
        </a>

        <div className={styles.formContainer}>
          <div className={styles.formContent}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
