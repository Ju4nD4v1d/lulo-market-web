import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';

export const usePortalLogin = () => {
  const { portalLogin, setRedirectAfterLogin, redirectAfterLogin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handlePortalLogin = async (e: React.FormEvent, t: (key: string) => string) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      // Use the dedicated Portal login method
      const hasStoreOwnerPermissions = await portalLogin(loginData.email, loginData.password);

      if (!hasStoreOwnerPermissions) {
        // User is not a store owner - deny access
        setLoginError(t('business.login.accessDenied'));
        setIsLoggingIn(false);
        return false;
      }

      // User has permissions - proceed with redirect
      // Preserve any existing redirect path (e.g., /dashboard/lujabites/orders)
      // Only set default /dashboard if no redirect is pending
      if (!redirectAfterLogin) {
        setRedirectAfterLogin('/dashboard');
      }
      return true;

    } catch (error: unknown) {
      console.error('Login error:', error);
      setLoginError(error instanceof Error ? error.message : t('business.login.error'));
      return false;
    } finally {
      setIsLoggingIn(false);
    }
  };

  return {
    showPassword,
    setShowPassword,
    loginData,
    setLoginData,
    loginError,
    isLoggingIn,
    handlePortalLogin
  };
};
