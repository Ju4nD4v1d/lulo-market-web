import type * as React from 'react';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import styles from './CartHeader.module.css';

interface CartHeaderProps {
  itemCount: number;
  onBack?: () => void;
}

export const CartHeader: React.FC<CartHeaderProps> = ({ itemCount, onBack }) => {
  const { t } = useLanguage();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <header className={styles.header}>
      <button
        onClick={handleBack}
        className={styles.backButton}
        aria-label={t('cart.backToShopping')}
      >
        <ArrowLeft className={styles.backIcon} />
      </button>

      <div className={styles.titleSection}>
        <div className={styles.iconWrapper}>
          <ShoppingCart className={styles.cartIcon} />
        </div>
        <div>
          <h1 className={styles.title}>
            {t('cart.title')}
          </h1>
          <p className={styles.subtitle}>
            {itemCount} {itemCount === 1 ? t('cart.item') : t('cart.items')}
          </p>
        </div>
      </div>

      {/* Spacer for alignment */}
      <div className={styles.spacer} />
    </header>
  );
};
