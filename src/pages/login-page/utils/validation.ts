/**
 * Login/Register form validation utilities
 */

interface AddressData {
  street: string;
  city: string;
  province: string;
  postalCode: string;
}

/**
 * Validates Canadian phone number format.
 * Accepts: +1XXXXXXXXXX, 1XXXXXXXXXX, XXXXXXXXXX, or formatted versions like (604) 555-1234
 * Returns true if the phone has 10 digits (without country code) or 11 digits starting with 1
 */
export const isValidCanadianPhoneNumber = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 || (cleaned.length === 11 && cleaned.startsWith('1'));
};

/**
 * Formats a phone number to Canadian format: +1 (604) 555-1234
 */
export const formatCanadianPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');

  // Extract the 10 digits (removing country code if present)
  const digits = cleaned.length === 11 && cleaned.startsWith('1')
    ? cleaned.slice(1)
    : cleaned;

  if (digits.length !== 10) {
    return phone; // Return as-is if not valid length
  }

  const areaCode = digits.slice(0, 3);
  const prefix = digits.slice(3, 6);
  const line = digits.slice(6, 10);

  return `+1 (${areaCode}) ${prefix}-${line}`;
};

/**
 * Normalizes phone number to E.164 format for Firebase: +1XXXXXXXXXX
 * Throws an error if the phone number is invalid
 */
export const normalizePhoneToE164 = (phone: string): string => {
  if (!phone) {
    throw new Error('Phone number is required');
  }

  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }

  throw new Error(`Invalid phone number format: expected 10 digits or 11 digits starting with 1, got ${cleaned.length} digits`);
};

/**
 * Validates Canadian postal code format (A1A 1A1 or A1A1A1)
 */
export const isValidCanadianPostalCode = (postalCode: string): boolean => {
  const cleaned = postalCode.replace(/\s/g, '').toUpperCase();
  // Canadian postal code format: letter-number-letter number-letter-number
  // First letter cannot be D, F, I, O, Q, U, W, Z
  const pattern = /^[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJKLMNPRSTVWXYZ]\d[ABCEGHJKLMNPRSTVWXYZ]\d$/;
  return pattern.test(cleaned);
};

export const validateLoginForm = (
  email: string,
  password: string,
  t: (key: string) => string
): string | null => {
  if (!email.trim()) {
    return t('auth.errors.emailRequired');
  }

  if (!password.trim()) {
    return t('auth.errors.passwordRequired');
  }

  return null;
};

/**
 * Validates phone number for the verification modal
 */
export const validatePhoneNumber = (
  phoneNumber: string,
  t: (key: string) => string
): string | null => {
  if (!phoneNumber.trim()) {
    return t('auth.errors.phoneRequired');
  }

  if (!isValidCanadianPhoneNumber(phoneNumber)) {
    return t('auth.errors.phoneInvalid');
  }

  return null;
};

export const validateRegisterForm = (
  fullName: string,
  email: string,
  password: string,
  confirmPassword: string,
  t: (key: string) => string,
  address?: AddressData
): string | null => {
  if (!fullName.trim()) {
    return t('auth.errors.fullNameRequired');
  }

  if (!email.trim()) {
    return t('auth.errors.emailRequired');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return t('auth.errors.invalidEmail');
  }

  // Note: Phone number is validated separately in the verification modal

  if (!password.trim()) {
    return t('auth.errors.passwordRequired');
  }

  if (password.length < 6) {
    return t('auth.errors.passwordTooShort');
  }

  if (password !== confirmPassword) {
    return t('auth.errors.passwordsDoNotMatch');
  }

  // Address validation - only validate if any address field is filled
  if (address) {
    const hasAnyAddressField = address.street?.trim() || address.city?.trim() ||
      address.province?.trim() || address.postalCode?.trim();

    if (hasAnyAddressField) {
      // If any address field is filled, validate all required fields
      if (!address.street?.trim()) {
        return t('profile.error.streetRequired');
      }

      if (!address.city?.trim()) {
        return t('profile.error.cityRequired');
      }

      if (!address.province?.trim()) {
        return t('profile.error.provinceRequired');
      }

      if (!address.postalCode?.trim()) {
        return t('profile.error.postalCodeRequired');
      } else if (!isValidCanadianPostalCode(address.postalCode)) {
        return t('profile.error.postalCodeInvalid');
      }
    }
  }

  return null;
};
