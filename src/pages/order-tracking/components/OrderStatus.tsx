import React from 'react';
import { Clock } from 'lucide-react';
import { Order } from '../../../types/order';
import styles from './OrderStatus.module.css';

interface OrderStatusProps {
  order: Order;
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'confirmed': return styles.confirmed;
    case 'preparing': return styles.preparing;
    case 'ready': return styles.ready;
    case 'delivered': return styles.delivered;
    case 'cancelled': return styles.cancelled;
    default: return styles.pending;
  }
};

export const OrderStatus: React.FC<OrderStatusProps> = ({ order }) => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        <Clock className={styles.icon} />
        Order Status
      </h2>
      <div className={`${styles.statusBadge} ${getStatusColor(order.status)}`}>
        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
      </div>
      {order.estimatedDeliveryTime && (
        <p className={styles.estimatedTime}>
          Estimated delivery: {order.estimatedDeliveryTime.toLocaleString()}
        </p>
      )}
    </div>
  );
};
