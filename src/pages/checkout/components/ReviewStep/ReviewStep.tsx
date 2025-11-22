import type * as React from 'react';
/**
 * ReviewStep - Order review before payment
 */


import { Clock } from 'lucide-react';
import sharedStyles from '../shared.module.css';

interface ReviewStepProps {
  onContinue: () => void;
  onBack: () => void;
  t: (key: string) => string;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  onContinue,
  onBack,
  t
}) => {
  return (
    <div className={sharedStyles.stepContainer}>
      <div className={sharedStyles.stepHeader}>
        <Clock className={sharedStyles.stepIcon} />
        <h2 className={sharedStyles.stepTitle}>{t('order.reviewOrder')}</h2>
      </div>

      <p style={{ marginBottom: '1.5rem', color: 'rgb(75 85 99)' }}>
        {t('checkout.reviewBeforePayment')}
      </p>

      <div className={sharedStyles.buttonRow}>
        <button onClick={onBack} className={`${sharedStyles.button} ${sharedStyles.buttonSecondary}`} type="button">
          {t('order.back')}
        </button>
        <button onClick={onContinue} className={`${sharedStyles.button} ${sharedStyles.buttonPrimary}`} type="button">
          {t('button.proceedToPayment')}
        </button>
      </div>
    </div>
  );
};
