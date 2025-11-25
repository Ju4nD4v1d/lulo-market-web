import { useState } from 'react';
import { validateInvitationCode } from '../../../services/invitationService';

interface UseInvitationCodeReturn {
  invitationCode: string;
  setInvitationCode: (code: string) => void;
  error: string;
  isLoading: boolean;
  handleCodeSubmit: (e: React.FormEvent, onSuccess: () => void) => Promise<void>;
}

/**
 * Custom hook to handle invitation code validation
 */
export const useInvitationCode = (errorMessage: string, connectionError: string): UseInvitationCodeReturn => {
  const [invitationCode, setInvitationCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCodeSubmit = async (e: React.FormEvent, onSuccess: () => void) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate invitation code for this device
      const isValid = await validateInvitationCode(invitationCode);

      if (isValid) {
        onSuccess();
      } else {
        setError(errorMessage);
      }
    } catch (error) {
      setError(connectionError);
      console.error('Error validating code:', error);
    }

    setIsLoading(false);
  };

  return {
    invitationCode,
    setInvitationCode,
    error,
    isLoading,
    handleCodeSubmit,
  };
};
