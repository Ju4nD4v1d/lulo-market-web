import type * as React from 'react';

import { MapPin } from 'lucide-react';
import { Order } from '../../../types/order';
import styles from './DeliveryInfo.module.css';

interface DeliveryInfoProps {
  order: Order;
  t: (key: string) => string;
}

export const DeliveryInfo: React.FC<DeliveryInfoProps> = ({ order, t }) => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        <MapPin className={styles.icon} />
        {order.isDelivery ? t('order.deliveryAddress') : t('order.pickupLocation')}
      </h2>
      <div className={styles.address}>
        <p>{order.deliveryAddress.street}</p>
        <p>{order.deliveryAddress.city}, {order.deliveryAddress.province}</p>
        <p>{order.deliveryAddress.postalCode}</p>
        {order.deliveryAddress.instructions && (
          <p className={styles.instructions}>{t('order.instructions')}: {order.deliveryAddress.instructions}</p>
        )}
      </div>
    </div>
  );
};
