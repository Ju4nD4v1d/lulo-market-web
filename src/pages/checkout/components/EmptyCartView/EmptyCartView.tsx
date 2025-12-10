/**
 * EmptyCartView - Displays when user reaches checkout with empty cart
 *
 * Shows a friendly message and provides a button to return to shopping.
 * This can happen if:
 * - User manually clears cart during checkout
 * - Session expires and cart is lost
 * - Direct navigation to checkout URL
 */

import type * as React from 'react';
import styles from './EmptyCartView.module.css';

interface EmptyCartViewProps {
  onBack: () => void;
  t: (key: string) => string;
}

export const EmptyCartView: React.FC<EmptyCartViewProps> = ({ onBack, t }) => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        {t('cart.empty.luloCartEmpty')}
      </h2>
      <p className={styles.message}>
        {t('cart.empty.discoverProducts')}
      </p>
      <button
        onClick={onBack}
        className={styles.button}
        type="button"
      >
        {t('cart.empty.continueShopping')}
      </button>
    </div>
  );
};
