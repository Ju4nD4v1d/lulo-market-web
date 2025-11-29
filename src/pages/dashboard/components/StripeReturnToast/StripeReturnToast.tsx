/**
 * StripeReturnToast - Shows status after returning from Stripe onboarding
 */

import { CheckCircle, AlertCircle, Loader2, X, Info } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';
import styles from './StripeReturnToast.module.css';

type ToastStatus = 'idle' | 'verifying' | 'success' | 'needs_info' | 'error';

interface StripeReturnToastProps {
  status: ToastStatus;
  message: string | null;
  onClose: () => void;
}

export const StripeReturnToast: React.FC<StripeReturnToastProps> = ({
  status,
  message,
  onClose,
}) => {
  const { t } = useLanguage();

  // Don't render if idle
  if (status === 'idle') {
    return null;
  }

  const getIcon = () => {
    switch (status) {
      case 'verifying':
        return <Loader2 className={`${styles.icon} ${styles.spinning}`} />;
      case 'success':
        return <CheckCircle className={styles.icon} />;
      case 'needs_info':
        return <Info className={styles.icon} />;
      case 'error':
        return <AlertCircle className={styles.icon} />;
      default:
        return null;
    }
  };

  const getStatusClass = () => {
    switch (status) {
      case 'verifying':
        return styles.verifying;
      case 'success':
        return styles.success;
      case 'needs_info':
        return styles.info;
      case 'error':
        return styles.error;
      default:
        return '';
    }
  };

  const getMessage = () => {
    if (status === 'verifying') {
      return t('stripeConnect.return.verifying');
    }
    return message ? t(message) : '';
  };

  return (
    <div className={`${styles.toast} ${getStatusClass()}`}>
      <div className={styles.content}>
        {getIcon()}
        <p className={styles.message}>{getMessage()}</p>
      </div>
      {status !== 'verifying' && (
        <button
          onClick={onClose}
          className={styles.closeButton}
          aria-label={t('common.close')}
        >
          <X className={styles.closeIcon} />
        </button>
      )}
    </div>
  );
};
