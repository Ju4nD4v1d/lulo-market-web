/**
 * PaymentStepWithStripe - Wrapper component for Stripe Elements
 *
 * Handles:
 * - Stripe Elements provider setup
 * - Theme configuration for Stripe UI
 * - Locale-specific configuration
 * - Temporary order object creation for payment form
 *
 * This keeps Stripe configuration separate from CheckoutPage logic
 */

import React, { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { useCheckoutContext } from '../../context/CheckoutContext';
import { createTemporaryOrder } from '../../utils/createTemporaryOrder';
import { theme } from '../../../../config/theme';
import { CheckoutWizard } from '../CheckoutWizard';
import { PaymentStep } from '../PaymentStep';

interface PaymentStepWithStripeProps {
  onBack: () => void;
}

/**
 * Wraps PaymentStep with Stripe Elements provider
 * All Stripe configuration and setup logic is encapsulated here
 */
export const PaymentStepWithStripe: React.FC<PaymentStepWithStripeProps> = ({ onBack }) => {
  const {
    cart,
    formData,
    locale,
    currentStep,
    stripePromise,
    paymentClientSecret,
    pendingOrderId,
    handlePaymentSuccess,
    handlePaymentFailure,
    handlePaymentError,
    t
  } = useCheckoutContext();

  // Track when Stripe payment is being processed
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  // Build temporary order object for payment form
  const temporaryOrder = createTemporaryOrder(
    pendingOrderId!,
    cart,
    formData,
    locale
  );

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret: paymentClientSecret!,
        locale: locale === 'es' ? 'es-419' : 'en',
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: theme.colors.primary400,
            colorBackground: theme.colors.neutralBg,
            colorText: theme.colors.neutralText,
            colorDanger: theme.colors.danger,
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
            spacingUnit: '4px',
            borderRadius: '8px',
          },
        },
      }}
    >
      <CheckoutWizard currentStep={currentStep} onBack={onBack} t={t} isProcessing={isPaymentProcessing}>
        <PaymentStep
          order={temporaryOrder}
          clientSecret={paymentClientSecret!}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentFailure={handlePaymentFailure}
          onPaymentError={handlePaymentError}
          t={t}
          onProcessingChange={setIsPaymentProcessing}
        />
      </CheckoutWizard>
    </Elements>
  );
};
