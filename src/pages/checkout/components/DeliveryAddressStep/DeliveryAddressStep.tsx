import type * as React from 'react';
/**
 * DeliveryAddressStep - Delivery address collection form
 */


import { MapPin, AlertCircle } from 'lucide-react';
import { DeliveryAddressData, ValidationErrors } from '../../utils/validationHelpers';
import sharedStyles from '../shared.module.css';

interface DeliveryAddressStepProps {
  deliveryAddress: DeliveryAddressData;
  errors: ValidationErrors;
  onChange: (field: keyof DeliveryAddressData, value: string) => void;
  onContinue: () => void;
  onBack: () => void;
  t: (key: string) => string;
}

export const DeliveryAddressStep: React.FC<DeliveryAddressStepProps> = ({
  deliveryAddress,
  errors,
  onChange,
  onContinue,
  onBack,
  t
}) => {
  return (
    <div className={sharedStyles.stepContainer}>
      <div className={sharedStyles.stepHeader}>
        <MapPin className={sharedStyles.stepIcon} />
        <h2 className={sharedStyles.stepTitle}>{t('order.deliveryAddress')}</h2>
      </div>

      <div className={sharedStyles.formFields}>
        <div className={sharedStyles.field}>
          <label className={sharedStyles.label}>
            {t('order.street')} <span className={sharedStyles.required}>*</span>
          </label>
          <input
            type="text"
            value={deliveryAddress.street}
            onChange={(e) => onChange('street', e.target.value)}
            className={`${sharedStyles.input} ${errors['deliveryAddress.street'] ? sharedStyles.inputError : ''}`}
            placeholder={t('placeholder.street')}
          />
          {errors['deliveryAddress.street'] && (
            <div className={sharedStyles.error}>
              <AlertCircle className={sharedStyles.errorIcon} />
              <span>{errors['deliveryAddress.street']}</span>
            </div>
          )}
        </div>

        <div className={sharedStyles.field}>
          <label className={sharedStyles.label}>
            {t('order.city')} <span className={sharedStyles.required}>*</span>
          </label>
          <input
            type="text"
            value={deliveryAddress.city}
            onChange={(e) => onChange('city', e.target.value)}
            className={`${sharedStyles.input} ${errors['deliveryAddress.city'] ? sharedStyles.inputError : ''}`}
            placeholder={t('placeholder.city')}
          />
          {errors['deliveryAddress.city'] && (
            <div className={sharedStyles.error}>
              <AlertCircle className={sharedStyles.errorIcon} />
              <span>{errors['deliveryAddress.city']}</span>
            </div>
          )}
        </div>

        <div className={sharedStyles.field}>
          <label className={sharedStyles.label}>
            {t('order.province')} <span className={sharedStyles.required}>*</span>
          </label>
          <input
            type="text"
            value={deliveryAddress.province}
            onChange={(e) => onChange('province', e.target.value)}
            className={`${sharedStyles.input} ${errors['deliveryAddress.province'] ? sharedStyles.inputError : ''}`}
            placeholder={t('placeholder.selectProvince')}
          />
          {errors['deliveryAddress.province'] && (
            <div className={sharedStyles.error}>
              <AlertCircle className={sharedStyles.errorIcon} />
              <span>{errors['deliveryAddress.province']}</span>
            </div>
          )}
        </div>

        <div className={sharedStyles.field}>
          <label className={sharedStyles.label}>
            {t('order.postalCode')} <span className={sharedStyles.required}>*</span>
          </label>
          <input
            type="text"
            value={deliveryAddress.postalCode}
            onChange={(e) => onChange('postalCode', e.target.value)}
            className={`${sharedStyles.input} ${errors['deliveryAddress.postalCode'] ? sharedStyles.inputError : ''}`}
            placeholder={t('placeholder.postalCode')}
          />
          {errors['deliveryAddress.postalCode'] && (
            <div className={sharedStyles.error}>
              <AlertCircle className={sharedStyles.errorIcon} />
              <span>{errors['deliveryAddress.postalCode']}</span>
            </div>
          )}
        </div>

        <div className={sharedStyles.field}>
          <label className={sharedStyles.label}>
            {t('order.deliveryInstructions')}
          </label>
          <textarea
            value={deliveryAddress.deliveryInstructions}
            onChange={(e) => onChange('deliveryInstructions', e.target.value)}
            className={sharedStyles.input}
            placeholder={t('placeholder.deliveryInstructions')}
            rows={3}
          />
        </div>
      </div>

      <div className={sharedStyles.buttonRow}>
        <button onClick={onBack} className={`${sharedStyles.button} ${sharedStyles.buttonSecondary}`} type="button">
          {t('order.back')}
        </button>
        <button onClick={onContinue} className={`${sharedStyles.button} ${sharedStyles.buttonPrimary}`} type="button">
          {t('button.continueToReview')}
        </button>
      </div>
    </div>
  );
};
