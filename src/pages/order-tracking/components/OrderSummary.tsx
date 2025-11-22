import type * as React from 'react';

import { CreditCard } from 'lucide-react';
import { Order } from '../../../types/order';
import { formatPrice } from '../../../utils/formatters';
import styles from './OrderSummary.module.css';

interface OrderSummaryProps {
  order: Order;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ order }) => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        <CreditCard className={styles.icon} />
        Order Summary
      </h2>
      <div className={styles.summary}>
        <div className={styles.row}>
          <span className={styles.label}>Subtotal</span>
          <span className={styles.value}>{formatPrice(order.summary.subtotal)}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Tax</span>
          <span className={styles.value}>{formatPrice(order.summary.tax)}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Delivery Fee</span>
          <span className={styles.value}>{formatPrice(order.summary.deliveryFee)}</span>
        </div>
        {order.summary.platformFee && (
          <div className={styles.row}>
            <span className={styles.label}>Platform Fee</span>
            <span className={styles.value}>{formatPrice(order.summary.platformFee)}</span>
          </div>
        )}
        <div className={styles.divider}></div>
        <div className={`${styles.row} ${styles.total}`}>
          <span className={styles.totalLabel}>Total</span>
          <span className={styles.totalValue}>{formatPrice(order.summary.total)}</span>
        </div>
      </div>
    </div>
  );
};
