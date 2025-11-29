import type * as React from 'react';

import { Star } from 'lucide-react';
import { getCategoryLabel } from '../../../constants/productCategories';
import { AddToCartButton } from '../../../components/AddToCartButton';
import { Product } from '../../../types/product';
import styles from './ProductInfo.module.css';

interface ProductInfoProps {
  storeName: string;
  productName: string;
  price: number;
  category: string;
  stock: number;
  status: string;
  averageRating?: number;
  reviewCount?: number;
  t: (key: string) => string;
  // Props for add-to-cart functionality
  product?: Product;
  storeId?: string;
  storeImage?: string;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({
  storeName,
  productName,
  price,
  category,
  stock,
  status,
  averageRating,
  reviewCount,
  t,
  product,
  storeId,
  storeImage,
}) => {
  const getStockStatus = () => {
    if (status === 'outOfStock' || stock === 0) {
      return { label: t('productDetails.outOfStock'), className: styles.outOfStock };
    }
    if (stock < 5) {
      return { label: t('productDetails.lowStock'), className: styles.lowStock };
    }
    return { label: t('productDetails.inStock'), className: styles.inStock };
  };

  const stockStatus = getStockStatus();

  return (
    <div className={styles.container}>
      <p className={styles.storeName}>{storeName}</p>

      <div className={styles.header}>
        <h1 className={styles.productName}>{productName}</h1>
        <span className={styles.price}>${price.toFixed(2)}</span>
      </div>

      <div className={styles.meta}>
        {category && (
          <span className={styles.category}>{getCategoryLabel(category, t)}</span>
        )}
        <span className={`${styles.stockBadge} ${stockStatus.className}`}>
          {stockStatus.label}
        </span>
      </div>

      {averageRating !== undefined && averageRating > 0 && (
        <div className={styles.rating}>
          <Star className={styles.starIcon} />
          <span className={styles.ratingValue}>{averageRating.toFixed(1)}</span>
          {reviewCount !== undefined && reviewCount > 0 && (
            <span className={styles.reviewCount}>
              ({reviewCount} {t('productDetails.reviews')})
            </span>
          )}
        </div>
      )}

      {/* Add to Cart Button */}
      {product && storeId && (
        <div className={styles.addToCartContainer}>
          <AddToCartButton
            product={product}
            storeId={storeId}
            storeName={storeName}
            storeImage={storeImage}
            size="lg"
            variant="primary"
            showQuantityControls={false}
          />
        </div>
      )}
    </div>
  );
};
