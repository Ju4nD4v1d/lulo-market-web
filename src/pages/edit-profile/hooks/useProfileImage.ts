/**
 * Custom hook for profile image management
 */

import { useState, useCallback, useEffect } from 'react';
import { validateImageFile } from '../utils/validation';

interface ProfileImageState {
  file?: File;
  preview?: string;
  url?: string;
}

interface UseProfileImageOptions {
  initialUrl?: string;
  t: (key: string) => string;
  onError: (field: string, message: string) => void;
  clearError: (field: string) => void;
}

export const useProfileImage = ({
  initialUrl,
  t,
  onError,
  clearError
}: UseProfileImageOptions) => {
  const [profileImage, setProfileImage] = useState<ProfileImageState>({});

  // Initialize with current avatar URL
  useEffect(() => {
    if (initialUrl) {
      setProfileImage({ url: initialUrl });
    }
  }, [initialUrl]);

  const handleImageValidation = useCallback((file: File) => {
    // Validate image
    const validationError = validateImageFile(file, t);
    if (validationError) {
      onError('profileImage', validationError);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setProfileImage({
        file,
        preview: e.target?.result as string
      });
      clearError('profileImage');
    };

    reader.onerror = () => {
      onError('profileImage', t('profile.error.imageReadFailed'));
    };

    reader.readAsDataURL(file);
  }, [t, onError, clearError]);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageValidation(file);
    }
    // Clear the input value to allow selecting the same file again
    e.target.value = '';
  }, [handleImageValidation]);

  const handleRemoveImage = useCallback(() => {
    setProfileImage({});
    clearError('profileImage');
  }, [clearError]);

  return {
    profileImage,
    handleImageChange,
    handleRemoveImage
  };
};
