import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTestMode } from '../context/TestModeContext';
import { mockUser, mockUserProfile } from '../utils/mockDataGenerators';

// Mock auth interface that matches Firebase Auth
interface MockUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

interface MockAuthContextType {
  currentUser: MockUser | null;
  userProfile: unknown;
  userType: string | null;
  loading: boolean;
  redirectAfterLogin: string | null;
  setRedirectAfterLogin: (path: string | null) => void;
  login: (email: string) => Promise<MockUser>;
  register: (email: string, password: string, displayName: string) => Promise<MockUser>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  updateUserProfile: (data: unknown) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const MockAuthContext = createContext<MockAuthContextType | null>(null);

export const useMockAuth = () => {
  const context = useContext(MockAuthContext);
  if (!context) {
    throw new Error('useMockAuth must be used within a MockAuthProvider');
  }
  return context;
};

interface MockAuthProviderProps {
  children: ReactNode;
}

export const MockAuthProvider: React.FC<MockAuthProviderProps> = ({ children }) => {
  const { isTestMode } = useTestMode();
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);
  const [userProfile, setUserProfile] = useState<unknown>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirectAfterLogin, setRedirectAfterLogin] = useState<string | null>(null);

  // Initialize mock auth state
  useEffect(() => {
    if (isTestMode) {
      console.log('🧪 Mock Auth: Initializing test mode authentication');
      // Simulate loading delay
      setTimeout(() => {
        setLoading(false);
        // Optionally auto-login in test mode
        // setCurrentUser(mockUser);
        // setUserProfile(mockUserProfile);
        // setUserType('shopper');
      }, 500);
    } else {
      setLoading(false);
    }
  }, [isTestMode]);

  const mockAuthService: MockAuthContextType = {
    currentUser,
    userProfile,
    userType,
    loading,
    redirectAfterLogin,
    setRedirectAfterLogin,

    login: async (email: string) => {
      if (isTestMode) {
        console.log(`🧪 Mock Auth: Login attempt with email: ${email}`);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Always succeed in test mode
        const user = {
          ...mockUser,
          email,
          displayName: email.split('@')[0] || 'Test User'
        };
        
        setCurrentUser(user);
        setUserProfile({
          ...mockUserProfile,
          email,
          displayName: user.displayName
        });
        setUserType('shopper');
        
        console.log('🧪 Mock Auth: Login successful');
        return user;
      } else {
        throw new Error('Mock auth only available in test mode');
      }
    },

    register: async (email: string, password: string, displayName: string) => {
      if (isTestMode) {
        console.log(`🧪 Mock Auth: Registration attempt with email: ${email}`);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // Always succeed in test mode
        const user = {
          ...mockUser,
          email,
          displayName
        };
        
        setCurrentUser(user);
        setUserProfile({
          ...mockUserProfile,
          email,
          displayName
        });
        setUserType('shopper');
        
        console.log('🧪 Mock Auth: Registration successful');
        return user;
      } else {
        throw new Error('Mock auth only available in test mode');
      }
    },

    logout: async () => {
      if (isTestMode) {
        console.log('🧪 Mock Auth: Logging out');
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setCurrentUser(null);
        setUserProfile(null);
        setUserType(null);
        setRedirectAfterLogin(null);
        
        console.log('🧪 Mock Auth: Logout successful');
      } else {
        throw new Error('Mock auth only available in test mode');
      }
    },

    refreshUserProfile: async () => {
      if (isTestMode && currentUser) {
        console.log('🧪 Mock Auth: Refreshing user profile');
        
        // Simulate fetching updated profile
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setUserProfile({
          ...mockUserProfile,
          email: currentUser.email,
          displayName: currentUser.displayName,
          updatedAt: new Date()
        });
      }
    },

    updateUserProfile: async (data: Record<string, unknown>) => {
      if (isTestMode && currentUser) {
        console.log('🧪 Mock Auth: Updating user profile', data);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const updatedUser = {
          ...currentUser,
          displayName: data.displayName || currentUser.displayName,
          email: data.email || currentUser.email
        };
        
        const updatedProfile = {
          ...userProfile,
          ...data,
          updatedAt: new Date()
        };
        
        setCurrentUser(updatedUser);
        setUserProfile(updatedProfile);
        
        console.log('🧪 Mock Auth: Profile update successful');
      }
    },

    deleteAccount: async () => {
      if (isTestMode) {
        console.log('🧪 Mock Auth: Deleting account');
        
        // Simulate network delay and validation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In test mode, always succeed
        setCurrentUser(null);
        setUserProfile(null);
        setUserType(null);
        setRedirectAfterLogin(null);
        
        console.log('🧪 Mock Auth: Account deletion successful');
      } else {
        throw new Error('Mock auth only available in test mode');
      }
    }
  };

  return (
    <MockAuthContext.Provider value={mockAuthService}>
      {children}
    </MockAuthContext.Provider>
  );
};