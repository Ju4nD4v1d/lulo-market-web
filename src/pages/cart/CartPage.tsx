import type * as React from 'react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { CartHeader } from './components/CartHeader';
import { CartEmptyState } from './components/CartEmptyState';
import { CartItemList } from './components/CartItemList';
import { CartSummary } from './components/CartSummary';
import { DeliveryInfoBanner } from './components/DeliveryInfoBanner';
import styles from './CartPage.module.css';

// Note: Platform fee is fetched from Firestore config (default $0.99)
// Note: Delivery fee is calculated dynamically at checkout based on distance
// Note: Tax rate (12% HST) is applied in CartContext

export const CartPage: React.FC = () => {
  const { t } = useLanguage();
  const { cart, updateQuantity, removeFromCart, deliveryFeeOverride } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Calculate totals using cart.summary which has dynamic platform fee from Firestore
  // Delivery fee is null until calculated at checkout (based on distance)
  const calculations = useMemo(() => {
    // Use cart.summary values which already include dynamic platform fee
    const subtotal = cart.summary.subtotal;
    const gst = cart.summary.gst;
    const pst = cart.summary.pst;
    const tax = cart.summary.tax; // Total tax (gst + pst)
    const platformFee = cart.summary.platformFee;

    // When delivery fee is not yet calculated, show estimated total without delivery
    const deliveryFeeValue = deliveryFeeOverride ?? 0;
    const total = subtotal + deliveryFeeValue + platformFee + tax;

    return {
      subtotal,
      // Pass null to show "Calculated at checkout", or the actual fee if calculated
      deliveryFee: deliveryFeeOverride,
      platformFee,
      gst,
      pst,
      total,
      itemCount: cart.summary.itemCount,
    };
  }, [cart.summary, deliveryFeeOverride]);

  const handleQuantityChange = (itemId: string, quantity: number) => {
    updateQuantity(itemId, quantity);
  };

  const handleRemove = (itemId: string) => {
    removeFromCart(itemId);
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const handleViewStore = () => {
    // Use storeSlug if available, fallback to storeId for backward compatibility
    const storeIdentifier = cart.storeSlug || cart.storeId;
    if (storeIdentifier) {
      navigate(`/store/${storeIdentifier}`);
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

              {/* Delivery Info Banner */}
              {cart.storeId && <DeliveryInfoBanner storeId={cart.storeId} />}

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
                gst={calculations.gst}
                pst={calculations.pst}
                total={calculations.total}
                itemCount={calculations.itemCount}
                onCheckout={handleCheckout}
                isLoggedIn={!!currentUser}
                deliveryFeeDiscount={cart.summary.deliveryFeeDiscount}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
