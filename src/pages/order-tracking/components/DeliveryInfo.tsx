import type * as React from 'react';

import { MapPin } from 'lucide-react';
import { Order } from '../../../types/order';
import styles from './DeliveryInfo.module.css';

interface DeliveryInfoProps {
  order: Order;
}

export const DeliveryInfo: React.FC<DeliveryInfoProps> = ({ order }) => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        <MapPin className={styles.icon} />
        {order.isDelivery ? 'Delivery Address' : 'Pickup Location'}
      </h2>
      <div className={styles.address}>
        <p>{order.deliveryAddress.street}</p>
        <p>{order.deliveryAddress.city}, {order.deliveryAddress.province}</p>
        <p>{order.deliveryAddress.postalCode}</p>
        {order.deliveryAddress.instructions && (
          <p className={styles.instructions}>Instructions: {order.deliveryAddress.instructions}</p>
        )}
      </div>
    </div>
  );
};
