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
          theme: 'night',
          variables: {
            colorPrimary: theme.colors.primary400,
            colorBackground: 'rgba(0, 0, 0, 0.4)',
            colorText: '#ffffff',
            colorTextSecondary: 'rgba(255, 255, 255, 0.7)',
            colorDanger: '#f87171',
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
            spacingUnit: '4px',
            borderRadius: '8px',
            colorInputBackground: 'rgba(255, 255, 255, 0.1)',
            colorInputText: '#ffffff',
            colorInputPlaceholder: 'rgba(255, 255, 255, 0.4)',
          },
          rules: {
            '.Input': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
            },
            '.Input:focus': {
              border: '1px solid #C8E400',
              boxShadow: '0 0 0 3px rgba(200, 228, 0, 0.2)',
            },
            '.Label': {
              color: 'rgba(255, 255, 255, 0.7)',
            },
            '.Tab': {
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.7)',
            },
            '.Tab:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
            },
            '.Tab--selected': {
              backgroundColor: 'rgba(200, 228, 0, 0.15)',
              border: '1px solid rgba(200, 228, 0, 0.4)',
              color: '#C8E400',
            },
            '.Block': {
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            },
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
