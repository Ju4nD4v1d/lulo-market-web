import { useState } from 'react';
import { addToWaitlist } from '../../../services/waitlistService';

interface UseWaitlistEmailReturn {
  email: string;
  setEmail: (email: string) => void;
  error: string;
  isLoading: boolean;
  handleEmailSubmit: (e: React.FormEvent, onSuccess: () => void) => Promise<void>;
}

/**
 * Custom hook to handle waitlist email submission
 */
export const useWaitlistEmail = (invalidEmailError: string, submitError: string): UseWaitlistEmailReturn => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailSubmit = async (e: React.FormEvent, onSuccess: () => void) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!validateEmail(email)) {
      setError(invalidEmailError);
      setIsLoading(false);
      return;
    }

    try {
      // Store email in Firebase waitlist collection
      await addToWaitlist(email);
      onSuccess();
    } catch (error) {
      setError(submitError);
      console.error('Error submitting email:', error);
    }

    setIsLoading(false);
  };

  return {
    email,
    setEmail,
    error,
    isLoading,
    handleEmailSubmit,
  };
};
