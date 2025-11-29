/**
 * Custom hook for edit profile form management
 */

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useProfileMutations } from '../../../hooks/mutations/useProfileMutations';
import { UserProfile } from '../../../types/user';
import { validateProfileForm, ProfileFormErrors } from '../utils/validation';
import { getFirebaseErrorMessage } from '../utils/errorMessages';

interface UseEditProfileFormOptions {
  t: (key: string) => string;
}

export const useEditProfileForm = ({ t }: UseEditProfileFormOptions) => {
  const { currentUser, userProfile, updateProfile, refreshUserProfile } = useAuth();
  const { uploadAvatar, deleteAvatar } = useProfileMutations(currentUser?.uid || '');

  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phoneNumber: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    // Address fields
    street: '',
    city: '',
    province: '',
    postalCode: ''
  });

  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Initialize form data with current user profile
  // Only depend on uid to avoid infinite loops from object references
  useEffect(() => {
    if (userProfile && currentUser) {
      const defaultLocation = userProfile.preferences?.defaultLocation;
      setFormData({
        displayName: userProfile.displayName || '',
        email: currentUser.email || '',
        phoneNumber: userProfile.phoneNumber || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        // Address fields from defaultLocation
        street: defaultLocation?.address || '',
        city: defaultLocation?.city || '',
        province: defaultLocation?.province || '',
        postalCode: defaultLocation?.postalCode || ''
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.uid]); // Only depend on uid, not full objects

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    setErrors(prev => {
      if (prev[field]) {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      }
      return prev;
    });
    // Clear success message when user starts editing
    setSuccess('');
  }, []);

  const clearError = useCallback((field: string) => {
    setErrors(prev => {
      if (prev[field]) {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      }
      return prev;
    });
  }, []);

  const setFieldError = useCallback((field: string, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }));
  }, []);

  const handlePasswordToggle = useCallback((field: 'current' | 'new' | 'confirm') => {
    if (field === 'current') setShowCurrentPassword(prev => !prev);
    else if (field === 'new') setShowNewPassword(prev => !prev);
    else setShowConfirmPassword(prev => !prev);
  }, []);

  const uploadProfileImage = useCallback(async (file: File): Promise<string | null> => {
    if (!currentUser) return null;

    try {
      const downloadURL = await uploadAvatar.mutateAsync(file);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw new Error(t('profile.error.imageUploadFailed'));
    }
  }, [currentUser, uploadAvatar, t]);

  const deleteProfileImage = useCallback(async () => {
    if (!userProfile?.avatar || !currentUser) return;

    try {
      await deleteAvatar.mutateAsync();
    } catch {
      // Image might not exist, that's okay
      console.log('Profile image not found in storage, continuing...');
    }
  }, [userProfile?.avatar, currentUser, deleteAvatar]);

  const handleSubmit = useCallback(async (
    e: React.FormEvent,
    profileImage: { file?: File; url?: string }
  ) => {
    e.preventDefault();

    // Validate form
    const validationErrors = validateProfileForm(formData, t);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});
    setSuccess('');

    try {
      let avatarUrl = userProfile?.avatar;

      // Handle profile image upload
      if (profileImage.file) {
        avatarUrl = await uploadProfileImage(profileImage.file);
      } else if (profileImage.url === undefined && userProfile?.avatar) {
        // User removed their profile image
        await deleteProfileImage();
        avatarUrl = undefined;
      }

      // Prepare update data
      const updateData: Partial<UserProfile> = {};

      updateData.displayName = formData.displayName.trim();

      if (formData.phoneNumber.trim()) {
        updateData.phoneNumber = formData.phoneNumber.trim();
      }

      if (avatarUrl !== undefined) {
        updateData.avatar = avatarUrl;
      }

      // Update default address if any address field is filled
      const hasAddressData = formData.street.trim() || formData.city.trim() ||
        formData.province.trim() || formData.postalCode.trim();

      if (hasAddressData) {
        updateData.preferences = {
          ...userProfile?.preferences,
          defaultLocation: {
            address: formData.street.trim(),
            city: formData.city.trim(),
            province: formData.province.trim(),
            postalCode: formData.postalCode.trim(),
            coordinates: userProfile?.preferences?.defaultLocation?.coordinates || { lat: 0, lng: 0 }
          }
        };
      }

      // Prepare auth update data
      const authUpdateData: { email?: string; currentPassword?: string; newPassword?: string } = {};

      if (formData.email !== currentUser?.email) {
        authUpdateData.email = formData.email;
      }

      if (formData.currentPassword) {
        authUpdateData.currentPassword = formData.currentPassword;
      }

      if (formData.newPassword) {
        authUpdateData.newPassword = formData.newPassword;
      }

      // Only pass authUpdateData if it has properties
      const hasAuthUpdates = Object.keys(authUpdateData).length > 0;
      await updateProfile(updateData, hasAuthUpdates ? authUpdateData : undefined);

      setSuccess(t('profile.profileUpdated'));

      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      // Refresh profile to ensure UI shows latest data
      try {
        await refreshUserProfile();
        window.dispatchEvent(new CustomEvent('profileUpdated'));
      } catch (error) {
        console.error('Error refreshing profile after update:', error);
      }

    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      console.error('Error updating profile:', error);

      const friendlyMessage = err.code ? getFirebaseErrorMessage(err.code, t) : t('profile.error.profileUpdateFailed');
      setErrors({
        general: friendlyMessage
      });
    } finally {
      setIsLoading(false);
    }
  }, [formData, userProfile, currentUser, updateProfile, uploadProfileImage, deleteProfileImage, refreshUserProfile, t]);

  return {
    formData,
    errors,
    success,
    isLoading,
    showCurrentPassword,
    showNewPassword,
    showConfirmPassword,
    handleFieldChange: handleInputChange, // Export as handleFieldChange for consistency
    handlePasswordToggle,
    handleSubmit,
    clearError,
    setFieldError
  };
};
