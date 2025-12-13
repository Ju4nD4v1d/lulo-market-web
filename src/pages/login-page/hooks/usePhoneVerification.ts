/**
 * usePhoneVerification - Firebase Phone Authentication hook
 *
 * Handles SMS verification for phone numbers during registration.
 * Uses invisible reCAPTCHA to prevent abuse.
 *
 * Flow:
 * 1. sendVerificationCode(phone) - Sends SMS with 6-digit code
 * 2. verifyCode(code) - Verifies the entered code
 * 3. After verification, deletes temporary phone auth user (prevents orphan accounts)
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth';
import { auth } from '../../../config/firebase';
import { normalizePhoneToE164 } from '../utils/validation';

export type VerificationStep =
  | 'idle'
  | 'sending'
  | 'code_sent'
  | 'verifying'
  | 'verified'
  | 'error';

/** Result of verification operations - returns error directly to avoid stale state */
interface VerificationResult {
  success: boolean;
  error?: string;
}

interface UsePhoneVerificationReturn {
  /** Current step in the verification flow */
  verificationStep: VerificationStep;
  /** The phone number being verified (E.164 format) */
  phoneNumber: string;
  /** Error message if verification failed */
  error: string | null;
  /** Send verification code to the phone number - returns error directly */
  sendVerificationCode: (phone: string, t: (key: string) => string) => Promise<VerificationResult>;
  /** Verify the 6-digit code entered by user - returns error directly */
  verifyCode: (code: string, t: (key: string) => string) => Promise<VerificationResult>;
  /** Reset verification state to start over */
  resetVerification: () => void;
  /** Time remaining before user can resend code (seconds) */
  resendCooldown: number;
  /** Whether the verification session has expired (10 min timeout) */
  sessionExpired: boolean;
  /** Number of times code has been resent (max 3) */
  resendAttempts: number;
  /** Number of failed verification attempts (max 5) */
  verificationAttempts: number;
  /** Whether max resend attempts reached */
  maxResendsReached: boolean;
  /** Whether max verification attempts reached */
  maxVerificationsReached: boolean;
}

/** Session timeout in seconds (Firebase codes expire after ~10 minutes) */
const SESSION_TIMEOUT_SECONDS = 10 * 60; // 10 minutes

/** Maximum number of times user can request a new code */
const MAX_RESEND_ATTEMPTS = 3;

/** Maximum number of wrong code attempts before requiring new code */
const MAX_VERIFICATION_ATTEMPTS = 5;

/**
 * Progressive cooldown periods in seconds
 * First send: 60s, then increasing for each resend
 */
const COOLDOWN_SECONDS = [60, 60, 120, 300]; // 60s, 60s, 2min, 5min

/** Get cooldown period based on resend attempt number */
const getCooldownSeconds = (attemptNumber: number): number => {
  return COOLDOWN_SECONDS[Math.min(attemptNumber, COOLDOWN_SECONDS.length - 1)];
};

