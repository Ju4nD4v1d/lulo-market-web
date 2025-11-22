import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../../../config/firebase';

export const useImageUpload = (currentUserId: string | undefined, maxImages: number = 5) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const uploadImages = async (files: File[], currentImages: string[] = []): Promise<string[]> => {
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }

    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      return [];
    }

    const currentImagesCount = currentImages.length;
    const remainingSlots = maxImages - currentImagesCount;

    if (remainingSlots <= 0) {
      throw new Error('Maximum images limit reached');
    }

    const filesToUpload = imageFiles.slice(0, remainingSlots);

    setIsLoading(true);
    setError('');

    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        const storageRef = ref(storage, `products/${currentUserId}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        return getDownloadURL(storageRef);
      });

      const imageUrls = await Promise.all(uploadPromises);

      if (imageFiles.length > remainingSlots) {
        setError(`Only ${remainingSlots} image${remainingSlots === 1 ? '' : 's'} uploaded. Maximum limit reached.`);
      }

      return imageUrls;
    } catch (err) {
      console.error('Error uploading images:', err);
      throw new Error('Upload failed');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    uploadImages,
    isLoading,
    error,
    setError
  };
};
