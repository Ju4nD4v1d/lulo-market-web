import type * as React from 'react';
/**
 * DeliveryAddressStep - Delivery address collection form
 */


import { MapPin, AlertCircle, Loader2, AlertTriangle } from 'lucide-react';
import { DeliveryAddressData, ValidationErrors } from '../../utils/validationHelpers';
import sharedStyles from '../shared.module.css';

interface DeliveryAddressStepProps {
  deliveryAddress: DeliveryAddressData;
  errors: ValidationErrors;
  onChange: (field: keyof DeliveryAddressData, value: string) => void;
  onContinue: () => void;
  onBack: () => void;
  t: (key: string) => string;
  /** Whether delivery fee is being calculated (geocoding + distance calculation) */
  isCalculating?: boolean;
  /** Error message if address validation/geocoding failed */
  calculationError?: string | null;
  /** Whether delivery is not supported due to distance exceeding max limit */
  isDistanceTooFar?: boolean;
  /** Maximum delivery distance in km */
  maxDeliveryDistance?: number;
  /** Calculated delivery distance in km */
  deliveryDistance?: number | null;
}

export const DeliveryAddressStep: React.FC<DeliveryAddressStepProps> = ({
  deliveryAddress,
  errors,
  onChange,
  onContinue,
  onBack,
  t,
  isCalculating = false,
  calculationError = null,
  isDistanceTooFar = false,
  maxDeliveryDistance = 60,
  deliveryDistance = null,
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

      {/* Distance too far banner */}
      {isDistanceTooFar && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '0.75rem',
            padding: '1rem',
            marginTop: '1rem',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <AlertTriangle
              style={{
                width: '1.5rem',
                height: '1.5rem',
                color: '#dc2626',
                flexShrink: 0,
                marginTop: '0.125rem',
              }}
            />
            <div>
              <h3
                style={{
                  fontWeight: 600,
                  color: '#991b1b',
                  marginBottom: '0.25rem',
                  fontSize: '1rem',
                }}
              >
                {t('checkout.deliveryNotAvailable')}
              </h3>
              <p style={{ color: '#b91c1c', fontSize: '0.875rem', margin: 0 }}>
                {t('checkout.distanceTooFar')
                  .replace('{maxDistance}', String(maxDeliveryDistance))
                  .replace('{distance}', deliveryDistance?.toFixed(1) || '0')}
              </p>
              <p
                style={{
                  color: '#7f1d1d',
                  fontSize: '0.75rem',
                  marginTop: '0.5rem',
                  marginBottom: 0,
                }}
              >
                {t('checkout.tryDifferentAddress')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Address validation/geocoding error (only show if not distance-too-far) */}
      {calculationError && !isDistanceTooFar && (
        <div className={sharedStyles.error} style={{ marginBottom: '1rem' }}>
          <AlertCircle className={sharedStyles.errorIcon} />
          <span>{calculationError}</span>
        </div>
      )}

      <div className={sharedStyles.buttonRow}>
        <button
          onClick={onBack}
          className={`${sharedStyles.button} ${sharedStyles.buttonSecondary}`}
          type="button"
          disabled={isCalculating}
        >
          {t('order.back')}
        </button>
        <button
          onClick={onContinue}
          className={`${sharedStyles.button} ${sharedStyles.buttonPrimary}`}
          type="button"
          disabled={isCalculating}
        >
          {isCalculating ? (
            <>
              <Loader2 className={sharedStyles.spinner} style={{ marginRight: '0.5rem' }} />
              {t('checkout.validatingAddress')}
            </>
          ) : (
            t('button.continueToReview')
          )}
        </button>
      </div>
    </div>
  );
};
