import type * as React from 'react';

import styles from './ProductNutrition.module.css';

interface NutritionInfo {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

interface ProductNutritionProps {
  nutritionInfo?: NutritionInfo;
  t: (key: string) => string;
}

export const ProductNutrition: React.FC<ProductNutritionProps> = ({
  nutritionInfo,
  t,
}) => {
  if (!nutritionInfo) return null;

  const { calories, protein, carbs, fat } = nutritionInfo;
  const hasNutritionData = calories || protein || carbs || fat;

  if (!hasNutritionData) return null;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t('productDetails.nutrition')}</h2>

      <div className={styles.grid}>
        {calories !== undefined && (
          <div className={styles.item}>
            <span className={styles.value}>{calories}</span>
            <span className={styles.label}>{t('productDetails.calories')}</span>
          </div>
        )}

        {protein !== undefined && (
          <div className={styles.item}>
            <span className={styles.value}>{protein}g</span>
            <span className={styles.label}>{t('productDetails.protein')}</span>
          </div>
        )}

        {carbs !== undefined && (
          <div className={styles.item}>
            <span className={styles.value}>{carbs}g</span>
            <span className={styles.label}>{t('productDetails.carbs')}</span>
          </div>
        )}

        {fat !== undefined && (
          <div className={styles.item}>
            <span className={styles.value}>{fat}g</span>
            <span className={styles.label}>{t('productDetails.fat')}</span>
          </div>
        )}
      </div>
    </div>
  );
};
