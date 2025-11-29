import type * as React from 'react';
/**
 * RegisterForm - Registration-specific form fields
 */


import { useState } from 'react';
import { Mail, User, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { PasswordField } from './PasswordField';
import styles from './RegisterForm.module.css';

interface AddressData {
  street: string;
  city: string;
  province: string;
  postalCode: string;
}

interface RegisterFormProps {
  fullName: string;
  setFullName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (value: boolean) => void;
  address: AddressData;
  setAddress: (address: AddressData) => void;
  clearMessages: () => void;
  t: (key: string) => string;
}

const CANADIAN_PROVINCES = [
  { value: 'AB', label: 'Alberta' },
  { value: 'BC', label: 'British Columbia' },
  { value: 'MB', label: 'Manitoba' },
  { value: 'NB', label: 'New Brunswick' },
  { value: 'NL', label: 'Newfoundland and Labrador' },
  { value: 'NS', label: 'Nova Scotia' },
  { value: 'NT', label: 'Northwest Territories' },
  { value: 'NU', label: 'Nunavut' },
  { value: 'ON', label: 'Ontario' },
  { value: 'PE', label: 'Prince Edward Island' },
  { value: 'QC', label: 'Quebec' },
  { value: 'SK', label: 'Saskatchewan' },
  { value: 'YT', label: 'Yukon' },
];

export const RegisterForm: React.FC<RegisterFormProps> = ({
  fullName,
  setFullName,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  address,
  setAddress,
  clearMessages,
  t
}) => {
  const [showAddressSection, setShowAddressSection] = useState(false);

  // Format postal code as user types (A1A 1A1 format)
  const handlePostalCodeChange = (value: string) => {
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    let formatted = cleaned;
    if (cleaned.length > 3) {
      formatted = cleaned.slice(0, 3) + ' ' + cleaned.slice(3, 6);
    }
    setAddress({ ...address, postalCode: formatted });
    clearMessages();
  };

  const handleAddressChange = (field: keyof AddressData, value: string) => {
    setAddress({ ...address, [field]: value });
    clearMessages();
  };

  return (
    <>
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
          {t('auth.fullName')}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              clearMessages();
            }}
            className="w-full pl-10 border border-gray-300 rounded-lg"
            placeholder={t('auth.fullNamePlaceholder')}
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          {t('auth.email')}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearMessages();
            }}
            className="w-full pl-10 border border-gray-300 rounded-lg"
            placeholder={t('auth.emailPlaceholder')}
          />
        </div>
      </div>

      <PasswordField
        id="password"
        label={t('auth.password')}
        value={password}
        onChange={(value) => {
          setPassword(value);
          clearMessages();
        }}
        placeholder={t('auth.passwordPlaceholder')}
        showPassword={showPassword}
        onToggleShow={() => setShowPassword(!showPassword)}
        helperText={t('auth.errors.passwordTooShort')}
      />

      <PasswordField
        id="confirmPassword"
        label={t('profile.confirmPassword')}
        value={confirmPassword}
        onChange={(value) => {
          setConfirmPassword(value);
          clearMessages();
        }}
        placeholder={t('auth.confirmPasswordPlaceholder')}
        showPassword={showConfirmPassword}
        onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
      />

      {/* Optional Address Section */}
      <div className={styles.addressSection}>
        <button
          type="button"
          onClick={() => setShowAddressSection(!showAddressSection)}
          className={styles.addressToggle}
        >
          <div className={styles.addressToggleContent}>
            <MapPin className={styles.addressIcon} />
            <div className={styles.addressToggleText}>
              <span className={styles.addressToggleTitle}>{t('auth.addAddress')}</span>
              <span className={styles.addressToggleSubtitle}>{t('auth.addAddressOptional')}</span>
            </div>
          </div>
          {showAddressSection ? (
            <ChevronUp className={styles.chevronIcon} />
          ) : (
            <ChevronDown className={styles.chevronIcon} />
          )}
        </button>

        {showAddressSection && (
          <div className={styles.addressFields}>
            {/* Street Address */}
            <div className={styles.field}>
              <label htmlFor="street" className={styles.label}>
                {t('profile.address.street')}
              </label>
              <input
                id="street"
                type="text"
                value={address.street}
                onChange={(e) => handleAddressChange('street', e.target.value)}
                className={styles.input}
                placeholder={t('profile.address.streetPlaceholder')}
                autoComplete="street-address"
              />
            </div>

            {/* City and Province Row */}
            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="city" className={styles.label}>
                  {t('profile.address.city')}
                </label>
                <input
                  id="city"
                  type="text"
                  value={address.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  className={styles.input}
                  placeholder={t('profile.address.cityPlaceholder')}
                  autoComplete="address-level2"
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="province" className={styles.label}>
                  {t('profile.address.province')}
                </label>
                <select
                  id="province"
                  value={address.province}
                  onChange={(e) => handleAddressChange('province', e.target.value)}
                  className={`${styles.input} ${styles.select}`}
                  autoComplete="address-level1"
                >
                  <option value="">{t('profile.address.selectProvince')}</option>
                  {CANADIAN_PROVINCES.map((prov) => (
                    <option key={prov.value} value={prov.value}>
                      {prov.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Postal Code */}
            <div className={styles.fieldHalf}>
              <label htmlFor="postalCode" className={styles.label}>
                {t('profile.address.postalCode')}
              </label>
              <input
                id="postalCode"
                type="text"
                value={address.postalCode}
                onChange={(e) => handlePostalCodeChange(e.target.value)}
                className={styles.input}
                placeholder="A1A 1A1"
                autoComplete="postal-code"
                maxLength={7}
              />
            </div>

            {/* Country Note */}
            <div className={styles.countryNote}>
              <span className={styles.countryFlag}>🇨🇦</span>
              <span>{t('profile.address.canadaOnly')}</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
