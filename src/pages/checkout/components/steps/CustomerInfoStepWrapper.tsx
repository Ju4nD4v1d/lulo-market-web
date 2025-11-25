/**
 * CustomerInfoStepWrapper - Context-aware wrapper for CustomerInfoStep
 *
 * Connects CustomerInfoStep to CheckoutContext, eliminating prop drilling
 */

import type * as React from 'react';
import { useCheckoutContext } from '../../context/CheckoutContext';
import { CustomerInfoStep } from '../CustomerInfoStep/CustomerInfoStep';

export const CustomerInfoStepWrapper: React.FC = () => {
  const {
    formData,
    errors,
    currentUser,
    updateField,
    validateCustomerInfoStep,
    goToNextStep,
    t
  } = useCheckoutContext();

  const handleContinue = () => {
    if (validateCustomerInfoStep()) {
      goToNextStep();
    }
  };

  return (
    <CustomerInfoStep
      customerInfo={formData.customerInfo}
      errors={errors}
      currentUserEmail={currentUser?.email}
      useProfileAsDeliveryContact={formData.useProfileAsDeliveryContact}
      onChange={(field, value) => updateField('customerInfo', field, value)}
      onUseProfileToggle={(value) => updateField('useProfileAsDeliveryContact', '', value)}
      onContinue={handleContinue}
      t={t}
    />
  );
};
