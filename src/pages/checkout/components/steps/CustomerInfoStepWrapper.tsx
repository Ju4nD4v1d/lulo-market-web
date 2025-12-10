/**
 * CustomerInfoStepWrapper - Context-aware wrapper for CustomerInfoStep
 *
 * Connects CustomerInfoStep to CheckoutContext, eliminating prop drilling
 * Supports smart address skip when user has saved profile address
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
    hasSavedAddress,
    applyProfileAddressAndSkipToReview,
    isApplyingProfileAddress,
    t
  } = useCheckoutContext();

  const handleContinue = async () => {
    if (validateCustomerInfoStep()) {
      // If user wants to use profile and has saved address, skip to review
      // (this also calculates the delivery fee before skipping)
      if (formData.useProfileAsDeliveryContact && hasSavedAddress) {
        await applyProfileAddressAndSkipToReview();
      } else {
        goToNextStep();
      }
    }
  };

  const handleUseProfileToggle = (value: boolean) => {
    updateField('useProfileAsDeliveryContact', '', value);
  };

  return (
    <CustomerInfoStep
      customerInfo={formData.customerInfo}
      errors={errors}
      currentUserEmail={currentUser?.email}
      useProfileAsDeliveryContact={formData.useProfileAsDeliveryContact}
      hasSavedAddress={hasSavedAddress}
      isLoading={isApplyingProfileAddress}
      onChange={(field, value) => updateField('customerInfo', field, value)}
      onUseProfileToggle={handleUseProfileToggle}
      onContinue={handleContinue}
      t={t}
    />
  );
};
