import type * as React from 'react';
/**
 * PaymentStep - Stripe payment form wrapper
 */


import { CreditCard } from 'lucide-react';
import { StripePaymentForm } from '../StripePaymentForm';
import sharedStyles from '../shared.module.css';

interface PaymentStepProps {
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentFailure: (paymentIntentId: string, error: string) => void;
  onPaymentError: (error: string) => void;
  onBack: () => void;
  t: (key: string) => string;
}

export const PaymentStep: React.FC<PaymentStepProps> = ({
  onPaymentSuccess,
  onPaymentFailure,
  onPaymentError,
  onBack,
  t
}) => {
  return (
    <div className={sharedStyles.stepContainer}>
      <div className={sharedStyles.stepHeader}>
        <CreditCard className={sharedStyles.stepIcon} />
        <h2 className={sharedStyles.stepTitle}>{t('order.payment')}</h2>
      </div>

      <StripePaymentForm
        onSuccess={onPaymentSuccess}
        onFailure={onPaymentFailure}
        onError={onPaymentError}
      />

      <button
        onClick={onBack}
        className={`${sharedStyles.button} ${sharedStyles.buttonSecondary}`}
        type="button"
        style={{ marginTop: '1.5rem' }}
      >
        {t('order.back')}
      </button>
    </div>
  );
};
