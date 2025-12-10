import type * as React from 'react';

import { Star, Clock, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../../../types/product';
import { AddToCartButton } from '../../../components/AddToCartButton';
import { useLanguage } from '../../../context/LanguageContext';
import styles from './StoreProductCard.module.css';

interface StoreProductCardProps {
  product: Product;
  storeId: string;
  storeSlug: string;
  storeName: string;
  storeImage?: string;
}

export const StoreProductCard: React.FC<StoreProductCardProps> = ({
  product,
  storeId,
  storeSlug,
  storeName,
  storeImage,
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Navigate to product detail page when card/image is clicked
  const handleCardClick = () => {
    navigate(`/product/${product.id}/${storeSlug}`);
  };

  // Prevent card navigation when clicking the add button area
  const handleCartAreaClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const formatPrice = (price: number) => `CAD $${price.toFixed(2)}`;

  const isOutOfStock = product.status === 'outOfStock' || product.stock === 0;

  return (
    <div
      className={`${styles.card} ${isOutOfStock ? styles.outOfStock : ''}`}
      onClick={handleCardClick}
    >
      {/* Product Image */}
      <div className={styles.imageContainer}>
        {product.images && product.images.length > 0 ? (
          <img src={product.images[0]} alt={product.name} className={styles.image} />
        ) : (
          <div className={styles.noImage}>
            <Clock className={styles.noImageIcon} />
            <span className={styles.noImageText}>No Image</span>
          </div>
        )}

        {/* Image count indicator dots */}
        {product.images && product.images.length > 1 && (
          <div className={styles.imageIndicators}>
            {product.images.map((_, index) => (
              <span
                key={index}
                className={`${styles.dot} ${index === 0 ? styles.dotActive : ''}`}
              />
            ))}
          </div>
        )}

        {/* Status Badges */}
        {product.status === 'outOfStock' && (
          <div className={styles.statusBadge}>{t('products.status.outOfStock')}</div>
        )}
        {product.status === 'draft' && (
          <div className={styles.draftBadge}>{t('products.status.draft')}</div>
        )}
        {product.isPopular && product.status === 'active' && (
          <div className={styles.popularBadge}>{t('product.popular')}</div>
        )}
      </div>

      {/* Product Info */}
      <div className={styles.content}>
        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.description}>{product.description}</p>

        {/* Metadata Row */}
        <div className={styles.metadata}>
          {/* Rating */}
          {product.averageRating && (
            <div className={styles.metaItem}>
              <Star className={styles.starIcon} />
              <span className={styles.rating}>{product.averageRating.toFixed(1)}</span>
              {product.reviewCount && (
                <span className={styles.reviewCount}>({product.reviewCount})</span>
              )}
            </div>
          )}

          {/* Prep Time */}
          {product.preparationTime && (
            <div className={styles.metaItem}>
              <Clock className={styles.icon} />
              <span className={styles.metaText}>{product.preparationTime}</span>
            </div>
          )}

          {/* Serving Size */}
          {product.servingSize && (
            <div className={`${styles.metaItem} ${styles.hideOnMobile}`}>
              <Users className={styles.icon} />
              <span className={styles.metaText}>{product.servingSize}</span>
            </div>
          )}
        </div>

        {/* Allergens */}
        {product.allergens && product.allergens.length > 0 && (
          <div className={styles.allergens}>
            {product.allergens.slice(0, 2).map((allergen) => (
              <span key={allergen} className={styles.allergenTag}>
                {allergen}
              </span>
            ))}
            {product.allergens.length > 2 && (
              <span className={styles.allergenMore}>+{product.allergens.length - 2}</span>
            )}
          </div>
        )}

        {/* Price and Add to Cart */}
        <div className={styles.footer}>
          <div className={styles.priceSection}>
            <span className={styles.price}>{formatPrice(product.price)}</span>
          </div>

          {!isOutOfStock ? (
            <div className={styles.cartButton} onClick={handleCartAreaClick}>
              <AddToCartButton
                product={product}
                storeId={storeId}
                storeSlug={storeSlug}
                storeName={storeName}
                storeImage={storeImage}
                size="sm"
                className={styles.addButton}
              />
            </div>
          ) : (
            <span className={styles.unavailable}>{t('product.unavailable')}</span>
          )}
        </div>
      </div>
    </div>
  );
};
