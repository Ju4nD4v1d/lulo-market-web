import type * as React from 'react';

import styles from './ProductImage.module.css';

interface ProductImageProps {
  imageUrl: string | null;
  productName: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  imageUrl,
  productName,
}) => {
  return (
    <div className={styles.container}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={productName}
          className={styles.image}
          loading="eager"
        />
      ) : (
        <div className={styles.placeholder}>
          <span className={styles.placeholderIcon}>📦</span>
        </div>
      )}
    </div>
  );
};
