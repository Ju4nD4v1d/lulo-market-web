import type * as React from 'react';

import { List, AlertCircle } from 'lucide-react';
import { COMMON_ALLERGENS } from '../../../constants/allergens';
import styles from './ProductIngredients.module.css';

interface ProductIngredientsProps {
  main?: string[];
  contains?: string[];
  t: (key: string) => string;
}

export const ProductIngredients: React.FC<ProductIngredientsProps> = ({
  main,
  contains,
  t,
}) => {
  const hasIngredients = main && main.length > 0;
  const hasContains = contains && contains.length > 0;

  // Translate allergen IDs to localized labels
  const getTranslatedAllergens = (allergenIds: string[]): string => {
    return allergenIds
      .map(id => {
        const allergen = COMMON_ALLERGENS.find(a => a.id === id);
        return allergen ? t(allergen.translationKey) : id;
      })
      .join(', ');
  };

  if (!hasIngredients && !hasContains) return null;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        <List className={styles.titleIcon} />
        {t('productDetails.ingredients')}
      </h2>

      {hasIngredients && (
        <ul className={styles.ingredientsList}>
          {main.map((ingredient, index) => (
            <li key={index} className={styles.ingredientItem}>
              {ingredient}
            </li>
          ))}
        </ul>
      )}

      {hasContains && (
        <div className={styles.containsSection}>
          <AlertCircle className={styles.warningIcon} />
          <span className={styles.containsLabel}>
            {t('productDetails.contains')}:
          </span>
          <span className={styles.containsValue}>
            {getTranslatedAllergens(contains)}
          </span>
        </div>
      )}
    </div>
  );
};
