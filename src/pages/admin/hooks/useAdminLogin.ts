/**
 * useAdminLogin - Hook for admin authentication
 * Validates user credentials and checks for admin userType
 */

import { useState } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../../../config/firebase';
import { getUserProfile } from '../../../services/api/userApi';

interface LoginData {
  email: string;
  password: string;
}

export const useAdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState<LoginData>({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent, t: (key: string) => string) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        loginData.email,
        loginData.password
      );

      // Get user profile to check userType
      const profile = await getUserProfile(userCredential.user.uid);

      if (profile?.userType !== 'admin') {
        // User is not an admin - sign out and deny access
        await signOut(auth);
        setLoginError(t('admin.login.accessDenied'));
        setIsLoggingIn(false);
        return false;
      }

      // User is admin - redirect to admin dashboard
      window.location.hash = '#admin';
      return true;

    } catch (error: unknown) {
      console.error('Admin login error:', error);

      // Handle specific Firebase auth errors
      if (error instanceof Error) {
        if (error.message.includes('user-not-found') || error.message.includes('wrong-password')) {
          setLoginError(t('admin.login.invalidCredentials'));
        } else if (error.message.includes('too-many-requests')) {
          setLoginError(t('admin.login.tooManyAttempts'));
        } else {
          setLoginError(t('admin.login.error'));
        }
      } else {
        setLoginError(t('admin.login.error'));
      }

      return false;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleInputChange = (field: keyof LoginData, value: string) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (loginError) {
      setLoginError('');
    }
  };

  return {
    showPassword,
    setShowPassword,
    loginData,
    handleInputChange,
    loginError,
    setLoginError,
    isLoggingIn,
    handleAdminLogin
  };
};
