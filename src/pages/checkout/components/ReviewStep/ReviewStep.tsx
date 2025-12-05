import type * as React from 'react';
/**
 * ReviewStep - Order review before payment
 */


import { Clock, User, MapPin, ShoppingBag, Loader2 } from 'lucide-react';
import { CartItem, CartSummary } from '../../../../types/cart';
import { CustomerInfo, DeliveryAddress } from '../../../../types/order';
import sharedStyles from '../shared.module.css';
import styles from './ReviewStep.module.css';

interface ReviewStepProps {
  cartItems: CartItem[];
  cartSummary: CartSummary;
  customerInfo: CustomerInfo;
  deliveryAddress: DeliveryAddress;
  onContinue: () => void;
  onBack: () => void;
  isLoading?: boolean;
  t: (key: string) => string;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  cartItems,
  cartSummary,
  customerInfo,
  deliveryAddress,
  onContinue,
  onBack,
  isLoading = false,
  t
}) => {
  return (
    <div className={sharedStyles.stepContainer}>
      <div className={sharedStyles.stepHeader}>
        <Clock className={sharedStyles.stepIcon} />
        <h2 className={sharedStyles.stepTitle}>{t('order.reviewOrder')}</h2>
      </div>

      <p className={styles.description}>
        {t('checkout.reviewBeforePayment')}
      </p>

      {/* Customer Information */}
      <div className={styles.infoSection}>
        <div className={styles.sectionHeader}>
          <User className={styles.sectionIcon} />
          <h3 className={styles.sectionTitle}>{t('checkout.customerInfo')}</h3>
        </div>
        <div className={styles.infoDetails}>
          <p><strong>{t('checkout.name')}:</strong> {customerInfo.name}</p>
          <p><strong>{t('checkout.email')}:</strong> {customerInfo.email}</p>
          <p><strong>{t('checkout.phone')}:</strong> {customerInfo.phone}</p>
        </div>
      </div>

      {/* Delivery Address */}
      <div className={styles.infoSection}>
        <div className={styles.sectionHeader}>
          <MapPin className={styles.sectionIcon} />
          <h3 className={styles.sectionTitle}>{t('checkout.deliveryAddress')}</h3>
        </div>
        <div className={styles.addressDetails}>
          <p>{deliveryAddress.street}</p>
          {deliveryAddress.apartment && <p>{deliveryAddress.apartment}</p>}
          <p>{deliveryAddress.city}, {deliveryAddress.province}</p>
          <p>{deliveryAddress.postalCode}</p>
          {deliveryAddress.instructions && (
            <p className={styles.addressInstructions}>
              <strong>{t('checkout.deliveryInstructions')}:</strong> {deliveryAddress.instructions}
            </p>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className={styles.infoSection}>
        <div className={styles.sectionHeader}>
          <ShoppingBag className={styles.sectionIcon} />
          <h3 className={styles.sectionTitle}>{t('cart.yourOrder')}</h3>
        </div>
        <div className={styles.orderItems}>
          {cartItems.map((item) => (
            <div key={item.id} className={styles.orderItem}>
              <div className={styles.itemInfo}>
                <p className={styles.itemName}>{item.product.name}</p>
                <p className={styles.itemQuantity}>{t('cart.quantity')}: {item.quantity}</p>
              </div>
              <div className={styles.itemPricing}>
                <p className={styles.itemTotal}>${(item.priceAtTime * item.quantity).toFixed(2)}</p>
                <p className={styles.itemUnitPrice}>${item.priceAtTime.toFixed(2)} {t('cart.each')}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className={styles.orderSummary}>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>{t('cart.subtotal')}</span>
            <span>${cartSummary.subtotal.toFixed(2)}</span>
          </div>
          {cartSummary.gst > 0 && (
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>{t('cart.summary.gst')}</span>
              <span>${cartSummary.gst.toFixed(2)}</span>
            </div>
          )}
          {cartSummary.pst > 0 && (
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>{t('cart.summary.pst')}</span>
              <span>${cartSummary.pst.toFixed(2)}</span>
            </div>
          )}
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>{t('cart.deliveryFee')}</span>
            <span>${cartSummary.deliveryFee.toFixed(2)}</span>
          </div>
          {cartSummary.platformFee !== undefined && cartSummary.platformFee > 0 && (
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>{t('cart.platformFee')}</span>
              <span>${cartSummary.platformFee.toFixed(2)}</span>
            </div>
          )}
          <div className={styles.totalRow}>
            <span>{t('cart.total')}</span>
            <span className={styles.totalAmount}>${(cartSummary.finalTotal ?? cartSummary.total).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className={sharedStyles.buttonRow}>
        <button
          onClick={onBack}
          className={`${sharedStyles.button} ${sharedStyles.buttonSecondary}`}
          type="button"
          disabled={isLoading}
        >
          {t('order.back')}
        </button>
        <button
          onClick={onContinue}
          className={`${sharedStyles.button} ${sharedStyles.buttonPrimary}`}
          type="button"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className={sharedStyles.buttonSpinner} />
              {t('checkout.processing')}
            </>
          ) : (
            t('button.proceedToPayment')
          )}
        </button>
      </div>
    </div>
  );
};
