/**
 * DeliveryAddressStepWrapper - Context-aware wrapper for DeliveryAddressStep
 *
 * Connects DeliveryAddressStep to CheckoutContext
 * Handles delivery fee calculation when user completes address step
 */

import type * as React from 'react';
import { useCheckoutContext } from '../../context/CheckoutContext';
import { DeliveryAddressStep } from '../DeliveryAddressStep/DeliveryAddressStep';

export const DeliveryAddressStepWrapper: React.FC = () => {
  const {
    formData,
    errors,
    updateField,
    validateAddressStep,
    goToNextStep,
    goToPreviousStep,
    t,
    // Delivery fee calculation
    isCalculatingDeliveryFee,
    deliveryFeeError,
    calculateDeliveryFeeForAddress,
  } = useCheckoutContext();

  const handleContinue = async () => {
    // First validate the address form fields
    if (!validateAddressStep()) {
      return;
    }

    // Calculate delivery fee based on address
    // This will geocode the address and calculate distance to store
    const success = await calculateDeliveryFeeForAddress();

    // Only proceed to next step if fee calculation succeeded
    if (success) {
      goToNextStep();
    }
    // If calculation failed, deliveryFeeError will be set and shown to user
  };

  return (
    <DeliveryAddressStep
      deliveryAddress={formData.deliveryAddress}
      errors={errors}
      onChange={(field, value) => updateField('deliveryAddress', field, value)}
      onContinue={handleContinue}
      onBack={goToPreviousStep}
      t={t}
      isCalculating={isCalculatingDeliveryFee}
      calculationError={deliveryFeeError}
    />
  );
};
