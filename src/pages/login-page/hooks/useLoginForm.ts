/**
 * Custom hook for login/register form management
 *
 * NOTE: This hook does NOT handle redirects after login/registration.
 * All redirect logic is centralized in App.tsx to avoid race conditions.
 *
 * Registration Flow:
 * 1. User fills form (name, email, password)
 * 2. User clicks Continue → Opens phone verification modal
 * 3. User enters phone in modal → SMS sent
 * 4. User enters 6-digit code → Code verified
 * 5. Account created with verified phone stored
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { validateLoginForm, validateRegisterForm, validatePhoneNumber, normalizePhoneToE164 } from '../utils/validation';
import { getAuthErrorMessage } from '../../../utils/auth-errors';
import { usePhoneVerification } from './usePhoneVerification';
import { isPhoneNumberInUse } from '../../../services/api/userApi';

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

/** Registration step in the multi-step flow */
export type RegistrationStep = 'form' | 'verification' | 'creating';

const initialAddress: AddressData = {
  street: '',
  city: '',
  province: '',
  postalCode: ''
};

/** Session storage keys for form persistence */
const STORAGE_KEYS = {
  REGISTRATION_STEP: 'lulo_registration_step',
  PHONE_NUMBER: 'lulo_verification_phone',
  FORM_DATA: 'lulo_registration_form'
} as const;

/** Clear all registration session storage */
const clearRegistrationStorage = () => {
  sessionStorage.removeItem(STORAGE_KEYS.REGISTRATION_STEP);
  sessionStorage.removeItem(STORAGE_KEYS.PHONE_NUMBER);
  sessionStorage.removeItem(STORAGE_KEYS.FORM_DATA);
};

