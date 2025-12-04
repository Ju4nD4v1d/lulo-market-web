import type * as React from 'react';

import { Clock } from 'lucide-react';
import { Order } from '../../../types/order';
import { useLanguage } from '../../../context/LanguageContext';
import { formatTime12Hour } from '../../../utils/scheduleUtils';
import styles from './OrderStatus.module.css';

interface OrderStatusProps {
  order: Order;
}

/**
 * Get CSS class for status badge color
 * Handles both current and legacy status values for backward compatibility
 */
const getStatusColor = (status: string): string => {
  switch (status) {
    // Pending states
    case 'pending':
    case 'pending_payment': // Legacy
      return styles.pending;
    // Processing state
    case 'processing':
      return styles.processing;
    // Confirmed/paid states
    case 'confirmed':
      return styles.confirmed;
    // Fulfillment states
    case 'preparing':
      return styles.preparing;
    case 'ready':
      return styles.ready;
    case 'out_for_delivery':
      return styles.outForDelivery;
    case 'delivered':
      return styles.delivered;
    // Failed states
    case 'failed':
    case 'payment_failed': // Legacy
      return styles.paymentFailed;
    // Cancelled states
    case 'cancelled':
    case 'canceled': // Backend may use US spelling
      return styles.cancelled;
    default:
      return styles.pending;
  }
};

export const OrderStatus: React.FC<OrderStatusProps> = ({ order }) => {
  const { t, locale } = useLanguage();

  /**
   * Get display text for order status
   * Handles both current and legacy status values for backward compatibility
   */
  const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      // Pending states
      'pending': t('order.status.pending'),
      'pending_payment': t('order.status.pending'), // Legacy - map to pending
      // Processing state
      'processing': t('order.status.processing'),
      // Confirmed state
      'confirmed': t('order.status.confirmed'),
      // Fulfillment states
      'preparing': t('order.status.preparing'),
      'ready': t('order.status.ready'),
      'out_for_delivery': t('order.status.outForDelivery'),
      'delivered': t('order.status.delivered'),
      // Failed states
      'failed': t('order.status.paymentFailed'),
      'payment_failed': t('order.status.paymentFailed'), // Legacy
      // Cancelled states
      'cancelled': t('order.status.cancelled'),
      'canceled': t('order.status.cancelled'), // Backend may use US spelling
    };
    return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
  };

  /**
   * Format the estimated delivery date (just the date, not time)
   */
  const formatDeliveryDate = (date: Date): string => {
    const dateLocale = locale === 'es' ? 'es-ES' : 'en-US';
    return date.toLocaleDateString(dateLocale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  /**
   * Format the delivery time window as a human-readable string
   */
  const formatDeliveryTimeWindow = (): string => {
    if (!order.deliveryTimeWindow) {
      return '';
    }

    const openTime = formatTime12Hour(order.deliveryTimeWindow.open);
    const closeTime = formatTime12Hour(order.deliveryTimeWindow.close);

    if (locale === 'es') {
      return `entre las ${openTime} y las ${closeTime}`;
    }
    return `between ${openTime} and ${closeTime}`;
  };

  /**
   * Get the full estimated delivery text
   */
  const getEstimatedDeliveryText = (): string => {
    if (!order.estimatedDeliveryTime) return '';

    const dateText = formatDeliveryDate(order.estimatedDeliveryTime);
    const timeWindowText = formatDeliveryTimeWindow();

    if (timeWindowText) {
      return `${dateText}, ${timeWindowText}`;
    }

    return dateText;
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        <Clock className={styles.icon} />
        {t('order.statusTitle')}
      </h2>
      <div className={`${styles.statusBadge} ${getStatusColor(order.status)}`}>
        {getStatusText(order.status)}
      </div>
      {order.estimatedDeliveryTime && (
        <p className={styles.estimatedTime}>
          {t('order.estimatedDelivery')}: {getEstimatedDeliveryText()}
        </p>
      )}
    </div>
  );
};
