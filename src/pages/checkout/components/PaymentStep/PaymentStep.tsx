import type * as React from 'react';
/**
 * PaymentStep - Stripe payment form wrapper
 */


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
  t: (key: string) => string;
  /** Callback to notify parent when processing state changes */
  onProcessingChange?: (isProcessing: boolean) => void;
}

export const PaymentStep: React.FC<PaymentStepProps> = ({
  order,
  clientSecret,
  onPaymentSuccess,
  onPaymentFailure,
  onPaymentError,
  t,
  onProcessingChange
}) => {
  // Wrapper to notify parent of processing state changes
  const handleProcessingChange = (processing: boolean) => {
    onProcessingChange?.(processing);
  };

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
        onProcessing={handleProcessingChange}
      />

      {/* No back button - once payment is initiated, user must complete or let it fail */}
    </div>
  );
};
