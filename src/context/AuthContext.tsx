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
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { UserProfile, UserType } from '../types/user';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  userType: UserType | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  portalLogin: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
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
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Convert Firestore Timestamps to Dates
            const userProfile: UserProfile = {
              ...userData,
              createdAt: userData.createdAt?.toDate ? userData.createdAt.toDate() : new Date(userData.createdAt),
              lastLoginAt: userData.lastLoginAt?.toDate ? userData.lastLoginAt.toDate() : new Date(userData.lastLoginAt || Date.now()),
            } as UserProfile;
            setUserProfile(userProfile);
            setUserType(userProfile.userType);
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
            
            await setDoc(doc(db, 'users', user.uid), {
              ...defaultUserData,
              createdAt: serverTimestamp(),
              lastLoginAt: serverTimestamp(),
            });
            
            setUserProfile(defaultUserData);
            setUserType('shopper');
          }
        } catch (error: any) {
          console.error('Error fetching user profile:', error);

          // Handle offline gracefully - don't clear user profile
          if (error?.code === 'unavailable' || error?.message?.includes('offline')) {
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
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // If user is marked as storeOwner, grant access
      if (userData.userType === 'storeOwner') {
        // Update last login
        await updateDoc(doc(db, 'users', user.uid), {
          lastLoginAt: serverTimestamp()
        });
        return true;
      }
    }
    
    // If no profile exists or not a storeOwner, check for stores
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const storesRef = collection(db, 'stores');
    const storeQuery = query(storesRef, where('ownerId', '==', user.uid));
    const storeSnapshot = await getDocs(storeQuery);
    
    const hasStores = !storeSnapshot.empty;
    
    if (hasStores) {
      // User has stores - create/update profile as storeOwner
      const storeOwnerProfileData = {
        id: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Store Owner',
        userType: 'storeOwner' as const,
        createdAt: userDoc.exists() ? userDoc.data().createdAt : serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        preferences: userDoc.exists() ? userDoc.data().preferences : {},
      };
      
      await setDoc(doc(db, 'users', user.uid), storeOwnerProfileData, { merge: true });
      return true;
    } else {
      // User doesn't have stores and is not marked as storeOwner - deny access
      await signOut(auth);
      return false;
    }
  };

  const register = async (email: string, password: string, displayName?: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create user profile document with shopper as default
    const userProfileData: UserProfile = {
      id: user.uid,
      email: user.email || '',
      displayName: displayName || 'User',
      userType: 'shopper', // Default to shopper
      createdAt: new Date(),
      lastLoginAt: new Date(),
      preferences: {},
    };
    
    await setDoc(doc(db, 'users', user.uid), {
      ...userProfileData,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });
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

      // Update Firestore profile document
      const userDocRef = doc(db, 'users', currentUser.uid);
      const updateData = {
        ...profileData,
        lastLoginAt: serverTimestamp()
      };

      await updateDoc(userDocRef, updateData);

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
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        // Convert Firestore Timestamps to Dates
        const refreshedProfile: UserProfile = {
          ...userData,
          createdAt: userData.createdAt?.toDate ? userData.createdAt.toDate() : new Date(userData.createdAt),
          lastLoginAt: userData.lastLoginAt?.toDate ? userData.lastLoginAt.toDate() : new Date(userData.lastLoginAt || Date.now()),
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
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      const storesRef = collection(db, 'stores');
      const storeQuery = query(storesRef, where('ownerId', '==', currentUser.uid));
      const storeSnapshot = await getDocs(storeQuery);

      return !storeSnapshot.empty;
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