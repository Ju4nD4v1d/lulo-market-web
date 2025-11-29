/**
 * User API - Profile and Auth operations
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  UpdateData,
} from 'firebase/firestore';
import {
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User,
} from 'firebase/auth';
import { db } from '../../config/firebase';
import { COLLECTIONS } from './types';

// ============================================================================
// Types
// ============================================================================

export interface UserProfile {
  id: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    country?: string;
  };
  preferences?: {
    language?: string;
    notifications?: boolean;
  };
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: unknown;
}

// ============================================================================
// Read Operations
// ============================================================================

/**
 * Get user profile by user ID
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as UserProfile;
}

// ============================================================================
// Write Operations
// ============================================================================

/**
 * Create or update user profile (upsert)
 */
export async function setUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<void> {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  await setDoc(userRef, profileData, { merge: true });
}

/**
 * Update user profile (partial update)
 */
export async function updateUserProfile(userId: string, updates: UpdateData<UserProfile>): Promise<void> {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  await updateDoc(userRef, updates);
}

/**
 * Delete user profile document from Firestore
 */
export async function deleteUserProfile(userId: string): Promise<void> {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  await deleteDoc(userRef);
}

// ============================================================================
// Auth Operations
// ============================================================================

/**
 * Re-authenticate user before sensitive operations (e.g., account deletion)
 */
export async function reauthenticateUser(user: User, password: string): Promise<void> {
  const credential = EmailAuthProvider.credential(user.email!, password);
  await reauthenticateWithCredential(user, credential);
}

/**
 * Delete user from Firebase Auth
 */
export async function deleteAuthUser(user: User): Promise<void> {
  await deleteUser(user);
}

// Re-export User type for consumers
export type { User } from 'firebase/auth';
