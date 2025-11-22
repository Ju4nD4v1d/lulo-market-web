/**
 * Custom hook for managing checkout wizard navigation
 */

import { useState, useCallback } from 'react';

/**
 * Checkout wizard steps
 */
export type CheckoutStep = 'info' | 'address' | 'review' | 'payment';

/**
 * Step order for navigation
 */
const STEP_ORDER: CheckoutStep[] = ['info', 'address', 'review', 'payment'];

/**
 * Hook options
 */
interface UseCheckoutWizardOptions {
  initialStep?: CheckoutStep;
  onStepChange?: (step: CheckoutStep) => void;
}

/**
 * Custom hook for wizard step management
 *
 * @param options Hook options with initial step and change callback
 * @returns Wizard state and navigation functions
 */
export const useCheckoutWizard = ({
  initialStep = 'info',
  onStepChange
}: UseCheckoutWizardOptions = {}) => {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(initialStep);

  /**
   * Get current step index
   */
  const currentStepIndex = STEP_ORDER.indexOf(currentStep);

  /**
   * Check if we can go to next step
   */
  const canGoNext = currentStepIndex < STEP_ORDER.length - 1;

  /**
   * Check if we can go to previous step
   */
  const canGoBack = currentStepIndex > 0;

  /**
   * Navigate to next step
   */
  const goToNextStep = useCallback(() => {
    if (canGoNext) {
      const nextStep = STEP_ORDER[currentStepIndex + 1];
      setCurrentStep(nextStep);
      onStepChange?.(nextStep);
    }
  }, [canGoNext, currentStepIndex, onStepChange]);

  /**
   * Navigate to previous step
   */
  const goToPreviousStep = useCallback(() => {
    if (canGoBack) {
      const prevStep = STEP_ORDER[currentStepIndex - 1];
      setCurrentStep(prevStep);
      onStepChange?.(prevStep);
    }
  }, [canGoBack, currentStepIndex, onStepChange]);

  /**
   * Go to specific step
   */
  const goToStep = useCallback((step: CheckoutStep) => {
    setCurrentStep(step);
    onStepChange?.(step);
  }, [onStepChange]);

  /**
   * Reset to first step
   */
  const reset = useCallback(() => {
    setCurrentStep('info');
    onStepChange?.('info');
  }, [onStepChange]);

  /**
   * Get step progress percentage
   */
  const progress = ((currentStepIndex + 1) / STEP_ORDER.length) * 100;

  return {
    currentStep,
    currentStepIndex,
    totalSteps: STEP_ORDER.length,
    canGoNext,
    canGoBack,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    reset,
    progress,
    isFirstStep: currentStepIndex === 0,
    isLastStep: currentStepIndex === STEP_ORDER.length - 1
  };
};
