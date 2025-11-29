/**
 * Storage API - Firebase Storage operations for file uploads
 */

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../config/firebase';

// ============================================================================
// Types
// ============================================================================

export interface AboutSection {
  title: string;
  content: string;
  imageUrl?: string;
  imageFile?: File;
}

export interface ProcessedAboutSection {
  title: string;
  content: string;
  imageUrl: string;
}

// ============================================================================
// Image Upload Operations
// ============================================================================

/**
 * Upload a single image to Firebase Storage and get the download URL
 */
export async function uploadImage(
  file: File,
  userId: string,
  path: string
): Promise<string> {
  const storageRef = ref(storage, `stores/${userId}/${path}/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

/**
 * Upload store main image
 */
export async function uploadStoreImage(
  file: File,
  userId: string
): Promise<string> {
  return uploadImage(file, userId, 'main');
}

/**
 * Upload product image
 */
export async function uploadProductImage(
  file: File,
  userId: string
): Promise<string> {
  return uploadImage(file, userId, 'products');
}

/**
 * Upload multiple about section images
 * Processes sections and uploads any File objects, returns URLs
 */
export async function uploadAboutSectionImages(
  sections: AboutSection[],
  userId: string
): Promise<ProcessedAboutSection[]> {
  return Promise.all(
    sections.map(async (section) => {
      if (section.imageFile && section.imageFile instanceof File) {
        const imageUrl = await uploadImage(
          section.imageFile,
          userId,
          'about-sections'
        );
        return {
          title: section.title,
          content: section.content,
          imageUrl,
        };
      }
      return {
        title: section.title,
        content: section.content,
        imageUrl: section.imageUrl || '',
      };
    })
  );
}

// ============================================================================
// Avatar Operations
// ============================================================================

/**
 * Upload user avatar image
 */
export async function uploadAvatar(
  file: File,
  userId: string
): Promise<string> {
  const storageRef = ref(storage, `avatars/${userId}/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

/**
 * Delete an image from storage by URL
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  const imageRef = ref(storage, imageUrl);
  await deleteObject(imageRef);
}
