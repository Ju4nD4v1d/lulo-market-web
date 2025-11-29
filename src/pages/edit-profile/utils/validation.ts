/**
 * Profile form validation utilities
 */

export interface ProfileFormErrors {
  [key: string]: string;
}

export interface AddressFormData {
  street: string;
  city: string;
  province: string;
  postalCode: string;
}

export const validateProfileForm = (
  formData: {
    displayName: string;
    email: string;
    phoneNumber: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    street?: string;
    city?: string;
    province?: string;
    postalCode?: string;
  },
  t: (key: string) => string
): ProfileFormErrors => {
  const errors: ProfileFormErrors = {};

  // Display name validation
  if (!formData.displayName.trim()) {
    errors.displayName = t('profile.error.displayNameRequired');
  } else if (formData.displayName.trim().length < 2) {
    errors.displayName = t('profile.error.displayNameMinLength');
  }

  // Email validation
  if (!formData.email.trim()) {
    errors.email = t('profile.error.emailRequired');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = t('profile.error.emailInvalid');
  }

  // Phone number validation (optional but format check)
  if (formData.phoneNumber && !/^\+?[\d\s\-()]+$/.test(formData.phoneNumber)) {
    errors.phoneNumber = t('profile.error.phoneInvalid');
  }

  // Address validation - only validate if any address field is filled
  const hasAnyAddressField = formData.street?.trim() || formData.city?.trim() ||
    formData.province?.trim() || formData.postalCode?.trim();

  if (hasAnyAddressField) {
    // If any address field is filled, validate all required fields
    if (!formData.street?.trim()) {
      errors.street = t('profile.error.streetRequired');
    }

    if (!formData.city?.trim()) {
      errors.city = t('profile.error.cityRequired');
    }

    if (!formData.province?.trim()) {
      errors.province = t('profile.error.provinceRequired');
    }

    if (!formData.postalCode?.trim()) {
      errors.postalCode = t('profile.error.postalCodeRequired');
    } else if (!isValidCanadianPostalCode(formData.postalCode)) {
      errors.postalCode = t('profile.error.postalCodeInvalid');
    }
  }

  // Password validation (only if changing password)
  if (formData.newPassword || formData.confirmPassword) {
    if (!formData.currentPassword) {
      errors.currentPassword = t('profile.error.currentPasswordRequired');
    }

    if (formData.newPassword.length < 6) {
      errors.newPassword = t('profile.error.newPasswordMinLength');
    }

    if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = t('profile.error.passwordsDoNotMatch');
    }
  }

  return errors;
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

export const validateImageFile = (file: File, t: (key: string) => string): string | null => {
  // Check file size (2MB limit)
  if (file.size > 2 * 1024 * 1024) {
    return t('profile.error.imageSize');
  }

  // Enhanced file type checking for mobile compatibility
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
  if (!validTypes.includes(file.type.toLowerCase()) && !file.type.startsWith('image/')) {
    return t('profile.error.imageType');
  }

  return null;
};
