import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { auth } from '../../config/firebase';
import React from 'react';

// Mock Firebase auth methods
const mockSignInWithEmailAndPassword = vi.fn();
const mockCreateUserWithEmailAndPassword = vi.fn();
const mockSignOut = vi.fn();
const mockUpdateProfile = vi.fn();
const mockOnAuthStateChanged = vi.fn();

vi.mock('../../config/firebase', () => ({
  auth: {
    currentUser: null,
    signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
    createUserWithEmailAndPassword: mockCreateUserWithEmailAndPassword,
    signOut: mockSignOut,
    updateProfile: mockUpdateProfile,
    onAuthStateChanged: mockOnAuthStateChanged,
  },
  db: {},
}));

// Mock Firebase/firestore
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  collection: vi.fn(),
  serverTimestamp: vi.fn(() => new Date()),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default mock behavior
    mockOnAuthStateChanged.mockImplementation((callback) => {
      callback(null); // No user by default
      return vi.fn(); // Return unsubscribe function
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with no user and loading true', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.currentUser).toBeNull();
      expect(result.current.loading).toBe(true);
      expect(result.current.userProfile).toBeNull();
    });

    it('should set loading to false after auth state is determined', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('Login Functionality', () => {
    it('should login user successfully', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
      };

      mockSignInWithEmailAndPassword.mockResolvedValueOnce({
        user: mockUser,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
        auth,
        'test@example.com',
        'password123'
      );
    });

    it('should handle login errors', async () => {
      const loginError = new Error('Invalid credentials');
      mockSignInWithEmailAndPassword.mockRejectedValueOnce(loginError);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await expect(
        result.current.login('test@example.com', 'wrongpassword')
      ).rejects.toThrow('Invalid credentials');
    });

    it('should validate email format', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await expect(
        result.current.login('invalid-email', 'password123')
      ).rejects.toThrow();
    });

    it('should validate password length', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await expect(
        result.current.login('test@example.com', '123')
      ).rejects.toThrow();
    });
  });

  describe('Registration Functionality', () => {
    it('should register user successfully', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: null,
      };

      mockCreateUserWithEmailAndPassword.mockResolvedValueOnce({
        user: mockUser,
      });
      mockUpdateProfile.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.register('test@example.com', 'password123', 'Test User');
      });

      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
        auth,
        'test@example.com',
        'password123'
      );
      expect(mockUpdateProfile).toHaveBeenCalledWith(mockUser, {
        displayName: 'Test User',
      });
    });

    it('should handle registration errors', async () => {
      const registrationError = new Error('Email already in use');
      mockCreateUserWithEmailAndPassword.mockRejectedValueOnce(registrationError);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await expect(
        result.current.register('test@example.com', 'password123', 'Test User')
      ).rejects.toThrow('Email already in use');
    });

    it('should validate required fields for registration', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Test empty display name
      await expect(
        result.current.register('test@example.com', 'password123', '')
      ).rejects.toThrow();

      // Test empty email
      await expect(
        result.current.register('', 'password123', 'Test User')
      ).rejects.toThrow();

      // Test short password
      await expect(
        result.current.register('test@example.com', '123', 'Test User')
      ).rejects.toThrow();
    });
  });

  describe('Logout Functionality', () => {
    it('should logout user successfully', async () => {
      mockSignOut.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.logout();
      });

      expect(mockSignOut).toHaveBeenCalledWith(auth);
    });

    it('should handle logout errors', async () => {
      const logoutError = new Error('Logout failed');
      mockSignOut.mockRejectedValueOnce(logoutError);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await expect(result.current.logout()).rejects.toThrow('Logout failed');
    });
  });

  describe('Auth State Changes', () => {
    it('should update current user when auth state changes', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
      };

      // Mock auth state change to logged in user
      mockOnAuthStateChanged.mockImplementation((callback) => {
        callback(mockUser);
        return vi.fn();
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.currentUser).toEqual(mockUser);
        expect(result.current.loading).toBe(false);
      });
    });

    it('should clear user data when user logs out', async () => {
      // Start with a logged in user
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
      };

      let authCallback: (user: unknown) => void;
      mockOnAuthStateChanged.mockImplementation((callback) => {
        authCallback = callback;
        callback(mockUser); // Initial logged in state
        return vi.fn();
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial login
      await waitFor(() => {
        expect(result.current.currentUser).toEqual(mockUser);
      });

      // Simulate logout
      act(() => {
        authCallback(null);
      });

      await waitFor(() => {
        expect(result.current.currentUser).toBeNull();
        expect(result.current.userProfile).toBeNull();
      });
    });
  });

  describe('Redirect After Login', () => {
    it('should set and clear redirect path', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.setRedirectAfterLogin('#dashboard');
      });

      expect(result.current.redirectAfterLogin).toBe('#dashboard');

      act(() => {
        result.current.setRedirectAfterLogin(null);
      });

      expect(result.current.redirectAfterLogin).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const networkError = new Error('Network error');
      networkError.name = 'NetworkError';
      mockSignInWithEmailAndPassword.mockRejectedValueOnce(networkError);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await expect(
        result.current.login('test@example.com', 'password123')
      ).rejects.toThrow('Network error');
    });

    it('should handle Firebase auth errors', async () => {
      const firebaseError = {
        code: 'auth/user-not-found',
        message: 'User not found',
      };
      mockSignInWithEmailAndPassword.mockRejectedValueOnce(firebaseError);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await expect(
        result.current.login('test@example.com', 'password123')
      ).rejects.toMatchObject(firebaseError);
    });
  });

  describe('Store Owner Permissions', () => {
    it('should check store owner permissions', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Mock user with store owner permissions
      const hasPermissions = await result.current.checkStoreOwnerPermissions();
      
      // Should return false by default (no user)
      expect(hasPermissions).toBe(false);
    });
  });

  describe('User Profile Management', () => {
    it('should refresh user profile', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.refreshUserProfile();
      });

      // Should not throw error even without user
      expect(result.current.userProfile).toBeNull();
    });

    it('should update user profile', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
      };

      mockOnAuthStateChanged.mockImplementation((callback) => {
        callback(mockUser);
        return vi.fn();
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.currentUser).toEqual(mockUser);
      });

      const profileData = {
        displayName: 'Updated Name',
        avatar: 'new-avatar-url',
      };

      await act(async () => {
        await result.current.updateUserProfile(profileData);
      });

      // Profile update should be called
      expect(mockUpdateProfile).toHaveBeenCalled();
    });
  });
});