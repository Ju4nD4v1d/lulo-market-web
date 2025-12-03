/**
 * CookieConsent - Banner for analytics cookie consent
 *
 * Displays a banner at the bottom of the screen asking users to accept or decline
 * analytics cookies (Meta Pixel). Preference is stored in localStorage.
 */

import { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  hasConsentDecision,
  acceptAnalyticsCookies,
  declineAnalyticsCookies,
} from '../../utils/cookieConsent';
import styles from './CookieConsent.module.css';

export const CookieConsent: React.FC = () => {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show banner if user hasn't made a decision yet
    if (!hasConsentDecision()) {
      // Small delay to prevent flash on page load
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    acceptAnalyticsCookies();
    setIsVisible(false);
  };

  const handleDecline = () => {
    declineAnalyticsCookies();
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.banner}>
        <button
          className={styles.closeButton}
          onClick={handleDecline}
          aria-label={t('cookieConsent.decline')}
        >
          <X className={styles.closeIcon} />
        </button>

        <div className={styles.content}>
          <div className={styles.iconWrapper}>
            <Cookie className={styles.cookieIcon} />
          </div>
          <div className={styles.textContent}>
            <p className={styles.message}>{t('cookieConsent.message')}</p>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.declineButton} onClick={handleDecline}>
            {t('cookieConsent.decline')}
          </button>
          <button className={styles.acceptButton} onClick={handleAccept}>
            {t('cookieConsent.accept')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
