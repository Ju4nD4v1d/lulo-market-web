import type * as React from 'react';
import { useState } from 'react';
import { Plus, Minus, Trash2, Package } from 'lucide-react';
import { CartItem } from '../../../types/cart';
import styles from './CartItemCard.module.css';

interface CartItemCardProps {
  item: CartItem;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  disabled?: boolean;
}

export const CartItemCard: React.FC<CartItemCardProps> = ({
  item,
  onQuantityChange,
  onRemove,
  disabled = false,
}) => {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async () => {
    setIsRemoving(true);
    // Small delay for animation
    await new Promise(resolve => setTimeout(resolve, 250));
    onRemove(item.id);
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      onQuantityChange(item.id, item.quantity - 1);
    }
  };

  const handleIncrement = () => {
    onQuantityChange(item.id, item.quantity + 1);
  };

  const itemTotal = (item.priceAtTime * item.quantity).toFixed(2);
  const hasImage = item.product.images && item.product.images.length > 0;

  return (
    <div
      className={`${styles.card} ${isRemoving ? styles.removing : ''}`}
      role="listitem"
    >
      {/* Product Image */}
      <div className={styles.imageWrapper}>
        {hasImage ? (
          <img
            src={item.product.images![0]}
            alt={item.product.name}
            className={styles.image}
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <Package className={styles.placeholderIcon} />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className={styles.info}>
        <div className={styles.header}>
          <h3 className={styles.name}>{item.product.name}</h3>
          <button
            onClick={handleRemove}
            disabled={isRemoving || disabled}
            className={styles.removeButton}
            aria-label="Remove item"
          >
            <Trash2 className={styles.removeIcon} />
          </button>
        </div>

        <div className={styles.priceRow}>
          <span className={styles.price}>CAD ${item.priceAtTime.toFixed(2)}</span>
          {item.priceAtTime !== item.product.price && (
            <span className={styles.originalPrice}>
              CAD ${item.product.price.toFixed(2)}
            </span>
          )}
        </div>

        {item.product.description && (
          <p className={styles.description}>{item.product.description}</p>
        )}

        {/* Quantity and Total */}
        <div className={styles.footer}>
          <div className={styles.quantityControls}>
            <button
              onClick={handleDecrement}
              disabled={item.quantity <= 1 || disabled || isRemoving}
              className={styles.quantityButton}
              aria-label="Decrease quantity"
            >
              <Minus className={styles.quantityIcon} />
            </button>
            <span className={styles.quantity}>{item.quantity}</span>
            <button
              onClick={handleIncrement}
              disabled={disabled || isRemoving}
              className={styles.quantityButton}
              aria-label="Increase quantity"
            >
              <Plus className={styles.quantityIcon} />
            </button>
          </div>

          <div className={styles.totalSection}>
            <span className={styles.totalLabel}>Total:</span>
            <span className={styles.totalValue}>CAD ${itemTotal}</span>
          </div>
        </div>

        {/* Special Instructions */}
        {item.specialInstructions && (
          <div className={styles.instructions}>
            <p className={styles.instructionsText}>{item.specialInstructions}</p>
          </div>
        )}
      </div>
    </div>
  );
};
