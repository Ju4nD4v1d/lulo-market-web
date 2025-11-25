import type * as React from 'react';

import { Mail, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import styles from './EmailView.module.css';

interface EmailViewProps {
  email: string;
  onEmailChange: (email: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBackToCode: () => void;
  error: string;
  isLoading: boolean;
}

export const EmailView: React.FC<EmailViewProps> = ({
  email,
  onEmailChange,
  onSubmit,
  onBackToCode,
  error,
  isLoading,
}) => {
  const { t } = useLanguage();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.iconContainer}>
          <Mail className={styles.icon} />
        </div>
        <h2 className={styles.title}>{t('invitation.requestTitle')}</h2>
        <p className={styles.subtitle}>{t('invitation.requestSubtitle')}</p>
      </div>

      <form onSubmit={onSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder={t('invitation.emailPlaceholder')}
            className={styles.input}
            required
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={isLoading || !email.trim()}
            className={styles.submitButton}
          >
            {isLoading ? (
              <>
                <div className={styles.spinner}></div>
                <span className={styles.submitTextHidden}>{t('invitation.submitting')}</span>
              </>
            ) : (
              <>{t('invitation.requestButton')}</>
            )}
          </button>
        </div>

        {error && (
          <div className={styles.errorAlert}>
            <AlertCircle className={styles.errorIcon} />
            <p className={styles.errorText}>{error}</p>
          </div>
        )}
      </form>

      <div className={styles.footer}>
        <button onClick={onBackToCode} className={styles.backButton}>
          {t('invitation.backToCode')}
        </button>
      </div>
    </div>
  );
};
