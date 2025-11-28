/**
 * TanStack Query mutations for user profile operations
 * Uses userApi for profile and auth operations, storageApi for avatar management
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../queries/queryKeys';
import * as userApi from '../../services/api/userApi';
import * as storageApi from '../../services/api/storageApi';
import type { User } from '../../services/api/userApi';

interface DeleteAccountVariables {
  currentUser: User;
  profileImageUrl?: string;
  password: string;
  hasAvatar?: boolean;
}

export const useProfileMutations = (userId: string) => {
  const queryClient = useQueryClient();

  const uploadAvatar = useMutation({
    mutationFn: async (file: File) => {
      if (!userId) {
        throw new Error('User ID is required for avatar upload');
      }
      return storageApi.uploadAvatar(file, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.profile(userId),
      });
    },
  });

  const deleteAvatar = useMutation({
    mutationFn: async (imageUrl: string) => {
      await storageApi.deleteImage(imageUrl);
    },
  });

  const deleteAccount = useMutation({
    mutationFn: async ({ currentUser, profileImageUrl, password }: DeleteAccountVariables) => {
      if (!userId) {
        throw new Error('User ID is required for account deletion');
      }

      // Re-authenticate user before deletion
      await userApi.reauthenticateUser(currentUser, password);

      // Delete user document from Firestore
      await userApi.deleteUserProfile(userId);

      // Delete profile image if exists
      if (profileImageUrl) {
        try {
          await storageApi.deleteImage(profileImageUrl);
        } catch (error) {
          console.error('Error deleting profile image:', error);
          // Continue with account deletion even if image deletion fails
        }
      }

      // Delete user from Firebase Auth
      await userApi.deleteAuthUser(currentUser);

      return { success: true };
    },
    onSuccess: () => {
      // Clear all queries since user is deleted
      queryClient.clear();
    },
  });

  return {
    uploadAvatar,
    deleteAvatar,
    deleteAccount,
    isUploading: uploadAvatar.isPending,
    isDeleting: deleteAccount.isPending,
    error: uploadAvatar.error || deleteAvatar.error || deleteAccount.error,
  };
};
