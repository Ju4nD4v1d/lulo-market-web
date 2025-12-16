import type * as React from 'react';
/**
 * AuthLayout - Shared layout for authentication pages
 * Uses VibrantBackground with centered dark glass card
 */

import { ArrowLeft } from 'lucide-react';
import { VibrantBackground } from '../../VibrantBackground';
import styles from './AuthLayout.module.css';

interface AuthLayoutProps {
  backLink?: string;
  backText?: string;
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  backLink = '/',
  backText = 'Back',
  children
}) => {
  return (
    <VibrantBackground overlay="heavy" showGrain={true}>
      <div className={styles.container}>
        {/* Back Link - positioned absolutely */}
        <a href={backLink} className={styles.backLink}>
          <ArrowLeft size={20} />
          <span>{backText}</span>
        </a>

        {/* Centered Form Card - Dark Glass */}
        <div className={styles.contentWrapper}>
          <div className={styles.formCard}>
            {children}
          </div>
        </div>
      </div>
    </VibrantBackground>
  );
};
