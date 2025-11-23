/**
 * DeliveryAddressStepWrapper - Context-aware wrapper for DeliveryAddressStep
 *
 * Connects DeliveryAddressStep to CheckoutContext
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
    t
  } = useCheckoutContext();

  const handleContinue = () => {
    if (validateAddressStep()) {
      goToNextStep();
    }
  };

  return (
    <DeliveryAddressStep
      deliveryAddress={formData.deliveryAddress}
      errors={errors}
      onChange={(field, value) => updateField('deliveryAddress', field, value)}
      onContinue={handleContinue}
      onBack={goToPreviousStep}
      t={t}
    />
  );
};
