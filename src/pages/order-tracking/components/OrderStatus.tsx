import type * as React from 'react';

import { Clock } from 'lucide-react';
import { Order } from '../../../types/order';
import { useLanguage } from '../../../context/LanguageContext';
import styles from './OrderStatus.module.css';

interface OrderStatusProps {
  order: Order;
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'processing': return styles.processing;
    case 'confirmed': return styles.confirmed;
    case 'preparing': return styles.preparing;
    case 'ready': return styles.ready;
    case 'out_for_delivery': return styles.outForDelivery;
    case 'delivered': return styles.delivered;
    case 'cancelled': return styles.cancelled;
    default: return styles.pending;
  }
};

export const OrderStatus: React.FC<OrderStatusProps> = ({ order }) => {
  const { t, locale } = useLanguage();

  const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      'pending': t('order.status.pending'),
      'processing': t('order.status.processing'),
      'confirmed': t('order.status.confirmed'),
      'preparing': t('order.status.preparing'),
      'ready': t('order.status.ready'),
      'out_for_delivery': t('order.status.outForDelivery'),
      'delivered': t('order.status.delivered'),
      'cancelled': t('order.status.cancelled')
    };
    return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatEstimatedDelivery = (date: Date): string => {
    const dateLocale = locale === 'es' ? 'es-ES' : 'en-US';
    return date.toLocaleString(dateLocale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          {t('order.estimatedDelivery')}: {formatEstimatedDelivery(order.estimatedDeliveryTime)}
        </p>
      )}
    </div>
  );
};
