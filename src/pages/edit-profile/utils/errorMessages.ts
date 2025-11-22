/**
 * Firebase error message mapping utility
 */

export const getFirebaseErrorMessage = (errorCode: string, t: (key: string) => string): string => {
  const errorMappings: { [key: string]: string } = {
    'auth/invalid-credential': 'auth.error.invalidCredential',
    'auth/wrong-password': 'auth.error.wrongPassword',
    'auth/email-already-in-use': 'auth.error.emailAlreadyInUse',
    'auth/invalid-email': 'auth.error.invalidEmail',
    'auth/weak-password': 'auth.error.weakPassword',
    'auth/requires-recent-login': 'auth.error.requiresRecentLogin',
    'auth/user-not-found': 'auth.error.userNotFound',
    'auth/too-many-requests': 'auth.error.tooManyRequests',
    'auth/network-request-failed': 'auth.error.networkError'
  };

  const messageKey = errorMappings[errorCode] || 'auth.error.default';
  return t(messageKey);
};
