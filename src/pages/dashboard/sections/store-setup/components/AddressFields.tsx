/**
 * AddressFields Component
 *
 * Separate address input fields for store location
 * Features:
 * - Street address, city, province, and postal code inputs
 * - Canadian provinces dropdown
 * - Postal code validation and formatting
 * - Clean separation of UI from logic
 */

import type * as React from 'react';
import { MapPin, Home, Building2, Map } from 'lucide-react';
import { useLanguage } from '../../../../../context/LanguageContext';
import { formatCanadianPostalCode, isValidCanadianPostalCode } from '../../../../../utils/geocoding';
import styles from './AddressFields.module.css';

interface AddressFieldsProps {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  onStreetChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onProvinceChange: (value: string) => void;
  onPostalCodeChange: (value: string) => void;
}

export const AddressFields: React.FC<AddressFieldsProps> = ({
  street,
  city,
  province,
  postalCode,
  onStreetChange,
  onCityChange,
  onProvinceChange,
  onPostalCodeChange,
}) => {
  const { t } = useLanguage();

  const handlePostalCodeChange = (value: string) => {
    // Remove any non-alphanumeric characters except spaces
    const cleaned = value.replace(/[^a-zA-Z0-9\s]/g, '');
    onPostalCodeChange(cleaned);
  };

  const handlePostalCodeBlur = () => {
    if (postalCode) {
      const formatted = formatCanadianPostalCode(postalCode);
      onPostalCodeChange(formatted);
    }
  };

  const isPostalCodeInvalid = postalCode.trim() !== '' && !isValidCanadianPostalCode(postalCode);

  return (
    <div className={styles.container}>
      {/* Street Address */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          <Home className={styles.labelIcon} />
          {t('store.address.street')}
        </label>
        <input
          type="text"
          data-auth-input
          value={street}
          onChange={(e) => onStreetChange(e.target.value)}
          className={styles.input}
          placeholder={t('store.address.streetPlaceholder')}
        />
      </div>

      {/* City and Province */}
      <div className={styles.row}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            <Building2 className={styles.labelIcon} />
            {t('store.address.city')}
          </label>
          <input
            type="text"
            data-auth-input
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            className={styles.input}
            placeholder={t('store.address.cityPlaceholder')}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            <Map className={styles.labelIcon} />
            {t('store.address.province')}
          </label>
          <select
            data-auth-input
            value={province}
            onChange={(e) => onProvinceChange(e.target.value)}
            className={styles.select}
          >
            <option value="">{t('store.address.selectProvince')}</option>
            <option value="AB">Alberta (AB)</option>
            <option value="BC">British Columbia (BC)</option>
            <option value="MB">Manitoba (MB)</option>
            <option value="NB">New Brunswick (NB)</option>
            <option value="NL">Newfoundland and Labrador (NL)</option>
            <option value="NS">Nova Scotia (NS)</option>
            <option value="NT">Northwest Territories (NT)</option>
            <option value="NU">Nunavut (NU)</option>
            <option value="ON">Ontario (ON)</option>
            <option value="PE">Prince Edward Island (PE)</option>
            <option value="QC">Quebec (QC)</option>
            <option value="SK">Saskatchewan (SK)</option>
            <option value="YT">Yukon (YT)</option>
          </select>
        </div>
      </div>

      {/* Postal Code */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          <MapPin className={styles.labelIcon} />
          {t('store.address.postalCode')}
        </label>
        <div className={styles.postalCodeContainer}>
          <input
            type="text"
            data-auth-input
            value={postalCode}
            onChange={(e) => handlePostalCodeChange(e.target.value)}
            onBlur={handlePostalCodeBlur}
            className={`${styles.input} ${isPostalCodeInvalid ? styles.inputError : ''}`}
            placeholder={t('store.address.postalCodePlaceholder')}
            maxLength={7}
          />
          {isPostalCodeInvalid && (
            <span className={styles.errorText}>
              {t('store.address.postalCodeInvalid')}
            </span>
          )}
        </div>
        <p className={styles.helpText}>
          {t('store.address.postalCodeFormat')}
        </p>
      </div>

      {/* Country (Read-only) */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          <MapPin className={styles.labelIcon} />
          {t('store.address.country')}
        </label>
        <input
          type="text"
          data-auth-input
          value="Canada"
          disabled
          className={styles.inputDisabled}
        />
        <p className={styles.helpText}>
          {t('store.address.canadaOnly')}
        </p>
      </div>
    </div>
  );
};
