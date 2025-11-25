/**
 * Custom hook for forgot password form management
 */

import { useState, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';

interface UseForgotPasswordFormOptions {
  t: (key: string) => string;
}

export const useForgotPasswordForm = ({ t }: UseForgotPasswordFormOptions) => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError(t('forgot.emailRequired'));
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword(email);
      setSuccess(t('forgot.success'));
      setEmail(''); // Clear the email field after success
    } catch (error: any) {
      // Handle Firebase auth errors
      if (error.code === 'auth/user-not-found') {
        setError(t('forgot.userNotFound'));
      } else if (error.code === 'auth/invalid-email') {
        setError(t('forgot.invalidEmail'));
      } else {
        setError(t('forgot.errorGeneric'));
      }
      console.error('Password reset error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [email, resetPassword, t]);

  return {
    email,
    setEmail,
    error,
    success,
    isLoading,
    handleSubmit
  };
};
