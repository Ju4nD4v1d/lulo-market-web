/**
 * Custom hook for managing checkout form state and validation
 */

import { useState, useCallback } from 'react';
import {
  validateCustomerInfo,
  validateDeliveryAddress,
  ValidationErrors,
  CustomerInfoData,
  DeliveryAddressData,
  isValid
} from '../utils/validationHelpers';
import { getNextAvailableDeliveryDate } from '../utils/dateHelpers';

/**
 * Complete form data structure
 */
export interface CheckoutFormData {
  customerInfo: CustomerInfoData;
  deliveryAddress: DeliveryAddressData;
  orderNotes: string;
  isDelivery: boolean;
  deliveryDate: string;
  useProfileAsDeliveryContact: boolean;
  customerNotes?: string;
  specialRequests?: string;
  preferredDeliveryTime?: string;
  promotionalCodes?: string[];
  tipAmount?: number;
  accessInstructions?: string;
}

/**
 * Initial form data
 */
const getInitialFormData = (): CheckoutFormData => ({
  customerInfo: {
    name: '',
    email: '',
    phone: ''
  },
  deliveryAddress: {
    street: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'Canada',
    deliveryInstructions: ''
  },
  orderNotes: '',
  isDelivery: true,
  deliveryDate: getNextAvailableDeliveryDate(),
  useProfileAsDeliveryContact: true,
  customerNotes: '',
  specialRequests: '',
  preferredDeliveryTime: '',
  promotionalCodes: [],
  tipAmount: 0,
  accessInstructions: ''
});

/**
 * Hook options
 */
interface UseCheckoutFormOptions {
  t: (key: string) => string;
  initialData?: Partial<CheckoutFormData>;
}

/**
 * Custom hook for checkout form management
 *
 * @param options Hook options with translation function and initial data
 * @returns Form state and handlers
 */
export const useCheckoutForm = ({ t, initialData }: UseCheckoutFormOptions) => {
  const [formData, setFormData] = useState<CheckoutFormData>(() => ({
    ...getInitialFormData(),
    ...initialData
  }));
  const [errors, setErrors] = useState<ValidationErrors>({});

  /**
   * Update form data field
   */
  const updateField = useCallback((section: keyof CheckoutFormData, field: string, value: any) => {
    setFormData(prev => {
      const currentSection = prev[section];

      if (typeof currentSection === 'object' && currentSection !== null && !Array.isArray(currentSection)) {
        return {
          ...prev,
          [section]: { ...currentSection, [field]: value }
        };
      }

      return {
        ...prev,
        [section]: value
      };
    });

    // Clear error when user starts typing - use functional update to avoid stale closure
    setErrors(prev => {
      // Determine error key based on current formData state
      const errorKey = field ? `${section}.${field}` : String(section);
      if (prev[errorKey]) {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      }
      return prev;
    });
  }, []); // Empty deps - all state updates are functional

  /**
   * Set entire form data (useful for autofill from user profile)
   */
  const setEntireFormData = useCallback((data: Partial<CheckoutFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, []);

  /**
   * Validate customer info step
   */
  const validateCustomerInfoStep = useCallback((): boolean => {
    const validationErrors = validateCustomerInfo(formData.customerInfo, t);
    setErrors(validationErrors);
    return isValid(validationErrors);
  }, [formData.customerInfo, t]);

  /**
   * Validate delivery address step
   */
  const validateAddressStep = useCallback((): boolean => {
    const validationErrors = validateDeliveryAddress(formData.deliveryAddress, t);
    setErrors(validationErrors);
    return isValid(validationErrors);
  }, [formData.deliveryAddress, t]);

  /**
   * Validate review step (no validation needed, just confirm)
   */
  const validateReviewStep = useCallback((): boolean => {
    setErrors({});
    return true;
  }, []);

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setFormData(getInitialFormData());
    setErrors({});
  }, []);

  return {
    formData,
    errors,
    updateField,
    setEntireFormData,
    validateCustomerInfoStep,
    validateAddressStep,
    validateReviewStep,
    clearErrors,
    resetForm,
    hasErrors: Object.keys(errors).length > 0
  };
};
