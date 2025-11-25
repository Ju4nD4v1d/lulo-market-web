import type * as React from 'react';

import { ShoppingCart } from 'lucide-react';
import styles from './FloatingCartButton.module.css';

interface FloatingCartButtonProps {
  itemCount: number;
  total: number;
  onClick?: () => void;
}

export const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({
  itemCount,
  total,
  onClick,
}) => {
  if (itemCount === 0) return null;

  return (
    <div className={styles.container}>
      <button
        className={styles.button}
        onClick={onClick}
        aria-label={`View cart with ${itemCount} items`}
      >
        <div className={styles.leftSection}>
          <ShoppingCart className={styles.icon} />
          <span>{itemCount} items</span>
        </div>
        <span>${total.toFixed(2)}</span>
      </button>
    </div>
  );
};
