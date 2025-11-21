import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { MenuItem as MenuItemType } from '../types';
import styles from './MenuItem.module.css';

interface MenuItemProps {
  item: MenuItemType;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}

export const MenuItem: React.FC<MenuItemProps> = ({ item, quantity, onAdd, onRemove }) => {
  return (
    <div className={styles.card}>
      {/* Item Image */}
      <div className={styles.imageContainer}>
        <img src={item.image} alt={item.name} className={styles.image} />
        {item.popular && <div className={styles.popularBadge}>Popular</div>}
      </div>

      {/* Item Info */}
      <div className={styles.content}>
        <h3 className={styles.name}>{item.name}</h3>
        <p className={styles.description}>{item.description}</p>

        <div className={styles.footer}>
          <span className={styles.price}>${item.price.toFixed(2)}</span>

          {quantity > 0 ? (
            <div className={styles.quantityControls}>
              <button
                onClick={onRemove}
                className={styles.removeButton}
                aria-label={`Remove ${item.name} from cart`}
              >
                <Minus className={styles.buttonIcon} />
              </button>
              <span className={styles.quantity}>{quantity}</span>
              <button
                onClick={onAdd}
                className={styles.addButton}
                aria-label={`Add ${item.name} to cart`}
              >
                <Plus className={styles.buttonIcon} />
              </button>
            </div>
          ) : (
            <button
              onClick={onAdd}
              disabled
              className={styles.addToCartButton}
              aria-label={`Add ${item.name} to cart (coming soon)`}
            >
              <Plus className={styles.buttonIcon} />
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
