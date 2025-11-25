import type * as React from 'react';
/**
 * ReviewStep - Order review before payment
 */


import { Clock, User, MapPin, ShoppingBag } from 'lucide-react';
import { CartItem, CartSummary } from '../../../../types/cart';
import { CustomerInfo, DeliveryAddress } from '../../../../types/order';
import sharedStyles from '../shared.module.css';

interface ReviewStepProps {
  cartItems: CartItem[];
  cartSummary: CartSummary;
  customerInfo: CustomerInfo;
  deliveryAddress: DeliveryAddress;
  onContinue: () => void;
  onBack: () => void;
  t: (key: string) => string;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  cartItems,
  cartSummary,
  customerInfo,
  deliveryAddress,
  onContinue,
  onBack,
  t
}) => {
  return (
    <div className={sharedStyles.stepContainer}>
      <div className={sharedStyles.stepHeader}>
        <Clock className={sharedStyles.stepIcon} />
        <h2 className={sharedStyles.stepTitle}>{t('order.reviewOrder')}</h2>
      </div>

      <p style={{ marginBottom: '1.5rem', color: 'rgb(75 85 99)' }}>
        {t('checkout.reviewBeforePayment')}
      </p>

      {/* Customer Information */}
      <div style={{ backgroundColor: 'rgb(249 250 251)', padding: '1.5rem', borderRadius: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <User style={{ width: '1.25rem', height: '1.25rem', color: 'var(--primary-400, #C8E400)' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>{t('checkout.customerInfo')}</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'rgb(75 85 99)' }}>
          <p><strong>{t('checkout.name')}:</strong> {customerInfo.name}</p>
          <p><strong>{t('checkout.email')}:</strong> {customerInfo.email}</p>
          <p><strong>{t('checkout.phone')}:</strong> {customerInfo.phone}</p>
        </div>
      </div>

      {/* Delivery Address */}
      <div style={{ backgroundColor: 'rgb(249 250 251)', padding: '1.5rem', borderRadius: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <MapPin style={{ width: '1.25rem', height: '1.25rem', color: 'var(--primary-400, #C8E400)' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>{t('checkout.deliveryAddress')}</h3>
        </div>
        <div style={{ fontSize: '0.875rem', color: 'rgb(75 85 99)' }}>
          <p>{deliveryAddress.street}</p>
          {deliveryAddress.apartment && <p>{deliveryAddress.apartment}</p>}
          <p>{deliveryAddress.city}, {deliveryAddress.province}</p>
          <p>{deliveryAddress.postalCode}</p>
          {deliveryAddress.instructions && (
            <p style={{ marginTop: '0.5rem' }}>
              <strong>{t('checkout.deliveryInstructions')}:</strong> {deliveryAddress.instructions}
            </p>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div style={{ backgroundColor: 'rgb(249 250 251)', padding: '1.5rem', borderRadius: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <ShoppingBag style={{ width: '1.25rem', height: '1.25rem', color: 'var(--primary-400, #C8E400)' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>{t('cart.yourOrder')}</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {cartItems.map((item) => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '0.75rem', backgroundColor: 'white', borderRadius: '0.5rem' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{item.product.name}</p>
                <p style={{ color: 'rgb(107 114 128)' }}>{t('cart.quantity')}: {item.quantity}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: '600' }}>${(item.priceAtTime * item.quantity).toFixed(2)}</p>
                <p style={{ fontSize: '0.75rem', color: 'rgb(107 114 128)' }}>${item.priceAtTime.toFixed(2)} {t('cart.each')}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgb(229 231 235)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            <span style={{ color: 'rgb(107 114 128)' }}>{t('cart.subtotal')}</span>
            <span>${cartSummary.subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            <span style={{ color: 'rgb(107 114 128)' }}>{t('cart.tax')}</span>
            <span>${cartSummary.tax.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            <span style={{ color: 'rgb(107 114 128)' }}>{t('cart.deliveryFee')}</span>
            <span>${cartSummary.deliveryFee.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.125rem', fontWeight: '700', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '2px solid rgb(229 231 235)' }}>
            <span>{t('cart.total')}</span>
            <span style={{ color: 'var(--primary-400, #C8E400)' }}>${cartSummary.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className={sharedStyles.buttonRow}>
        <button onClick={onBack} className={`${sharedStyles.button} ${sharedStyles.buttonSecondary}`} type="button">
          {t('order.back')}
        </button>
        <button onClick={onContinue} className={`${sharedStyles.button} ${sharedStyles.buttonPrimary}`} type="button">
          {t('button.proceedToPayment')}
        </button>
      </div>
    </div>
  );
};
