import type * as React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import { serverTimestamp } from 'firebase/firestore';
import { updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '../config/firebase';
import * as userApi from '../services/api/userApi';
import * as storeApi from '../services/api/storeApi';
import { UserProfile, UserType } from '../types/user';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  userType: UserType | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  portalLogin: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, displayName?: string, address?: { street: string; city: string; province: string; postalCode: string }) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>, authData?: { email?: string; currentPassword?: string; newPassword?: string }) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  redirectAfterLogin: string | null;
  setRedirectAfterLogin: (path: string | null) => void;
  checkStoreOwnerPermissions: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirectAfterLogin, setRedirectAfterLogin] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        try {
          const userData = await userApi.getUserProfile(user.uid);
          if (userData) {
            // Convert Firestore Timestamps to Dates if needed
            const profile: UserProfile = {
              ...userData,
              createdAt: userData.createdAt instanceof Date ? userData.createdAt : new Date(userData.createdAt || Date.now()),
              lastLoginAt: userData.lastLoginAt instanceof Date ? userData.lastLoginAt : new Date(userData.lastLoginAt || Date.now()),
            } as UserProfile;
            setUserProfile(profile);
            setUserType(profile.userType);
          } else {
            // Handle legacy users without userType - default to shopper
            const defaultUserData: UserProfile = {
              id: user.uid,
              email: user.email || '',
              displayName: user.displayName || 'User',
              userType: 'shopper',
              createdAt: new Date(),
              lastLoginAt: new Date(),
              preferences: {},
            };

            await userApi.setUserProfile(user.uid, {
              ...defaultUserData,
              createdAt: serverTimestamp(),
              lastLoginAt: serverTimestamp(),
            });

            setUserProfile(defaultUserData);
            setUserType('shopper');
          }
        } catch (error: unknown) {
          const err = error as { code?: string; message?: string };
          console.error('Error fetching user profile:', err);

          // Handle offline gracefully - don't clear user profile
          if (err?.code === 'unavailable' || err?.message?.includes('offline')) {
            console.warn('⚠️ Offline mode: User profile fetch failed, will retry when online');
          } else {
            setUserProfile(null);
            setUserType(null);
          }
        }
      } else {
        setUserProfile(null);
        setUserType(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };
  
  const portalLogin = async (email: string, password: string) => {
    // Login without triggering automatic user profile creation
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // First check if user has a profile and is a storeOwner
    const userData = await userApi.getUserProfile(user.uid);

    if (userData) {
      // If user is marked as storeOwner, grant access
      if (userData.userType === 'storeOwner') {
        // Update last login
        await userApi.updateUserProfile(user.uid, {
          lastLoginAt: serverTimestamp()
        });

        // Update local state immediately
        setUserProfile(userData as UserProfile);
        setUserType('storeOwner');
        return true;
      }
    }

    // If no profile exists or not a storeOwner, check for stores
    const foundStoreId = await storeApi.getStoreIdByOwner(user.uid);
    const hasStores = !!foundStoreId;

    if (hasStores) {
      // User has stores - create/update profile as storeOwner
      const storeOwnerProfileData = {
        id: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Store Owner',
        userType: 'storeOwner' as const,
        createdAt: userData ? userData.createdAt : serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        preferences: userData ? userData.preferences : {},
      };

      await userApi.setUserProfile(user.uid, storeOwnerProfileData);

      // Update local state immediately to prevent access denied
      setUserProfile(storeOwnerProfileData as UserProfile);
      setUserType('storeOwner');
      return true;
    } else {
      // User doesn't have stores and is not marked as storeOwner - deny access
      await signOut(auth);
      return false;
    }
  };

  const register = async (
    email: string,
    password: string,
    displayName?: string,
    address?: { street: string; city: string; province: string; postalCode: string }
  ) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Build preferences with optional default address
      const preferences: UserProfile['preferences'] = {};
      if (address && address.street && address.city && address.province && address.postalCode) {
        preferences.defaultLocation = {
          address: address.street,
          city: address.city,
          province: address.province,
          postalCode: address.postalCode,
          coordinates: { lat: 0, lng: 0 }
        };
      }

      // Create user profile document with shopper as default
      const userProfileData: UserProfile = {
        id: user.uid,
        email: user.email || '',
        displayName: displayName || 'User',
        userType: 'shopper', // Default to shopper
        createdAt: new Date(),
        lastLoginAt: new Date(),
        preferences,
      };

      await userApi.setUserProfile(user.uid, {
        ...userProfileData,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      });
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      console.error('Registration error:', err);

      // Map Firebase error codes to user-friendly messages
      const errorCode = err?.code;
      let errorMessage = err?.message || 'Registration failed';

      switch (errorCode) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered. Please use a different email or try logging in.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please use at least 6 characters.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password registration is not enabled. Please contact support.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection and try again.';
          break;
        default:
          // Keep the original error message if we don't have a specific mapping
          break;
      }

      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateProfile = async (
    profileData: Partial<UserProfile>,
    authData?: { email?: string; currentPassword?: string; newPassword?: string }
  ) => {
    if (!currentUser) {
      throw new Error('No user is currently logged in');
    }

    try {

      // Handle authentication updates (email/password) first
      if (authData && (authData.email || authData.newPassword)) {
        if (!authData.currentPassword) {
          throw new Error('Current password is required to update email or password');
        }

        // Reauthenticate user before sensitive operations
        const credential = EmailAuthProvider.credential(
          currentUser.email!,
          authData.currentPassword
        );
        await reauthenticateWithCredential(currentUser, credential);

        // Update email if provided
        if (authData.email && authData.email !== currentUser.email) {
          await updateEmail(currentUser, authData.email);
        }

        // Update password if provided
        if (authData.newPassword) {
          await updatePassword(currentUser, authData.newPassword);
        }
      }

      // Update Firestore profile document via API
      const updateData = {
        ...profileData,
        lastLoginAt: serverTimestamp()
      };

      await userApi.updateUserProfile(currentUser.uid, updateData);

      // Update local state
      if (userProfile) {
        const updatedProfile = { ...userProfile, ...profileData };
        setUserProfile(updatedProfile);
      }


    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      console.error('Error updating profile:', err);

      // Re-throw the original error to preserve Firebase error codes for better error handling
      throw error;
    }
  };

  const refreshUserProfile = async () => {
    if (!currentUser) {
      return;
    }

    try {
      const userData = await userApi.getUserProfile(currentUser.uid);

      if (userData) {
        // Convert Firestore Timestamps to Dates
        const refreshedProfile: UserProfile = {
          ...userData,
          createdAt: userData.createdAt instanceof Date ? userData.createdAt : new Date(userData.createdAt || Date.now()),
          lastLoginAt: userData.lastLoginAt instanceof Date ? userData.lastLoginAt : new Date(userData.lastLoginAt || Date.now()),
        } as UserProfile;

        setUserProfile(refreshedProfile);
        setUserType(refreshedProfile.userType);
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error);
      // Don't throw error - this is a background refresh
    }
  };

  const checkStoreOwnerPermissions = async (): Promise<boolean> => {
    if (!currentUser) {
      return false;
    }

    try {
      // First check the current userType from state
      if (userType === 'storeOwner' || userType === 'admin') {
        return true;
      }

      // If userType is not set or is 'shopper', check if user has any stores
      // This covers cases where a user might have become a store owner after initial registration
      const foundStoreId = await storeApi.getStoreIdByOwner(currentUser.uid);
      return !!foundStoreId;
    } catch (error) {
      console.error('Error checking store owner permissions:', error);
      return false;
    }
  };

  const value = {
    currentUser,
    userProfile,
    userType,
    loading,
    login,
    portalLogin,
    register,
    logout,
    resetPassword,
    updateProfile,
    refreshUserProfile,
    redirectAfterLogin,
    setRedirectAfterLogin,
    checkStoreOwnerPermissions
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};