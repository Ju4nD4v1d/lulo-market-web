import type * as React from 'react';

import styles from './ProductDescription.module.css';

interface ProductDescriptionProps {
  description: string;
  t: (key: string) => string;
}

export const ProductDescription: React.FC<ProductDescriptionProps> = ({
  description,
  t,
}) => {
  if (!description) return null;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t('productDetails.description')}</h2>
      <p className={styles.text}>{description}</p>
    </div>
  );
};
