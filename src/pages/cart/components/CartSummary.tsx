import type * as React from 'react';
import { ShoppingBag, Truck, Receipt, Shield } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import styles from './CartSummary.module.css';

interface CartSummaryProps {
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  tax: number;
  total: number;
  itemCount: number;
  onCheckout: () => void;
  isProcessing?: boolean;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  subtotal,
  deliveryFee,
  platformFee,
  tax,
  total,
  itemCount,
  onCheckout,
  isProcessing = false,
}) => {
  const { t } = useLanguage();

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t('cart.summary.orderSummary')}</h2>

      {/* Summary Lines */}
      <div className={styles.lines}>
        <div className={styles.line}>
          <span className={styles.lineLabel}>
            <ShoppingBag className={styles.lineIcon} />
            {t('cart.summary.subtotal')} ({itemCount} {itemCount === 1 ? t('cart.summary.item') : t('cart.summary.items')})
          </span>
          <span className={styles.lineValue}>CAD ${subtotal.toFixed(2)}</span>
        </div>

        <div className={styles.line}>
          <span className={styles.lineLabel}>
            <Truck className={styles.lineIcon} />
            {t('cart.summary.delivery')}
          </span>
          <span className={styles.lineValue}>CAD ${deliveryFee.toFixed(2)}</span>
        </div>

        <div className={styles.line}>
          <span className={styles.lineLabel}>
            <Shield className={styles.lineIcon} />
            {t('cart.summary.platformFee')}
          </span>
          <span className={styles.lineValue}>CAD ${platformFee.toFixed(2)}</span>
        </div>

        <div className={styles.line}>
          <span className={styles.lineLabel}>
            <Receipt className={styles.lineIcon} />
            {t('cart.summary.tax')}
          </span>
          <span className={styles.lineValue}>CAD ${tax.toFixed(2)}</span>
        </div>
      </div>

      {/* Divider */}
      <div className={styles.divider} />

      {/* Total */}
      <div className={styles.totalLine}>
        <span className={styles.totalLabel}>{t('cart.summary.total')}</span>
        <span className={styles.totalValue}>CAD ${total.toFixed(2)}</span>
      </div>

      {/* Checkout Button */}
      <button
        onClick={onCheckout}
        disabled={isProcessing || itemCount === 0}
        className={styles.checkoutButton}
      >
        {isProcessing ? t('cart.summary.processing') : t('cart.summary.proceedToCheckout')}
      </button>

      {/* Trust Badge */}
      <p className={styles.trustBadge}>
        {t('cart.summary.secureCheckout')}
      </p>
    </div>
  );
};
