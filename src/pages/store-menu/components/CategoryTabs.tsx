import type * as React from 'react';

import { Category } from '../types';
import styles from './CategoryTabs.module.css';

interface CategoryTabsProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`${styles.tab} ${
              activeCategory === category.id ? styles.active : styles.inactive
            }`}
            aria-label={`View ${category.name}`}
          >
            <span>{category.icon}</span>
            <span className={styles.tabText}>{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
