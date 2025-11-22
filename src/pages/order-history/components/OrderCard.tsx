import type * as React from 'react';

import { Order } from '../../../types/order';
import { useLanguage } from '../../../context/LanguageContext';
import { getStatusIcon, getStatusColor, getStatusText } from '../utils/orderStatus';
import styles from './OrderCard.module.css';

interface OrderCardProps {
  order: Order;
  onClick: () => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onClick }) => {
  const { t } = useLanguage();

  const formatPrice = (price: number | undefined) => `CAD $${(price || 0).toFixed(2)}`;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          {getStatusIcon(order.status)}
          <div>
            <h3 className={styles.storeName}>{order.storeName}</h3>
            <p className={styles.orderId}>#{order.id.slice(-8).toUpperCase()}</p>
          </div>
        </div>
        <div className={styles.headerRight}>
          <p className={styles.price}>{formatPrice(order.summary.total)}</p>
          <div className={`${styles.statusBadge} ${getStatusColor(order.status)}`}>
            {getStatusText(order.status, t)}
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <span>{formatDate(order.createdAt)}</span>
        <span>
          {order.summary.itemCount} {order.summary.itemCount === 1 ? t('cart.item') : t('cart.items')}
        </span>
      </div>
    </div>
  );
};
