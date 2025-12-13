/**
 * PhoneInput - Canadian phone number input with formatting
 * Displays +1 prefix and auto-formats as user types: (604) 555-1234
 */

import { useCallback, useMemo } from 'react';
import { Phone } from 'lucide-react';
import styles from './PhoneInput.module.css';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  t: (key: string) => string;
}

/**
 * Format phone number as user types: (604) 555-1234
 * Handles both raw 10-digit input and E.164 format (+1XXXXXXXXXX)
 */
const formatPhoneDisplay = (value: string): string => {
  // Remove all non-digits
  let digits = value.replace(/\D/g, '');

  // If 11 digits starting with 1 (US/Canada country code), strip it
  if (digits.length === 11 && digits.startsWith('1')) {
    digits = digits.slice(1);
  }

  // Limit to 10 digits (Canadian phone without country code)
  const limited = digits.slice(0, 10);

  if (limited.length === 0) return '';
  if (limited.length <= 3) return `(${limited}`;
  if (limited.length <= 6) return `(${limited.slice(0, 3)}) ${limited.slice(3)}`;
  return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`;
};

export const PhoneInput = ({
  value,
  onChange,
  error,
  disabled = false,
  t
}: PhoneInputProps) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Extract only digits from input
    const digits = inputValue.replace(/\D/g, '');

    // Store raw digits, let display handle formatting
    onChange(digits);
  }, [onChange]);

  // Format for display (memoized to avoid recalculation on unrelated re-renders)
  const displayValue = useMemo(() => formatPhoneDisplay(value), [value]);

  return (
    <div className={styles.container}>
      <label htmlFor="phoneNumber" className={styles.label}>
        {t('auth.phoneNumber')}
      </label>
      <div className={styles.inputWrapper}>
        <div className={styles.prefix}>
          <Phone className={styles.icon} />
          <span className={styles.countryCode}>+1</span>
        </div>
        <input
          id="phoneNumber"
          type="tel"
          value={displayValue}
          onChange={handleChange}
          className={`${styles.input} ${error ? styles.inputError : ''}`}
          placeholder={t('auth.phoneNumberPlaceholder')}
          disabled={disabled}
          autoComplete="tel-national"
          inputMode="tel"
        />
      </div>
      {error && (
        <p className={styles.errorText}>{error}</p>
      )}
      <p className={styles.hint}>{t('auth.phoneNumberHint')}</p>
    </div>
  );
};

export default PhoneInput;
