import type * as React from 'react';

import { CreditCard } from 'lucide-react';
import { Order } from '../../../types/order';
import { formatPrice } from '../../../utils/formatters';
import { useLanguage } from '../../../context/LanguageContext';
import styles from './OrderSummary.module.css';

interface OrderSummaryProps {
  order: Order;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ order }) => {
  const { t } = useLanguage();

  // Calculate platform fee - use stored value, or derive from totals difference
  const platformFee = order.summary.platformFee ??
    (order.summary.finalTotal ? order.summary.finalTotal - order.summary.total : 0);

  // Use finalTotal if available, otherwise calculate it
  const finalTotal = order.summary.finalTotal ?? (order.summary.total + platformFee);

  // Check for delivery fee discount - be explicit to handle Firestore data
  const deliveryFeeDiscount = order.summary.deliveryFeeDiscount;
  const hasDiscount = deliveryFeeDiscount &&
    deliveryFeeDiscount.isEligible === true &&
    typeof deliveryFeeDiscount.discountAmount === 'number' &&
    deliveryFeeDiscount.discountAmount > 0;

  // Compute discount badge text (always show generic text when discountPercentage is missing)
  const discountBadgeText = hasDiscount
    ? deliveryFeeDiscount.discountPercentage
      ? `${Math.round(deliveryFeeDiscount.discountPercentage * 100)}% ${t('cart.summary.discountLabel')}`
      : t('cart.summary.discountLabel')
    : '';

  // Get GST/PST values - ensure they're numbers
  const gstValue = typeof order.summary.gst === 'number' ? order.summary.gst : 0;
  const pstValue = typeof order.summary.pst === 'number' ? order.summary.pst : 0;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        <CreditCard className={styles.icon} />
        {t('order.summary')}
      </h2>
      <div className={styles.summary}>
        <div className={styles.row}>
          <span className={styles.label}>{t('order.subtotal')}</span>
          <span className={styles.value}>{formatPrice(order.summary.subtotal)}</span>
        </div>
        {gstValue > 0 && (
          <div className={styles.row}>
            <span className={styles.label}>{t('cart.summary.gst')}</span>
            <span className={styles.value}>{formatPrice(gstValue)}</span>
          </div>
        )}
        {pstValue > 0 && (
          <div className={styles.row}>
            <span className={styles.label}>{t('cart.summary.pst')}</span>
            <span className={styles.value}>{formatPrice(pstValue)}</span>
          </div>
        )}
        <div className={styles.row}>
          <span className={styles.label}>
            {t('order.deliveryFee')}
            {hasDiscount && (
              <span className={styles.discountBadge}>{discountBadgeText}</span>
            )}
          </span>
          <span className={styles.value}>
            {hasDiscount ? (
              <span className={styles.discountedPrice}>
                <span className={styles.originalPrice}>
                  {formatPrice(deliveryFeeDiscount.originalFee)}
                </span>
                <span className={styles.finalPrice}>
                  {formatPrice(deliveryFeeDiscount.discountedFee)}
                </span>
              </span>
            ) : (
              formatPrice(order.summary.deliveryFee)
            )}
          </span>
        </div>
        {/* Show savings note if discount was applied */}
        {hasDiscount && (
          <div className={styles.savingsNote}>
            {t('order.youSaved')} {formatPrice(deliveryFeeDiscount.discountAmount)}
          </div>
        )}
        {/* Platform fee - always show */}
        <div className={styles.row}>
          <span className={styles.label}>{t('order.platformFee')}</span>
          <span className={styles.value}>{formatPrice(platformFee)}</span>
        </div>
        <div className={styles.divider}></div>
        <div className={`${styles.row} ${styles.total}`}>
          <span className={styles.totalLabel}>{t('order.total')}</span>
          <span className={styles.totalValue}>{formatPrice(finalTotal)}</span>
        </div>
      </div>
    </div>
  );
};