export const usePhoneVerification = (): UsePhoneVerificationReturn => {
  const [verificationStep, setVerificationStep] = useState<VerificationStep>('idle');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [resendAttempts, setResendAttempts] = useState(0);
  const [verificationAttempts, setVerificationAttempts] = useState(0);

  // Computed values for max attempts
  const maxResendsReached = resendAttempts >= MAX_RESEND_ATTEMPTS;
  const maxVerificationsReached = verificationAttempts >= MAX_VERIFICATION_ATTEMPTS;

  // Store confirmation result for code verification
  const confirmationResultRef = useRef<ConfirmationResult | null>(null);
  // Store reCAPTCHA verifier instance
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(false);
  // Track if we dynamically created the reCAPTCHA container (for cleanup)
  const createdContainerRef = useRef(false);
  // Track when the code was sent for session timeout
  const codeSentAtRef = useRef<number | null>(null);

  // Set mounted flag
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Clean up reCAPTCHA verifier on unmount
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
      // Remove dynamically created container to prevent memory leaks
      if (createdContainerRef.current) {
        const container = document.getElementById('recaptcha-container');
        if (container && container.parentNode) {
          container.parentNode.removeChild(container);
        }
        createdContainerRef.current = false;
      }
    };
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Session timeout - Firebase codes expire after ~10 minutes
  useEffect(() => {
    if (!codeSentAtRef.current || verificationStep !== 'code_sent') return;

    const checkTimeout = () => {
      if (!codeSentAtRef.current) return;
      const elapsed = (Date.now() - codeSentAtRef.current) / 1000;
      if (elapsed >= SESSION_TIMEOUT_SECONDS && isMountedRef.current) {
        setSessionExpired(true);
        setError('auth.errors.codeExpired');
      }
    };

    // Check every 30 seconds
    const timer = setInterval(checkTimeout, 30000);
    return () => clearInterval(timer);
  }, [verificationStep]);

  /**
   * Initialize reCAPTCHA verifier (invisible mode)
   * Reuses existing verifier for resend attempts to avoid "already rendered" error
   */
  const initRecaptcha = useCallback(() => {
    // Reuse existing verifier if available (important for resend)
    if (recaptchaVerifierRef.current) {
      return recaptchaVerifierRef.current;
    }

    // Create container if it doesn't exist (track for cleanup)
    let container = document.getElementById('recaptcha-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'recaptcha-container';
      document.body.appendChild(container);
      createdContainerRef.current = true; // Mark that we created it
    }

    recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved - can proceed with signInWithPhoneNumber
        console.log('reCAPTCHA verified');
      },
      'expired-callback': () => {
        // Reset reCAPTCHA if expired
        console.log('reCAPTCHA expired');
        if (isMountedRef.current) {
          setError('auth.errors.recaptchaExpired');
        }
      }
    });

    return recaptchaVerifierRef.current;
  }, []);

  /**
   * Send verification code to the phone number
   * Returns { success, error } to avoid stale state issues
   * Includes early-exit if component unmounts during async operation
   */
  const sendVerificationCode = useCallback(async (
    phone: string,
    t: (key: string) => string
  ): Promise<VerificationResult> => {
    // Early exit if already unmounted
    if (!isMountedRef.current) {
      return { success: false, error: 'Component unmounted' };
    }

    // Check if this is a resend (not first send)
    const isResend = verificationStep === 'code_sent' || verificationStep === 'error';

    // Check max resend attempts (only applies to resends, not first send)
    if (isResend && resendAttempts >= MAX_RESEND_ATTEMPTS) {
      const errorMessage = t('auth.errors.tooManyResendAttempts');
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }

    try {
      setError(null);
      setVerificationStep('sending');

      const normalizedPhone = normalizePhoneToE164(phone);
      setPhoneNumber(normalizedPhone);

      const recaptchaVerifier = initRecaptcha();

      const result = await signInWithPhoneNumber(auth, normalizedPhone, recaptchaVerifier);

      // Check if still mounted after async operation
      if (!isMountedRef.current) {
        return { success: false, error: 'Component unmounted' };
      }

      confirmationResultRef.current = result;
      setVerificationStep('code_sent');

      // Progressive cooldown: increases with each resend attempt
      const cooldownIndex = isResend ? resendAttempts + 1 : 0;
      setResendCooldown(getCooldownSeconds(cooldownIndex));

      // Track when code was sent for session timeout
      codeSentAtRef.current = Date.now();
      setSessionExpired(false);

      // Increment resend counter (only for resends) and reset verification attempts
      if (isResend) {
        setResendAttempts((prev) => prev + 1);
      }
      setVerificationAttempts(0); // Reset verification attempts on new code

      return { success: true };
    } catch (err) {
      console.error('Error sending verification code:', err);

      const errorCode = (err as { code?: string })?.code;
      const errorMessage = mapFirebaseError(errorCode, t);

      // Only update state if still mounted
      if (isMountedRef.current) {
        setVerificationStep('error');
        setError(errorMessage);
      }

      return { success: false, error: errorMessage };
    }
  }, [initRecaptcha, verificationStep, resendAttempts]);

  /**
   * Verify the 6-digit code entered by user
   * Returns { success, error } to avoid stale state issues
   * Includes early-exit if component unmounts during async operation
   */
  const verifyCode = useCallback(async (
    code: string,
    t: (key: string) => string
  ): Promise<VerificationResult> => {
    // Early exit if already unmounted
    if (!isMountedRef.current) {
      return { success: false, error: 'Component unmounted' };
    }

    // Check max verification attempts
    if (verificationAttempts >= MAX_VERIFICATION_ATTEMPTS) {
      const errorMessage = t('auth.errors.tooManyVerificationAttempts');
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }

    // Validate code is exactly 6 digits before calling Firebase
    const cleanedCode = code.replace(/\D/g, '');
    if (cleanedCode.length !== 6) {
      const errorMessage = t('auth.errors.invalidCode');
      setError(errorMessage);
      setVerificationAttempts((prev) => prev + 1);
      return { success: false, error: errorMessage };
    }

    if (!confirmationResultRef.current) {
      const errorMessage = t('auth.errors.noVerificationInProgress');
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }

    try {
      setError(null);
      setVerificationStep('verifying');

      const result = await confirmationResultRef.current.confirm(cleanedCode);

      // Check if still mounted after async operation
      if (!isMountedRef.current) {
        return { success: false, error: 'Component unmounted' };
      }

      // Store the verified phone number
      const verifiedPhone = result.user.phoneNumber || phoneNumber;
      setPhoneNumber(verifiedPhone);

      // Delete the temporary phone auth user to prevent orphan accounts
      // Firebase creates a new Auth user when verifying phone numbers,
      // but we want to create an email/password account instead
      try {
        const tempPhoneUser = result.user;
        await tempPhoneUser.delete();
      } catch (deleteErr) {
        // Log but don't fail - the verification was successful
        // Orphan user is acceptable as it has no profile data
        console.warn('Failed to delete temporary phone auth user:', deleteErr);
      }

      // Final mount check
      if (isMountedRef.current) {
        setVerificationStep('verified');
      }

      return { success: true };
    } catch (err) {
      console.error('Error verifying code:', err);

      const errorCode = (err as { code?: string })?.code;
      const errorMessage = mapFirebaseError(errorCode, t);

      // Only update state if still mounted
      if (isMountedRef.current) {
        setVerificationStep('code_sent'); // Go back to code entry state
        setError(errorMessage);

        // Increment verification attempts on wrong code
        if (errorCode === 'auth/invalid-verification-code') {
          setVerificationAttempts((prev) => prev + 1);
        }
      }

      return { success: false, error: errorMessage };
    }
  }, [phoneNumber, verificationAttempts]);

  /**
   * Reset verification state to start over
   */
  const resetVerification = useCallback(() => {
    setVerificationStep('idle');
    setPhoneNumber('');
    setError(null);
    setResendCooldown(0);
    setSessionExpired(false);
    setResendAttempts(0);
    setVerificationAttempts(0);
    confirmationResultRef.current = null;
    codeSentAtRef.current = null;

    // Clean up reCAPTCHA
    if (recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current.clear();
      recaptchaVerifierRef.current = null;
    }
  }, []);

  return {
    verificationStep,
    phoneNumber,
    error,
    sendVerificationCode,
    verifyCode,
    resetVerification,
    resendCooldown,
    sessionExpired,
    resendAttempts,
    verificationAttempts,
    maxResendsReached,
    maxVerificationsReached
  };
};

/**
 * Map Firebase error codes to user-friendly translation keys
 */
function mapFirebaseError(errorCode: string | undefined, t: (key: string) => string): string {
  switch (errorCode) {
    case 'auth/invalid-phone-number':
      return t('auth.errors.phoneInvalid');
    case 'auth/too-many-requests':
      return t('auth.errors.tooManyRequests');
    case 'auth/invalid-verification-code':
      return t('auth.errors.invalidCode');
    case 'auth/code-expired':
      return t('auth.errors.codeExpired');
    case 'auth/missing-verification-code':
      return t('auth.errors.missingCode');
    case 'auth/quota-exceeded':
      return t('auth.errors.quotaExceeded');
    case 'auth/captcha-check-failed':
      return t('auth.errors.captchaFailed');
    case 'auth/network-request-failed':
      return t('auth.errors.networkError');
    // Firebase Phone Auth configuration errors
    case 'auth/invalid-app-credential':
    case 'auth/app-not-authorized':
    case 'auth/missing-app-credential':
      return t('auth.errors.phoneAuthNotConfigured');
    case 'auth/operation-not-allowed':
      return t('auth.errors.phoneAuthDisabled');
    default:
      return t('auth.errors.verificationFailed');
  }
}
