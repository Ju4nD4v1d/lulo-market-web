import type * as React from 'react';
import { CartItem } from '../../../types/cart';
import { CartItemCard } from './CartItemCard';
import styles from './CartItemList.module.css';

interface CartItemListProps {
  items: CartItem[];
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  disabled?: boolean;
}

export const CartItemList: React.FC<CartItemListProps> = ({
  items,
  onQuantityChange,
  onRemove,
  disabled = false,
}) => {
  return (
    <div className={styles.list} role="list" aria-label="Cart items">
      {items.map((item) => (
        <CartItemCard
          key={item.id}
          item={item}
          onQuantityChange={onQuantityChange}
          onRemove={onRemove}
          disabled={disabled}
        />
      ))}
    </div>
  );
};
