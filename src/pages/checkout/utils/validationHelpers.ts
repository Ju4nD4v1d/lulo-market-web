/**
 * Form validation utilities for checkout
 */

/**
 * Validate email format
 * @param email Email address to validate
 * @returns True if email is valid
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 * @param phone Phone number to validate
 * @returns True if phone is valid
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

/**
 * Validation error object
 */
export interface ValidationErrors {
  [key: string]: string;
}

/**
 * Customer info for validation
 */
export interface CustomerInfoData {
  name: string;
  email: string;
  phone: string;
}

/**
 * Delivery address for validation
 */
export interface DeliveryAddressData {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  deliveryInstructions: string;
}

/**
 * Validate customer info step
 * @param customerInfo Customer information
 * @param t Translation function
 * @returns Validation errors (empty if valid)
 */
export const validateCustomerInfo = (
  customerInfo: CustomerInfoData,
  t: (key: string) => string
): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!customerInfo.name.trim()) {
    errors['customerInfo.name'] = t('validation.required');
  }

  if (!customerInfo.email.trim()) {
    errors['customerInfo.email'] = t('validation.required');
  } else if (!validateEmail(customerInfo.email)) {
    errors['customerInfo.email'] = t('validation.invalidEmail');
  }

  if (!customerInfo.phone.trim()) {
    errors['customerInfo.phone'] = t('validation.required');
  } else if (!validatePhone(customerInfo.phone)) {
    errors['customerInfo.phone'] = t('validation.invalidPhone');
  }

  return errors;
};

/**
 * Validate delivery address step
 * @param deliveryAddress Delivery address
 * @param t Translation function
 * @returns Validation errors (empty if valid)
 */
export const validateDeliveryAddress = (
  deliveryAddress: DeliveryAddressData,
  t: (key: string) => string
): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!deliveryAddress.street.trim()) {
    errors['deliveryAddress.street'] = t('validation.required');
  }

  if (!deliveryAddress.city.trim()) {
    errors['deliveryAddress.city'] = t('validation.required');
  }

  if (!deliveryAddress.province.trim()) {
    errors['deliveryAddress.province'] = t('validation.required');
  }

  if (!deliveryAddress.postalCode.trim()) {
    errors['deliveryAddress.postalCode'] = t('validation.required');
  }

  return errors;
};

/**
 * Check if validation errors object is empty
 * @param errors Validation errors
 * @returns True if no errors
 */
export const isValid = (errors: ValidationErrors): boolean => {
  return Object.keys(errors).length === 0;
};
