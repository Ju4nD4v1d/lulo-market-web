/**
 * PhoneVerificationModal - Full-screen modal for phone verification during registration
 *
 * Two-step flow:
 * 1. Phone entry: User enters their phone number
 * 2. Code verification: User enters the 6-digit SMS code
 */

import { useState, useCallback, useEffect } from 'react';
import { X, Phone, MessageSquare, ArrowLeft, RefreshCw, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { PhoneInput } from '../PhoneInput';
import { VerificationCodeInput } from '../VerificationCodeInput';
import styles from './PhoneVerificationModal.module.css';

type ModalStep = 'phone' | 'code' | 'success';

interface PhoneVerificationModalProps {
  isOpen: boolean;
  phoneNumber: string;
  onPhoneChange: (value: string) => void;
  onSendCode: () => Promise<boolean>;
  onVerifyCode: (code: string) => void;
  onResendCode: () => void;
  onClose: () => void;
  verificationStatus: 'code_sent' | 'verifying' | 'verified';
  resendCooldown: number;
  isLoading: boolean;
  error: string;
  t: (key: string) => string;
  /** Whether the verification code has expired (10 min timeout) */
  sessionExpired?: boolean;
  /** Whether max resend attempts have been reached */
  maxResendsReached?: boolean;
  /** Number of verification attempts used (for warning display) */
  verificationAttempts?: number;
}

/** Max verification attempts before requiring new code */
const MAX_VERIFICATION_ATTEMPTS = 5;

export const PhoneVerificationModal: React.FC<PhoneVerificationModalProps> = ({
  isOpen,
  phoneNumber,
  onPhoneChange,
  onSendCode,
  onVerifyCode,
  onResendCode,
  onClose,
  verificationStatus,
  resendCooldown,
  isLoading,
  error,
  t,
  sessionExpired = false,
  maxResendsReached = false,
  verificationAttempts = 0
}) => {
  // Calculate remaining attempts
  const remainingAttempts = MAX_VERIFICATION_ATTEMPTS - verificationAttempts;
  const isLastAttempt = remainingAttempts === 1;
  const noAttemptsLeft = remainingAttempts <= 0;

  const [step, setStep] = useState<ModalStep>('phone');

  const handleSendCode = useCallback(async () => {
    const success = await onSendCode();
    if (success) {
      setStep('code');
    }
  }, [onSendCode]);

  const handleBack = useCallback(() => {
    setStep('phone');
  }, []);

  const handleClose = useCallback(() => {
    // Don't allow closing during success/creating phase
    if (step === 'success') return;

    // Don't allow closing during active verification
    if (verificationStatus === 'verifying') return;

    // Confirm before closing if code was already sent (user has invested time)
    if (step === 'code') {
      const confirmed = window.confirm(t('auth.confirmCloseVerification'));
      if (!confirmed) return;
    }

    setStep('phone');
    onClose();
  }, [onClose, step, verificationStatus, t]);

  // Update step when verification succeeds - must be in useEffect, not during render
  useEffect(() => {
    if (verificationStatus === 'verified' && step === 'code') {
      setStep('success');
    }
  }, [verificationStatus, step]);

  // Reset step when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Small delay to allow close animation, then reset
      const timer = setTimeout(() => setStep('phone'), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button
          type="button"
          className={styles.closeButton}
          onClick={handleClose}
          aria-label={t('common.close')}
        >
          <X className={styles.closeIcon} />
        </button>

        {/* Step 1: Phone Entry */}
        {step === 'phone' && (
          <div className={styles.content}>
            <div className={styles.iconWrapper}>
              <Phone className={styles.icon} />
            </div>

            <h2 className={styles.title}>{t('auth.verifyYourPhone')}</h2>
            <p className={styles.subtitle}>{t('auth.verifyPhoneDescription')}</p>

            <div className={styles.phoneSection}>
              <PhoneInput
                value={phoneNumber}
                onChange={onPhoneChange}
                t={t}
              />
            </div>

            {error && (
              <div className={styles.error}>
                {error}
              </div>
            )}

            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleSendCode}
              disabled={isLoading || !phoneNumber || phoneNumber.replace(/\D/g, '').length < 10}
            >
              {isLoading ? (
                <>
                  <Loader2 className={styles.spinner} />
                  {t('auth.sendingCode')}
                </>
              ) : (
                <>
                  <MessageSquare className={styles.buttonIcon} />
                  {t('auth.sendVerificationCode')}
                </>
              )}
            </button>

            <p className={styles.disclaimer}>
              {t('auth.smsDisclaimer')}
            </p>
          </div>
        )}

        {/* Step 2: Code Verification */}
        {step === 'code' && (
          <div className={styles.content}>
            <button
              type="button"
              className={styles.backButton}
              onClick={handleBack}
              disabled={verificationStatus === 'verifying'}
            >
              <ArrowLeft className={styles.backIcon} />
              {t('auth.changeNumber')}
            </button>

            <div className={styles.iconWrapper}>
              <MessageSquare className={styles.icon} />
            </div>

            <h2 className={styles.title}>{t('auth.enterVerificationCode')}</h2>
            <p className={styles.subtitle}>
              {t('auth.codeSentTo')} <strong>{phoneNumber}</strong>
            </p>

            <div className={styles.codeSection}>
              <VerificationCodeInput
                onComplete={onVerifyCode}
                disabled={verificationStatus === 'verifying' || noAttemptsLeft}
                error={error}
                t={t}
              />

              {verificationStatus === 'verifying' && (
                <div className={styles.verifyingState}>
                  <Loader2 className={styles.spinner} />
                  {t('auth.verifying')}
                </div>
              )}
            </div>

            {/* Last attempt warning */}
            {isLastAttempt && !noAttemptsLeft && (
              <div className={styles.lastAttemptWarning}>
                <AlertTriangle className={styles.warningIcon} />
                <span>{t('auth.lastAttemptWarning')}</span>
              </div>
            )}

            {/* No attempts left warning */}
            {noAttemptsLeft && (
              <div className={styles.sessionExpiredWarning}>
                <AlertTriangle className={styles.warningIcon} />
                <span>{t('auth.errors.tooManyVerificationAttempts')}</span>
              </div>
            )}

            {/* Session expired warning */}
            {sessionExpired && !noAttemptsLeft && (
              <div className={styles.sessionExpiredWarning}>
                <AlertTriangle className={styles.warningIcon} />
                <span>{t('auth.sessionExpired')}</span>
              </div>
            )}

            <div className={styles.resendSection}>
              {maxResendsReached ? (
                <p className={styles.maxResendsText}>
                  {t('auth.errors.tooManyResendAttempts')}
                </p>
              ) : resendCooldown > 0 ? (
                <p className={styles.cooldownText}>
                  {t('auth.resendCodeIn')} {resendCooldown}s
                </p>
              ) : (
                <button
                  type="button"
                  className={styles.resendButton}
                  onClick={onResendCode}
                  disabled={isLoading}
                >
                  <RefreshCw className={styles.resendIcon} />
                  {sessionExpired ? t('auth.requestNewCode') : t('auth.resendCode')}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Success (brief) */}
        {step === 'success' && (
          <div className={styles.content}>
            <div className={styles.successWrapper}>
              <CheckCircle className={styles.successIcon} />
            </div>

            <h2 className={styles.title}>{t('auth.phoneVerified')}</h2>
            <p className={styles.subtitle}>
              {t('auth.creatingAccount')}
            </p>

            <div className={styles.verifyingState}>
              <Loader2 className={styles.spinner} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
