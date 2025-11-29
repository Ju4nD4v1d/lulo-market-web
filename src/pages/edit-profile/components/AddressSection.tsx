/**
 * AddressSection - Default delivery address fields for profile
 */

import { MapPin, AlertCircle } from 'lucide-react';
import styles from './AddressSection.module.css';

interface AddressSectionProps {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  errors: { [key: string]: string };
  onChange: (field: string, value: string) => void;
  t: (key: string) => string;
}

const CANADIAN_PROVINCES = [
  { value: '', label: '' },
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

export const AddressSection: React.FC<AddressSectionProps> = ({
  street,
  city,
  province,
  postalCode,
  errors,
  onChange,
  t
}) => {
  // Format postal code as user types (A1A 1A1 format)
  const handlePostalCodeChange = (value: string) => {
    // Remove all non-alphanumeric characters and convert to uppercase
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

    // Format as A1A 1A1
    let formatted = cleaned;
    if (cleaned.length > 3) {
      formatted = cleaned.slice(0, 3) + ' ' + cleaned.slice(3, 6);
    }

    onChange('postalCode', formatted);
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.header}>
        <MapPin className={styles.headerIcon} />
        {t('profile.defaultAddress')}
      </h3>
      <p className={styles.subtitle}>{t('profile.defaultAddressDescription')}</p>

      <div className={styles.fields}>
        {/* Street Address */}
        <div className={styles.field}>
          <label htmlFor="street" className={styles.label}>
            {t('profile.address.street')}
          </label>
          <input
            id="street"
            type="text"
            value={street}
            onChange={(e) => onChange('street', e.target.value)}
            className={`${styles.input} ${errors.street ? styles.inputError : ''}`}
            placeholder={t('profile.address.streetPlaceholder')}
            autoComplete="street-address"
          />
          {errors.street && (
            <div className={styles.error}>
              <AlertCircle className={styles.errorIcon} />
              <span>{errors.street}</span>
            </div>
          )}
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
              value={city}
              onChange={(e) => onChange('city', e.target.value)}
              className={`${styles.input} ${errors.city ? styles.inputError : ''}`}
              placeholder={t('profile.address.cityPlaceholder')}
              autoComplete="address-level2"
            />
            {errors.city && (
              <div className={styles.error}>
                <AlertCircle className={styles.errorIcon} />
                <span>{errors.city}</span>
              </div>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="province" className={styles.label}>
              {t('profile.address.province')}
            </label>
            <select
              id="province"
              value={province}
              onChange={(e) => onChange('province', e.target.value)}
              className={`${styles.input} ${styles.select} ${errors.province ? styles.inputError : ''}`}
              autoComplete="address-level1"
            >
              <option value="">{t('profile.address.selectProvince')}</option>
              {CANADIAN_PROVINCES.filter(p => p.value).map((prov) => (
                <option key={prov.value} value={prov.value}>
                  {prov.label}
                </option>
              ))}
            </select>
            {errors.province && (
              <div className={styles.error}>
                <AlertCircle className={styles.errorIcon} />
                <span>{errors.province}</span>
              </div>
            )}
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
            value={postalCode}
            onChange={(e) => handlePostalCodeChange(e.target.value)}
            className={`${styles.input} ${errors.postalCode ? styles.inputError : ''}`}
            placeholder="A1A 1A1"
            autoComplete="postal-code"
            maxLength={7}
          />
          {errors.postalCode && (
            <div className={styles.error}>
              <AlertCircle className={styles.errorIcon} />
              <span>{errors.postalCode}</span>
            </div>
          )}
        </div>

        {/* Country - Read only */}
        <div className={styles.countryNote}>
          <span className={styles.countryFlag}>🇨🇦</span>
          <span>{t('profile.address.canadaOnly')}</span>
        </div>
      </div>
    </div>
  );
};
