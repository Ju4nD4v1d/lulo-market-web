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
  const [deleteSuccess, setDeleteSuccess] = useState(false);

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

      // Show success feedback before redirecting
      setDeleteSuccess(true);

      // Wait 2 seconds to show success message, then redirect
      setTimeout(() => {
        window.location.hash = '#';
        window.location.reload();
      }, 2000);
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
      setIsDeleting(false);
    }
    // Note: Don't set isDeleting to false on success - we want to keep showing loading until redirect
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
    deleteSuccess,
    handleDeleteAccount,
    closeDeleteModal
  };
};
