import type * as React from 'react';

import { Package } from 'lucide-react';
import { Order } from '../../../types/order';
import { formatPrice } from '../../../utils/formatters';
import styles from './OrderItems.module.css';

interface OrderItemsProps {
  order: Order;
}

export const OrderItems: React.FC<OrderItemsProps> = ({ order }) => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        <Package className={styles.icon} />
        Order Items
      </h2>
      <div className={styles.items}>
        {order.items.map((item) => (
          <div key={item.id} className={styles.item}>
            {item.productImage && (
              <img
                src={item.productImage}
                alt={item.productName}
                className={styles.image}
              />
            )}
            <div className={styles.details}>
              <h3 className={styles.name}>{item.productName}</h3>
              <p className={styles.quantity}>Quantity: {item.quantity}</p>
              {item.specialInstructions && (
                <p className={styles.instructions}>Note: {item.specialInstructions}</p>
              )}
            </div>
            <div className={styles.priceContainer}>
              <p className={styles.price}>
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
