import type * as React from 'react';
/**
 * CustomerInfoStep - Customer information collection form
 */


import { User, MapPin, AlertCircle } from 'lucide-react';
import { CustomerInfoData, ValidationErrors } from '../../utils/validationHelpers';
import styles from './CustomerInfoStep.module.css';

interface CustomerInfoStepProps {
  customerInfo: CustomerInfoData;
  errors: ValidationErrors;
  currentUserEmail?: string;
  useProfileAsDeliveryContact: boolean;
  onChange: (field: keyof CustomerInfoData, value: string) => void;
  onUseProfileToggle: (value: boolean) => void;
  onContinue: () => void;
  t: (key: string) => string;
}

export const CustomerInfoStep: React.FC<CustomerInfoStepProps> = ({
  customerInfo,
  errors,
  currentUserEmail,
  useProfileAsDeliveryContact,
  onChange,
  onUseProfileToggle,
  onContinue,
  t
}) => {
  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <User className={styles.headerIcon} />
        <h2 className={styles.title}>{t('order.customerInfo')}</h2>
      </div>

      {/* Logged in user notice */}
      {currentUserEmail && (
        <div className={styles.userNotice}>
          <div className={styles.userNoticeContent}>
            <div>
              <p className={styles.userNoticeText}>
                {t('checkout.loggedInAs')} {currentUserEmail}
              </p>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={useProfileAsDeliveryContact}
                  onChange={(e) => onUseProfileToggle(e.target.checked)}
                  className={styles.checkbox}
                />
                {t('checkout.useProfileAsDeliveryContact')}
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Form fields */}
      <div className={styles.formFields}>
        {/* Name */}
        <div className={styles.field}>
          <label className={styles.label}>
            {t('order.name')} <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            value={customerInfo.name}
            onChange={(e) => onChange('name', e.target.value)}
            className={`${styles.input} ${errors['customerInfo.name'] ? styles.inputError : ''}`}
            placeholder={t('placeholder.fullName')}
          />
          {errors['customerInfo.name'] && (
            <div className={styles.error}>
              <AlertCircle className={styles.errorIcon} />
              <span>{errors['customerInfo.name']}</span>
            </div>
          )}
        </div>

        {/* Email */}
        <div className={styles.field}>
          <label className={styles.label}>
            {t('order.email')} <span className={styles.required}>*</span>
          </label>
          <input
            type="email"
            value={customerInfo.email}
            onChange={(e) => onChange('email', e.target.value)}
            className={`${styles.input} ${errors['customerInfo.email'] ? styles.inputError : ''}`}
            placeholder={t('placeholder.email')}
          />
          {errors['customerInfo.email'] && (
            <div className={styles.error}>
              <AlertCircle className={styles.errorIcon} />
              <span>{errors['customerInfo.email']}</span>
            </div>
          )}
        </div>

        {/* Phone */}
        <div className={styles.field}>
          <label className={styles.label}>
            {t('order.phone')} <span className={styles.required}>*</span>
          </label>
          <input
            type="tel"
            value={customerInfo.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            className={`${styles.input} ${errors['customerInfo.phone'] ? styles.inputError : ''}`}
            placeholder={t('placeholder.phone')}
          />
          {errors['customerInfo.phone'] && (
            <div className={styles.error}>
              <AlertCircle className={styles.errorIcon} />
              <span>{errors['customerInfo.phone']}</span>
            </div>
          )}
        </div>

        {/* Delivery notice */}
        <div className={styles.notice}>
          <div className={styles.noticeContent}>
            <MapPin className={styles.noticeIcon} />
            <div>
              <p className={styles.noticeTitle}>{t('orderType.delivery')}</p>
              <p className={styles.noticeText}>{t('checkout.deliveryOnly')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Continue button */}
      <button
        onClick={onContinue}
        className={styles.continueButton}
        type="button"
      >
        {t('button.continueToDeliveryAddress')}
      </button>
    </div>
  );
};
