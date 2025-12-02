import { Product } from '../../../types';
import { useLanguage } from '../../../context/LanguageContext';
import styles from './HorizontalProductCard.module.css';

interface HorizontalProductCardProps {
  product: Product;
  storeName: string;
  onClick: () => void;
}

export const HorizontalProductCard: React.FC<HorizontalProductCardProps> = ({
  product,
  storeName,
  onClick,
}) => {
  const { t } = useLanguage();

  // Get product image from imageUrl or first image in images array
  const productImage = product.imageUrl || (product.images && product.images.length > 0 ? product.images[0] : null);

  return (
    <div
      className={styles.card}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Product Image */}
      <div className={styles.imageContainer}>
        {productImage ? (
          <img
            src={productImage}
            alt={product.name}
            className={styles.image}
            loading="lazy"
          />
        ) : (
          <div className={styles.placeholder}>
            <span className={styles.placeholderIcon}>📦</span>
          </div>
        )}

        {/* Status Badge */}
        {product.status === 'active' && product.stock !== undefined && product.stock < 5 && product.stock > 0 && (
          <div className={styles.lowStockBadge}>
            {t('product.lowStock')}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className={styles.info}>
        <p className={styles.storeName}>{storeName}</p>
        <h3 className={styles.productName}>{product.name}</h3>

        <div className={styles.footer}>
          <span className={styles.price}>
            ${product.price.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};
