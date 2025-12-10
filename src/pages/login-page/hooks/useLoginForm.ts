/**
 * Custom hook for login/register form management
 *
 * NOTE: This hook does NOT handle redirects after login/registration.
 * All redirect logic is centralized in App.tsx to avoid race conditions.
 */

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { validateLoginForm, validateRegisterForm } from '../utils/validation';
import { getAuthErrorMessage } from '../../../utils/auth-errors';

interface UseLoginFormOptions {
  t: (key: string) => string;
  locale: string;
}

interface AddressData {
  street: string;
  city: string;
  province: string;
  postalCode: string;
}

const initialAddress: AddressData = {
  street: '',
  city: '',
  province: '',
  postalCode: ''
};

export const useLoginForm = ({ t, locale }: UseLoginFormOptions) => {
  const { login, register } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState<AddressData>(initialAddress);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check URL parameters to determine initial mode
  useEffect(() => {
    const mode = searchParams.get('mode');
    setIsLogin(mode !== 'register');
  }, [searchParams]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate form
    const validationError = isLogin
      ? validateLoginForm(email, password, t)
      : validateRegisterForm(fullName, email, password, confirmPassword, t, address);

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        // Redirect is handled by App.tsx after auth state updates
      } else {
        // Only pass address if at least one field is filled
        const hasAddress = address.street || address.city || address.province || address.postalCode;
        await register(email, password, fullName, hasAddress ? address : undefined);

        setSuccess('Account created successfully!');
        // Redirect is handled by App.tsx after auth state updates
        // This allows proper redirect to checkout if user was in checkout flow
      }
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message: string };
      const errorMessage = getAuthErrorMessage(firebaseError, locale);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isLogin, email, password, fullName, confirmPassword, address, login, register, t, locale]);

  const switchTab = useCallback((loginMode: boolean) => {
    setIsLogin(loginMode);
    setError('');
    setSuccess('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setAddress(initialAddress);

    // Update URL with mode parameter if registering, otherwise navigate to clean login page
    if (loginMode) {
      navigate('/login', { replace: true });
    } else {
      navigate('/login?mode=register', { replace: true });
    }
  }, [navigate]);

  const clearMessages = useCallback(() => {
    setError('');
    setSuccess('');
  }, []);

  return {
    isLogin,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    fullName,
    setFullName,
    address,
    setAddress,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    error,
    success,
    isLoading,
    handleSubmit,
    switchTab,
    clearMessages
  };
};
