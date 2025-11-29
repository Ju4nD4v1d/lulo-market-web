import type * as React from 'react';

import { Clock, Users, AlertTriangle } from 'lucide-react';
import styles from './ProductExtraDetails.module.css';

interface ProductExtraDetailsProps {
  preparationTime?: string;
  servingSize?: string;
  allergens?: string[];
  t: (key: string) => string;
}

export const ProductExtraDetails: React.FC<ProductExtraDetailsProps> = ({
  preparationTime,
  servingSize,
  allergens,
  t,
}) => {
  const hasDetails = preparationTime || servingSize || (allergens && allergens.length > 0);

  if (!hasDetails) return null;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t('productDetails.details')}</h2>

      <div className={styles.detailsList}>
        {preparationTime && (
          <div className={styles.detailItem}>
            <Clock className={styles.icon} />
            <div className={styles.detailContent}>
              <span className={styles.detailLabel}>{t('productDetails.prepTime')}</span>
              <span className={styles.detailValue}>{preparationTime}</span>
            </div>
          </div>
        )}

        {servingSize && (
          <div className={styles.detailItem}>
            <Users className={styles.icon} />
            <div className={styles.detailContent}>
              <span className={styles.detailLabel}>{t('productDetails.servingSize')}</span>
              <span className={styles.detailValue}>{servingSize}</span>
            </div>
          </div>
        )}

        {allergens && allergens.length > 0 && (
          <div className={styles.detailItem}>
            <AlertTriangle className={styles.iconWarning} />
            <div className={styles.detailContent}>
              <span className={styles.detailLabel}>{t('productDetails.allergens')}</span>
              <span className={styles.detailValue}>{allergens.join(', ')}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
