import type * as React from 'react';
import { useMemo } from 'react';
import { Store } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { CartHeader } from './components/CartHeader';
import { CartEmptyState } from './components/CartEmptyState';
import { CartItemList } from './components/CartItemList';
import { CartSummary } from './components/CartSummary';
import styles from './CartPage.module.css';

// Business constants
const PLATFORM_FEE = 2.0;
const TAX_RATE = 0.12; // 12% HST
// Note: Delivery fee is calculated dynamically at checkout based on distance

export const CartPage: React.FC = () => {
  const { t } = useLanguage();
  const { cart, updateQuantity, removeFromCart, deliveryFeeOverride } = useCart();
  const { currentUser } = useAuth();

  // Calculate totals
  // Delivery fee is null until calculated at checkout (based on distance)
  const calculations = useMemo(() => {
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.priceAtTime * item.quantity,
      0
    );
    const tax = subtotal * TAX_RATE;
    // When delivery fee is not yet calculated, show estimated total without delivery
    const deliveryFeeValue = deliveryFeeOverride ?? 0;
    const total = subtotal + deliveryFeeValue + PLATFORM_FEE + tax;

    return {
      subtotal,
      // Pass null to show "Calculated at checkout", or the actual fee if calculated
      deliveryFee: deliveryFeeOverride,
      platformFee: PLATFORM_FEE,
      tax,
      total,
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    };
  }, [cart.items, deliveryFeeOverride]);

  const handleQuantityChange = (itemId: string, quantity: number) => {
    updateQuantity(itemId, quantity);
  };

  const handleRemove = (itemId: string) => {
    removeFromCart(itemId);
  };

  const handleCheckout = () => {
    window.location.hash = '#checkout';
  };

  const handleViewStore = () => {
    if (cart.storeId) {
      window.location.hash = `#store/${cart.storeId}`;
    }
  };

  // Show empty state if no items
  if (cart.items.length === 0) {
    return <CartEmptyState />;
  }

  return (
    <div className={styles.container}>
      <CartHeader itemCount={calculations.itemCount} />

      <main className={styles.main}>
        <div className={styles.content}>
          {/* Store Info */}
          {cart.storeName && (
            <div className={styles.storeInfo}>
              <div className={styles.storeDetails}>
                <div className={styles.storeIconWrapper}>
                  {cart.storeImage ? (
                    <img
                      src={cart.storeImage}
                      alt={cart.storeName}
                      className={styles.storeImage}
                    />
                  ) : (
                    <Store className={styles.storeIcon} />
                  )}
                </div>
                <div>
                  <p className={styles.storeLabel}>{t('cart.orderingFrom')}</p>
                  <h2 className={styles.storeName}>{cart.storeName}</h2>
                </div>
              </div>
              <button onClick={handleViewStore} className={styles.viewStoreButton}>
                {t('cart.viewStore')}
              </button>
            </div>
          )}

          {/* Two Column Layout on Desktop */}
          <div className={styles.layout}>
            {/* Items Column */}
            <div className={styles.itemsColumn}>
              <h2 className={styles.sectionTitle}>
                {t('cart.yourItems')} ({calculations.itemCount})
              </h2>
              <CartItemList
                items={cart.items}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemove}
              />
            </div>

            {/* Summary Column */}
            <div className={styles.summaryColumn}>
              <CartSummary
                subtotal={calculations.subtotal}
                deliveryFee={calculations.deliveryFee}
                platformFee={calculations.platformFee}
                tax={calculations.tax}
                total={calculations.total}
                itemCount={calculations.itemCount}
                onCheckout={handleCheckout}
                isLoggedIn={!!currentUser}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
