import type * as React from 'react';
/**
 * PaymentStep - Stripe payment form wrapper
 */


import { useState } from 'react';
import { CreditCard } from 'lucide-react';
import { StripePaymentForm } from '../StripePaymentForm';
import { Order } from '../../../../types/order';
import sharedStyles from '../shared.module.css';

interface PaymentStepProps {
  order: Order;
  clientSecret: string;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentFailure: (paymentIntentId: string, error: string) => void;
  onPaymentError: (error: string) => void;
  onBack: () => void;
  t: (key: string) => string;
}

export const PaymentStep: React.FC<PaymentStepProps> = ({
  order,
  clientSecret,
  onPaymentSuccess,
  onPaymentFailure,
  onPaymentError,
  onBack,
  t
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <div className={sharedStyles.stepContainer}>
      <div className={sharedStyles.stepHeader}>
        <CreditCard className={sharedStyles.stepIcon} />
        <h2 className={sharedStyles.stepTitle}>{t('order.payment')}</h2>
      </div>

      <StripePaymentForm
        order={order}
        clientSecret={clientSecret}
        onPaymentSuccess={onPaymentSuccess}
        onPaymentFailure={onPaymentFailure}
        onPaymentError={onPaymentError}
        onProcessing={setIsProcessing}
      />

      <button
        onClick={onBack}
        className={`${sharedStyles.button} ${sharedStyles.buttonSecondary}`}
        type="button"
        style={{ marginTop: '1.5rem' }}
        disabled={isProcessing}
      >
        {t('order.back')}
      </button>
    </div>
  );
};
