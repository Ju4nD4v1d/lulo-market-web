/**
 * VerificationCodeInput - 6-digit OTP code input
 * Auto-advances focus between digits, supports paste
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './VerificationCodeInput.module.css';

/** Default translation fallback */
const defaultT = (key: string): string => {
  const defaults: Record<string, string> = {
    'auth.enterVerificationCode': 'Enter verification code'
  };
  return defaults[key] || key;
};

interface VerificationCodeInputProps {
  /** Controlled value (optional - uses internal state if not provided) */
  value?: string;
  /** Controlled onChange (optional - uses internal state if not provided) */
  onChange?: (value: string) => void;
  /** Called when all 6 digits are entered */
  onComplete: (code: string) => void;
  /** Error message to display */
  error?: string;
  /** Disable all inputs */
  disabled?: boolean;
  /** Translation function (optional - uses default labels if not provided) */
  t?: (key: string) => string;
}

const CODE_LENGTH = 6;

export const VerificationCodeInput = ({
  value: controlledValue,
  onChange: controlledOnChange,
  onComplete,
  error,
  disabled = false,
  t = defaultT
}: VerificationCodeInputProps) => {
  // Internal state for uncontrolled mode
  const [internalValue, setInternalValue] = useState('');

  // Use controlled value if provided, otherwise use internal state
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;
  const onChange = isControlled ? controlledOnChange! : setInternalValue;

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Use ref to access latest value without causing callback recreation
  const valueRef = useRef(value);
  valueRef.current = value;

  // Split value into individual digits (ensure value is always a string)
  const safeValue = value || '';
  const digits = Array.from({ length: CODE_LENGTH }, (_, i) => safeValue[i] || '');

  // Focus first input on mount (using ref to ensure it only runs once)
  const hasFocusedRef = useRef(false);
  useEffect(() => {
    if (!hasFocusedRef.current) {
      hasFocusedRef.current = true;
      // Focus first input on initial mount
      inputRefs.current[0]?.focus();
    }
  }, []);

  // Handle individual digit input
  // Uses valueRef to avoid recreating callback on every keystroke
  const handleDigitChange = useCallback((index: number, newValue: string) => {
    // Only accept digits
    const digit = newValue.replace(/\D/g, '').slice(-1);

    // Build new code from current value (using ref for latest value)
    const safeVal = valueRef.current || '';
    const currentDigits = Array.from({ length: CODE_LENGTH }, (_, i) => safeVal[i] || '');
    currentDigits[index] = digit;
    const newCode = currentDigits.join('');

    onChange(newCode);

    // Auto-advance to next input
    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if complete (all digits filled)
    const filledDigits = newCode.replace(/\s/g, '');
    if (filledDigits.length === CODE_LENGTH) {
      onComplete(filledDigits);
    }
  }, [onChange, onComplete]);

  // Handle backspace
  // Uses valueRef to avoid recreating callback on every keystroke
  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    const safeVal = valueRef.current || '';
    const currentDigit = safeVal[index] || '';
    if (e.key === 'Backspace' && !currentDigit && index > 0) {
      // Move to previous input when backspacing on empty field
      inputRefs.current[index - 1]?.focus();
    }
  }, []);

  // Handle paste
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const pastedDigits = pastedData.replace(/\D/g, '').slice(0, CODE_LENGTH);

    if (pastedDigits) {
      onChange(pastedDigits);

      // Focus appropriate input after paste
      const focusIndex = Math.min(pastedDigits.length, CODE_LENGTH - 1);
      inputRefs.current[focusIndex]?.focus();

      // Auto-complete if full code pasted
      if (pastedDigits.length === CODE_LENGTH) {
        onComplete(pastedDigits);
      }
    }
  }, [onChange, onComplete]);

  return (
    <div className={styles.container}>
      <label className={styles.label}>
        {t('auth.enterVerificationCode')}
      </label>

      <div className={styles.inputGroup}>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleDigitChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className={`${styles.digitInput} ${error ? styles.inputError : ''}`}
            disabled={disabled}
            autoComplete="one-time-code"
            aria-label={`Digit ${index + 1} of ${CODE_LENGTH}`}
          />
        ))}
      </div>

      {error && (
        <p className={styles.errorText}>{error}</p>
      )}
    </div>
  );
};

export default VerificationCodeInput;
