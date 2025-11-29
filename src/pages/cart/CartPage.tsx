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
const DELIVERY_FEE = 3.0;
const PLATFORM_FEE = 2.0;
const TAX_RATE = 0.12; // 12% HST

export const CartPage: React.FC = () => {
  const { t } = useLanguage();
  const { cart, updateQuantity, removeFromCart } = useCart();
  const { currentUser } = useAuth();

  // Calculate totals
  const calculations = useMemo(() => {
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.priceAtTime * item.quantity,
      0
    );
    const tax = subtotal * TAX_RATE;
    const total = subtotal + DELIVERY_FEE + PLATFORM_FEE + tax;

    return {
      subtotal,
      deliveryFee: DELIVERY_FEE,
      platformFee: PLATFORM_FEE,
      tax,
      total,
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    };
  }, [cart.items]);

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
