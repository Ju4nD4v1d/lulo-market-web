/**
 * Custom hook for account deletion management
 */

import { useState, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useProfileMutations } from '../../../hooks/mutations/useProfileMutations';
import { getFirebaseErrorMessage } from '../utils/errorMessages';

interface UseDeleteAccountOptions {
  t: (key: string) => string;
  onError: (field: string, message: string) => void;
  clearError: (field: string) => void;
}

export const useDeleteAccount = ({
  t,
  onError,
  clearError
}: UseDeleteAccountOptions) => {
  const { currentUser, userProfile } = useAuth();
  const { deleteAccount } = useProfileMutations(currentUser?.uid || '');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handlePasswordChange = useCallback((value: string) => {
    setDeletePassword(value);
    clearError('deletePassword');
  }, [clearError]);

  const handleDeleteAccount = useCallback(async () => {
    if (!currentUser || !deletePassword) return;

    setIsDeleting(true);
    try {
      await deleteAccount.mutateAsync({
        currentUser,
        password: deletePassword,
        profileImageUrl: userProfile?.avatar
      });

      // Redirect to landing page
      window.location.hash = '#';
      window.location.reload();
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      console.error('Error deleting account:', err);

      // Handle specific Firebase errors with friendly messages
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        onError('deletePassword', getFirebaseErrorMessage(err.code, t));
      } else if (err.code === 'auth/requires-recent-login') {
        onError('deletePassword', getFirebaseErrorMessage(err.code, t));
      } else {
        const friendlyMessage = err.code ? getFirebaseErrorMessage(err.code, t) : t('auth.error.default');
        onError('general', friendlyMessage);
      }
    } finally {
      setIsDeleting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.uid, deletePassword, deleteAccount, t, onError]); // Use uid instead of full userProfile object

  const closeDeleteModal = useCallback(() => {
    setShowDeleteConfirm(false);
    setDeletePassword('');
    clearError('deletePassword');
  }, [clearError]);

  return {
    showDeleteConfirm,
    setShowDeleteConfirm,
    deletePassword,
    handlePasswordChange,
    isDeleting,
    handleDeleteAccount,
    closeDeleteModal
  };
};
