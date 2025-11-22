import { Fragment } from 'react';
import { CheckCircle } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import styles from './SuccessView.module.css';

interface SuccessViewProps {
  onTryAnotherCode: () => void;
}

export const SuccessView = ({ onTryAnotherCode }: SuccessViewProps) => {
  const { t } = useLanguage();

  return (
    <div className={styles.container}>
      <div className={styles.iconContainer}>
        <CheckCircle className={styles.icon} />
      </div>
      <div>
        <h2 className={styles.title}>{t('invitation.successTitle')}</h2>
        <p className={styles.message}>{t('invitation.successMessage')}</p>
        <div className={styles.infoBox}>
          <p className={styles.infoText}>
            <strong className={styles.highlight}>{t('invitation.successNext')}</strong>{' '}
            {t('invitation.successNextMessage')
              .split('@lulocart')
              .map((part, index, array) => (
                <Fragment key={index}>
                  {part}
                  {index < array.length - 1 && (
                    <a
                      href="https://www.instagram.com/lulocart/?hl=en"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.link}
                    >
                      @lulocart
                    </a>
                  )}
                </Fragment>
              ))}
          </p>
        </div>
      </div>

      <button onClick={onTryAnotherCode} className={styles.tryAgainButton}>
        {t('invitation.tryAnotherCode')}
      </button>
    </div>
  );
};
