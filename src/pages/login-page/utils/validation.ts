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
