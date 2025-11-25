/**
 * ReviewStepWrapper - Context-aware wrapper for ReviewStep
 *
 * Connects ReviewStep to CheckoutContext and handles payment flow initiation
 */

import type * as React from 'react';
import { useCheckoutContext } from '../../context/CheckoutContext';
import { ReviewStep } from '../ReviewStep/ReviewStep';

export const ReviewStepWrapper: React.FC = () => {
  const {
    cart,
    formData,
    validateReviewStep,
    proceedToPayment,
    goToPreviousStep,
    t
  } = useCheckoutContext();

  const handleContinue = async () => {
    console.log('🚀 Starting payment flow...');
    if (validateReviewStep()) {
      try {
        await proceedToPayment();
      } catch (error) {
        console.error('💥 Payment flow failed:', error);
        alert(error instanceof Error ? error.message : 'Failed to proceed to payment');
      }
    } else {
      console.warn('⚠️ Review step validation failed');
    }
  };

  return (
    <ReviewStep
      cartItems={cart.items}
      cartSummary={cart.summary}
      customerInfo={formData.customerInfo}
      deliveryAddress={formData.deliveryAddress}
      onContinue={handleContinue}
      onBack={goToPreviousStep}
      t={t}
    />
  );
};
