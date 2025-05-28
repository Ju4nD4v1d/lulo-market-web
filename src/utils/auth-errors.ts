// Firebase Auth Error Messages
export const getAuthErrorMessage = (error: { code?: string; message: string }, locale: string = 'en') => {
  if (!error.code) return error.message;

  const messages = {
    en: {
      'auth/email-already-in-use': 'This email is already registered. Please try logging in instead.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/operation-not-allowed': 'Email/password accounts are not enabled. Please contact support.',
      'auth/weak-password': 'Password should be at least 6 characters long.',
      'auth/user-disabled': 'This account has been disabled. Please contact support.',
      'auth/user-not-found': 'Invalid email or password. Please try again.',
      'auth/wrong-password': 'Invalid email or password. Please try again.',
      'auth/invalid-login-credentials': 'Invalid email or password. Please try again.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Please check your internet connection.',
      'default': 'Authentication failed. Please check your credentials and try again.'
    },
    es: {
      'auth/email-already-in-use': 'Este correo ya está registrado. Por favor, intenta iniciar sesión.',
      'auth/invalid-email': 'Por favor, ingresa un correo electrónico válido.',
      'auth/operation-not-allowed': 'Las cuentas de correo/contraseña no están habilitadas. Contacta a soporte.',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
      'auth/user-disabled': 'Esta cuenta ha sido deshabilitada. Contacta a soporte.',
      'auth/user-not-found': 'Correo o contraseña inválidos. Por favor, intenta de nuevo.',
      'auth/wrong-password': 'Correo o contraseña inválidos. Por favor, intenta de nuevo.',
      'auth/invalid-login-credentials': 'Correo o contraseña inválidos. Por favor, intenta de nuevo.',
      'auth/too-many-requests': 'Demasiados intentos fallidos. Por favor, intenta más tarde.',
      'auth/network-request-failed': 'Error de red. Verifica tu conexión a internet.',
      'default': 'Error de autenticación. Verifica tus credenciales e intenta de nuevo.'
    }
  };

  const errorMessages = messages[locale as keyof typeof messages] || messages.en;
  return errorMessages[error.code as keyof typeof errorMessages] || errorMessages.default;
};