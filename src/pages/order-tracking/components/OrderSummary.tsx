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
        {(order.summary.gst ?? 0) > 0 && (
          <div className={styles.row}>
            <span className={styles.label}>{t('cart.summary.gst')}</span>
            <span className={styles.value}>{formatPrice(order.summary.gst)}</span>
          </div>
        )}
        {(order.summary.pst ?? 0) > 0 && (
          <div className={styles.row}>
            <span className={styles.label}>{t('cart.summary.pst')}</span>
            <span className={styles.value}>{formatPrice(order.summary.pst)}</span>
          </div>
        )}
        <div className={styles.row}>
          <span className={styles.label}>{t('order.deliveryFee')}</span>
          <span className={styles.value}>{formatPrice(order.summary.deliveryFee)}</span>
        </div>
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