export const useLoginForm = ({ t, locale }: UseLoginFormOptions) => {
  const { login, register } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Form state
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState<AddressData>(initialAddress);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [registrationStep, setRegistrationStep] = useState<RegistrationStep>('form');

  // Phone verification hook
  const {
    verificationStep,
    phoneNumber: verifiedPhoneNumber,
    error: verificationError,
    sendVerificationCode,
    verifyCode,
    resetVerification,
    resendCooldown,
    sessionExpired,
    maxResendsReached,
    verificationAttempts
  } = usePhoneVerification();

  // Idempotency guard - prevent multiple account creation calls
  const isCreatingAccountRef = useRef(false);

  // Check URL parameters to determine initial mode
  useEffect(() => {
    const mode = searchParams.get('mode');
    setIsLogin(mode !== 'register');
  }, [searchParams]);

  // Restore form data from sessionStorage on mount (handles browser refresh)
  useEffect(() => {
    try {
      const savedFormData = sessionStorage.getItem(STORAGE_KEYS.FORM_DATA);
      const savedPhone = sessionStorage.getItem(STORAGE_KEYS.PHONE_NUMBER);
      const savedStep = sessionStorage.getItem(STORAGE_KEYS.REGISTRATION_STEP);

      if (savedFormData) {
        const formData = JSON.parse(savedFormData);
        if (formData.fullName) setFullName(formData.fullName);
        if (formData.email) setEmail(formData.email);
        if (formData.address) setAddress(formData.address);
        // Don't restore passwords for security
      }

      if (savedPhone) {
        setPhoneNumber(savedPhone);
      }

      // If user was in verification step, show modal but they'll need new code
      // (Firebase ConfirmationResult can't be persisted)
      if (savedStep === 'verification' && savedPhone) {
        setRegistrationStep('verification');
        setIsLogin(false);
        // Show message that they need to request new code after refresh
        setError(t('auth.sessionExpired'));
      }
    } catch (e) {
      // Ignore parse errors, just use defaults
      console.warn('Failed to restore form data from sessionStorage:', e);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist form data to sessionStorage when it changes
  useEffect(() => {
    if (!isLogin && registrationStep !== 'form') {
      // Save form data (excluding passwords)
      const formData = {
        fullName,
        email,
        address
      };
      sessionStorage.setItem(STORAGE_KEYS.FORM_DATA, JSON.stringify(formData));
      sessionStorage.setItem(STORAGE_KEYS.PHONE_NUMBER, phoneNumber);
      sessionStorage.setItem(STORAGE_KEYS.REGISTRATION_STEP, registrationStep);
    }
  }, [isLogin, registrationStep, fullName, email, address, phoneNumber]);

  /**
   * Create the account after phone verification succeeds
   * Uses idempotency guard to prevent multiple calls
   */
  const handleCreateAccount = useCallback(async () => {
    // Idempotency guard - prevent multiple simultaneous calls
    if (isCreatingAccountRef.current) {
      return;
    }
    isCreatingAccountRef.current = true;

    setRegistrationStep('creating');
    setIsLoading(true);
    setError('');

    try {
      // Only pass address if at least one field is filled
      const hasAddress = address.street || address.city || address.province || address.postalCode;
      await register(email, password, fullName, hasAddress ? address : undefined, verifiedPhoneNumber);

      // Clear session storage after successful registration
      clearRegistrationStorage();

      setSuccess(t('auth.accountCreated') || 'Account created successfully!');
      // Redirect is handled by App.tsx after auth state updates
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message: string };
      const errorMessage = getAuthErrorMessage(firebaseError, locale);
      setError(errorMessage);
      // Go back to form step on error
      setRegistrationStep('form');
      resetVerification();
      // Reset idempotency guard on error to allow retry
      isCreatingAccountRef.current = false;
    } finally {
      setIsLoading(false);
    }
  }, [email, password, fullName, address, verifiedPhoneNumber, register, t, locale, resetVerification]);

  // Keep a ref to the latest handleCreateAccount to avoid stale closures in useEffect
  const handleCreateAccountRef = useRef(handleCreateAccount);
  useEffect(() => {
    handleCreateAccountRef.current = handleCreateAccount;
  }, [handleCreateAccount]);

  // Handle verification step changes - trigger account creation when phone is verified
  useEffect(() => {
    if (verificationStep === 'verified' && registrationStep === 'verification') {
      // Phone verified - brief delay to show success checkmark before creating account
      const timer = setTimeout(() => {
        handleCreateAccountRef.current();
      }, 800); // 0.8s - enough to see success, fast enough to feel responsive

      return () => clearTimeout(timer);
    }
  }, [verificationStep, registrationStep]);

  /**
   * Handle form submission
   * - For login: Authenticate directly
   * - For register: Validate form and open phone verification modal
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isLogin) {
      // Login flow - validate and authenticate
      const validationError = validateLoginForm(email, password, t);
      if (validationError) {
        setError(validationError);
        return;
      }

      setIsLoading(true);
      try {
        await login(email, password);
        // Redirect is handled by App.tsx after auth state updates
      } catch (err: unknown) {
        const firebaseError = err as { code?: string; message: string };
        const errorMessage = getAuthErrorMessage(firebaseError, locale);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Registration flow - validate form (no phone yet) and open modal
      const validationError = validateRegisterForm(
        fullName,
        email,
        password,
        confirmPassword,
        t,
        address
      );

      if (validationError) {
        setError(validationError);
        return;
      }

      // Open phone verification modal
      setRegistrationStep('verification');
    }
  }, [
    isLogin,
    email,
    password,
    fullName,
    confirmPassword,
    address,
    login,
    t,
    locale
  ]);

  /**
   * Send verification code from the modal
   * Returns true on success, false on failure
   * Checks if phone number is already registered before sending
   */
  const handleSendCode = useCallback(async (): Promise<boolean> => {
    // Validate phone number format
    const validationError = validatePhoneNumber(phoneNumber, t);
    if (validationError) {
      setError(validationError);
      return false;
    }

    setError('');
    setIsLoading(true);

    try {
      // Normalize phone to E.164 format for database lookup
      const normalizedPhone = normalizePhoneToE164(phoneNumber);

      // Check if phone number is already registered
      const phoneExists = await isPhoneNumberInUse(normalizedPhone);
      if (phoneExists) {
        setError(t('auth.errors.phoneAlreadyInUse'));
        setIsLoading(false);
        return false;
      }

      // Phone is available - send verification code
      const result = await sendVerificationCode(phoneNumber, t);

      if (!result.success && result.error) {
        setError(result.error);
      }
      setIsLoading(false);
      return result.success;
    } catch (err) {
      console.error('Error checking phone number:', err);
      setError(t('auth.errors.verificationFailed'));
      setIsLoading(false);
      return false;
    }
  }, [phoneNumber, sendVerificationCode, t]);

  /**
   * Handle verification code submission
   */
  const handleVerifyCode = useCallback(async (code: string) => {
    setError('');
    const result = await verifyCode(code, t);

    if (!result.success && result.error) {
      setError(result.error);
    }
    // If successful, the useEffect above will trigger account creation
  }, [verifyCode, t]);

  /**
   * Resend verification code
   * Re-checks phone availability in case another user registered during cooldown
   */
  const handleResendCode = useCallback(async () => {
    setError('');
    setIsLoading(true);

    try {
      // Re-check phone availability before resending
      const normalizedPhone = normalizePhoneToE164(phoneNumber);
      const phoneExists = await isPhoneNumberInUse(normalizedPhone);
      if (phoneExists) {
        setError(t('auth.errors.phoneAlreadyInUse'));
        setIsLoading(false);
        return;
      }

      const result = await sendVerificationCode(phoneNumber, t);
      if (!result.success && result.error) {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error resending code:', err);
      setError(t('auth.errors.verificationFailed'));
    }
    setIsLoading(false);
  }, [sendVerificationCode, phoneNumber, t]);

  /**
   * Go back from verification step to form
   */
  const handleBackToForm = useCallback(() => {
    setRegistrationStep('form');
    resetVerification();
    setError('');
    // Clear saved verification data when going back
    clearRegistrationStorage();
  }, [resetVerification]);

  /**
   * Switch between login and register tabs
   */
  const switchTab = useCallback((loginMode: boolean) => {
    setIsLogin(loginMode);
    setError('');
    setSuccess('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setPhoneNumber('');
    setAddress(initialAddress);
    setRegistrationStep('form');
    resetVerification();
    // Reset idempotency guard when switching tabs
    isCreatingAccountRef.current = false;
    // Clear any saved registration data
    clearRegistrationStorage();

    // Update URL with mode parameter
    if (loginMode) {
      navigate('/login', { replace: true });
    } else {
      navigate('/login?mode=register', { replace: true });
    }
  }, [navigate, resetVerification]);

  const clearMessages = useCallback(() => {
    setError('');
    setSuccess('');
  }, []);

  // Map verification step to status for the UI component
  const getVerificationStatus = (): 'code_sent' | 'verifying' | 'verified' => {
    if (verificationStep === 'verified') return 'verified';
    if (verificationStep === 'verifying') return 'verifying';
    return 'code_sent';
  };

  return {
    // Form mode
    isLogin,

    // Form fields
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    fullName,
    setFullName,
    phoneNumber,
    setPhoneNumber,
    address,
    setAddress,

    // Password visibility
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,

    // UI state
    error,
    success,
    isLoading,

    // Registration flow
    registrationStep,
    verificationStatus: getVerificationStatus(),
    verificationError,
    resendCooldown,
    sessionExpired,
    maxResendsReached,
    verificationAttempts,

    // Actions
    handleSubmit,
    handleSendCode,
    handleVerifyCode,
    handleResendCode,
    handleBackToForm,
    switchTab,
    clearMessages
  };
};
