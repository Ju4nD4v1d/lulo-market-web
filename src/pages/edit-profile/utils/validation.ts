/**
 * Profile form validation utilities
 */

export interface ProfileFormErrors {
  [key: string]: string;
}

export const validateProfileForm = (
  formData: {
    displayName: string;
    email: string;
    phoneNumber: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
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
