/**
 * Login/Register form validation utilities
 */

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
  t: (key: string) => string
): string | null => {
  if (!fullName.trim()) {
    return t('auth.errors.fullNameRequired');
  }

  if (!email.trim()) {
    return t('auth.errors.emailRequired');
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

  return null;
};
