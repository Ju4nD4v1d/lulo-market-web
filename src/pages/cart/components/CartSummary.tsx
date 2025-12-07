import type * as React from 'react';
import { ShoppingBag, Truck, Receipt, Shield, LogIn, Gift } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import styles from './CartSummary.module.css';

/** Delivery fee discount data for new customers */
interface DeliveryFeeDiscountData {
  originalFee: number;
  discountedFee: number;
  discountAmount: number;
  isEligible: boolean;
  ordersRemaining: number;
}

interface CartSummaryProps {
  subtotal: number;
  /** Delivery fee - null means "calculated at checkout" */
  deliveryFee: number | null;
  platformFee: number;
  gst: number;
  pst: number;
  total: number;
  itemCount: number;
  onCheckout: () => void;
  isProcessing?: boolean;
  isLoggedIn?: boolean;
  /** Delivery fee discount info for new customers */
  deliveryFeeDiscount?: DeliveryFeeDiscountData | null;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  subtotal,
  deliveryFee,
  platformFee,
  gst,
  pst,
  total,
  itemCount,
  onCheckout,
  isProcessing = false,
  isLoggedIn = true,
  deliveryFeeDiscount,
}) => {
  const { t } = useLanguage();

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t('cart.summary.orderSummary')}</h2>

      {/* Summary Lines */}
      <div className={styles.lines}>
        <div className={styles.line}>
          <span className={styles.lineLabel}>
            <ShoppingBag className={styles.lineIcon} />
            {t('cart.summary.subtotal')} ({itemCount} {itemCount === 1 ? t('cart.summary.item') : t('cart.summary.items')})
          </span>
          <span className={styles.lineValue}>CAD ${subtotal.toFixed(2)}</span>
        </div>

        <div className={styles.line}>
          <span className={styles.lineLabel}>
            <Truck className={styles.lineIcon} />
            {t('cart.summary.delivery')}
            {deliveryFeeDiscount?.isEligible && (
              <span className={styles.discountBadge}>
                {t('cart.summary.newCustomerDiscount')}
              </span>
            )}
          </span>
          <span className={styles.lineValue}>
            {deliveryFee !== null ? (
              deliveryFeeDiscount?.isEligible ? (
                <span className={styles.discountedPrice}>
                  <span className={styles.originalPrice}>
                    CAD ${deliveryFeeDiscount.originalFee.toFixed(2)}
                  </span>
                  <span className={styles.finalPrice}>
                    CAD ${deliveryFeeDiscount.discountedFee.toFixed(2)}
                  </span>
                </span>
              ) : (
                `CAD $${deliveryFee.toFixed(2)}`
              )
            ) : (
              t('cart.deliveryFeeAtCheckout')
            )}
          </span>
        </div>

        {/* New Customer Discount Banner */}
        {deliveryFeeDiscount?.isEligible && deliveryFee !== null && (
          <div className={styles.discountBanner}>
            <Gift className={styles.discountBannerIcon} />
            <span>
              {deliveryFeeDiscount.ordersRemaining === 1
                ? t('cart.summary.ordersRemainingSingular')
                : t('cart.summary.ordersRemaining').replace('{count}', String(deliveryFeeDiscount.ordersRemaining))}
            </span>
          </div>
        )}

        <div className={styles.line}>
          <span className={styles.lineLabel}>
            <Shield className={styles.lineIcon} />
            {t('cart.summary.platformFee')}
          </span>
          <span className={styles.lineValue}>CAD ${platformFee.toFixed(2)}</span>
        </div>

        {/* GST - only show if > 0 */}
        {gst > 0 && (
          <div className={styles.line}>
            <span className={styles.lineLabel}>
              <Receipt className={styles.lineIcon} />
              {t('cart.summary.gst')}
            </span>
            <span className={styles.lineValue}>CAD ${gst.toFixed(2)}</span>
          </div>
        )}

        {/* PST - only show if > 0 */}
        {pst > 0 && (
          <div className={styles.line}>
            <span className={styles.lineLabel}>
              <Receipt className={styles.lineIcon} />
              {t('cart.summary.pst')}
            </span>
            <span className={styles.lineValue}>CAD ${pst.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className={styles.divider} />

      {/* Total */}
      <div className={styles.totalLine}>
        <span className={styles.totalLabel}>{t('cart.summary.total')}</span>
        <span className={styles.totalValue}>CAD ${total.toFixed(2)}</span>
      </div>

      {/* Checkout Button */}
      <button
        onClick={onCheckout}
        disabled={isProcessing || itemCount === 0}
        className={styles.checkoutButton}
      >
        {isProcessing ? t('cart.summary.processing') : t('cart.summary.proceedToCheckout')}
      </button>

      {/* Login Hint - shown when user is not logged in */}
      {!isLoggedIn && (
        <div className={styles.loginHint}>
          <LogIn className={styles.loginHintIcon} />
          <span>{t('cart.summary.loginRequired')}</span>
        </div>
      )}

      {/* Trust Badge */}
      <p className={styles.trustBadge}>
        {t('cart.summary.secureCheckout')}
      </p>
    </div>
  );
};
