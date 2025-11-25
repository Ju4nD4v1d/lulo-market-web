import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { deleteUser, reauthenticateWithCredential, EmailAuthProvider, User } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import { storage, db } from '../../config/firebase';
import { queryKeys } from '../queries/queryKeys';

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
      const storageRef = ref(storage, `avatars/${userId}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      return downloadURL;
    },
    onSuccess: () => {
      // Invalidate user profile query
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.profile(userId),
      });
    },
  });

  const deleteAvatar = useMutation({
    mutationFn: async (imageUrl: string) => {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
    },
    onSuccess: () => {
      // Could invalidate user profile query here if needed
    },
  });

  const deleteAccount = useMutation({
    mutationFn: async ({ currentUser, profileImageUrl, password }: DeleteAccountVariables) => {
      if (!userId) {
        throw new Error('User ID is required for account deletion');
      }

      // Re-authenticate user before deletion
      const credential = EmailAuthProvider.credential(currentUser.email, password);
      await reauthenticateWithCredential(currentUser, credential);

      // Delete user document from Firestore
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);

      // Delete profile image if exists
      if (profileImageUrl) {
        try {
          const imageRef = ref(storage, profileImageUrl);
          await deleteObject(imageRef);
        } catch (error) {
          console.error('Error deleting profile image:', error);
          // Continue with account deletion even if image deletion fails
        }
      }

      // Delete user from Firebase Auth
      await deleteUser(currentUser);

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
