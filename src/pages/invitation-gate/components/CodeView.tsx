import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import styles from './CodeView.module.css';

interface CodeViewProps {
  invitationCode: string;
  onCodeChange: (code: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onRequestAccess: () => void;
  error: string;
  isLoading: boolean;
}

export const CodeView: React.FC<CodeViewProps> = ({
  invitationCode,
  onCodeChange,
  onSubmit,
  onRequestAccess,
  error,
  isLoading,
}) => {
  const { t } = useLanguage();

  return (
    <>
      <form onSubmit={onSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <input
            id="invitation-code"
            type="text"
            value={invitationCode}
            onChange={(e) => onCodeChange(e.target.value)}
            placeholder={t('invitation.codePlaceholder')}
            className={styles.input}
            required
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={isLoading || !invitationCode.trim()}
            className={styles.submitButton}
          >
            {isLoading ? (
              <>
                <div className={styles.spinner}></div>
                <span className={styles.submitTextHidden}>{t('invitation.verifying')}</span>
              </>
            ) : (
              <>{t('invitation.accessButton')}</>
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

      {/* Request access option */}
      <div className={styles.divider}>
        <div className={styles.requestSection}>
          <p className={styles.noCodeText}>{t('invitation.noCode')}</p>
          <button onClick={onRequestAccess} className={styles.requestLink}>
            {t('invitation.requestAccessLink')}
          </button>
        </div>
      </div>
    </>
  );
};
