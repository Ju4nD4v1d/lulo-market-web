import type * as React from 'react';

import { Check, ArrowRight } from 'lucide-react';
import styles from './BusinessContactForm.module.css';

interface BusinessContactFormProps {
  formData: {
    fullName: string;
    businessEmail: string;
    phoneNumber: string;
    businessName: string;
    contactPreference: string;
    agreeToTerms: boolean;
  };
  errors: {
    fullName: string;
    businessEmail: string;
    phoneNumber: string;
    businessName: string;
    contactPreference: string;
    agreeToTerms: string;
  };
  isSubmitting: boolean;
  isSubmitted: boolean;
  submitError?: string;
  onInputChange: (field: string, value: string | boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  t: (key: string) => string;
}

export const BusinessContactForm: React.FC<BusinessContactFormProps> = ({
  formData,
  errors,
  isSubmitting,
  isSubmitted,
  submitError,
  onInputChange,
  onSubmit,
  t
}) => {
  if (isSubmitted) {
    return (
      <div className={styles.successContainer}>
        <div className={styles.successIcon}>
          <Check className={styles.checkIcon} />
        </div>
        <h3 className={styles.successTitle}>
          {t('business.contact.form.success.title')}
        </h3>
        <p className={styles.successMessage}>
          {t('business.contact.form.success.message')}
        </p>
        <p className={styles.successResponse}>
          {t('business.contact.form.success.response')}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.formHeader}>
        <h3 className={styles.formTitle}>
          {t('business.contact.formTitle')}
        </h3>
        <p className={styles.formDescription}>
          {t('business.contact.formDescription')}
        </p>
      </div>

      {submitError && (
        <div className={styles.submitErrorBanner}>
          {submitError}
        </div>
      )}

      <form onSubmit={onSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="fullName" className={styles.label}>
            {t('business.contact.form.fullName')}
          </label>
          <input
            id="fullName"
            type="text"
            value={formData.fullName}
            onChange={(e) => onInputChange('fullName', e.target.value)}
            placeholder={t('business.contact.form.fullNamePlaceholder')}
            className={`${styles.input} ${errors.fullName ? styles.inputError : ''}`}
            disabled={isSubmitting}
          />
          {errors.fullName && (
            <p className={styles.errorText}>{errors.fullName}</p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="businessEmail" className={styles.label}>
            {t('business.contact.form.businessEmail')}
          </label>
          <input
            id="businessEmail"
            type="email"
            value={formData.businessEmail}
            onChange={(e) => onInputChange('businessEmail', e.target.value)}
            placeholder={t('business.contact.form.businessEmailPlaceholder')}
            className={`${styles.input} ${errors.businessEmail ? styles.inputError : ''}`}
            disabled={isSubmitting}
          />
          {errors.businessEmail && (
            <p className={styles.errorText}>{errors.businessEmail}</p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="phoneNumber" className={styles.label}>
            {t('business.contact.form.phoneNumber')}
          </label>
          <input
            id="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => onInputChange('phoneNumber', e.target.value)}
            placeholder={t('business.contact.form.phoneNumberPlaceholder')}
            className={`${styles.input} ${errors.phoneNumber ? styles.inputError : ''}`}
            disabled={isSubmitting}
          />
          {errors.phoneNumber && (
            <p className={styles.errorText}>{errors.phoneNumber}</p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="businessName" className={styles.label}>
            {t('business.contact.form.businessName')}
          </label>
          <input
            id="businessName"
            type="text"
            value={formData.businessName}
            onChange={(e) => onInputChange('businessName', e.target.value)}
            placeholder={t('business.contact.form.businessNamePlaceholder')}
            className={`${styles.input} ${errors.businessName ? styles.inputError : ''}`}
            disabled={isSubmitting}
          />
          {errors.businessName && (
            <p className={styles.errorText}>{errors.businessName}</p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            {t('business.contact.form.contactPreference')}
          </label>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                value="email"
                checked={formData.contactPreference === 'email'}
                onChange={(e) => onInputChange('contactPreference', e.target.value)}
                className={styles.radio}
                disabled={isSubmitting}
              />
              <span className={styles.radioText}>{t('business.contact.form.email')}</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                value="phone"
                checked={formData.contactPreference === 'phone'}
                onChange={(e) => onInputChange('contactPreference', e.target.value)}
                className={styles.radio}
                disabled={isSubmitting}
              />
              <span className={styles.radioText}>{t('business.contact.form.phone')}</span>
            </label>
          </div>
          {errors.contactPreference && (
            <p className={styles.errorText}>{errors.contactPreference}</p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={formData.agreeToTerms}
              onChange={(e) => onInputChange('agreeToTerms', e.target.checked)}
              className={`${styles.checkbox} ${errors.agreeToTerms ? styles.checkboxError : ''}`}
              disabled={isSubmitting}
            />
            <span className={styles.checkboxText}>
              {t('business.contact.form.agreeToTerms')}{' '}
              <a
                href="#privacy"
                className={styles.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('business.contact.form.privacyPolicy')}
              </a>
              {' '}{t('business.contact.form.and')}{' '}
              <a
                href="#terms"
                className={styles.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('business.contact.form.termsOfService')}
              </a>
              .
            </span>
          </label>
          {errors.agreeToTerms && (
            <p className={styles.errorText}>{errors.agreeToTerms}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={styles.submitButton}
        >
          {isSubmitting ? (
            <>
              <div className={styles.spinner}></div>
              <span>{t('business.contact.form.submitting')}</span>
            </>
          ) : (
            <>
              <span>{t('business.contact.form.submit')}</span>
              <ArrowRight className={styles.arrowIcon} />
            </>
          )}
        </button>
      </form>
    </>
  );
};
