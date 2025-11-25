import { Flame, Snowflake, Cookie, Package2 } from 'lucide-react';

/**
 * Product category enum
 * Defines the available product categories
 */
export enum ProductCategory {
  HOT = 'hot',
  FROZEN = 'frozen',
  BAKED = 'baked',
  OTHER = 'other'
}

/**
 * Product category configuration
 * Maps category IDs to their icons and translation keys
 */
export const PRODUCT_CATEGORIES = [
  {
    id: ProductCategory.HOT,
    translationKey: 'products.category.hot',
    icon: Flame
  },
  {
    id: ProductCategory.FROZEN,
    translationKey: 'products.category.frozen',
    icon: Snowflake
  },
  {
    id: ProductCategory.BAKED,
    translationKey: 'products.category.baked',
    icon: Cookie
  },
  {
    id: ProductCategory.OTHER,
    translationKey: 'products.category.other',
    icon: Package2
  }
] as const;

/**
 * Get translated category label
 * @param categoryId - The category ID
 * @param t - Translation function
 * @returns Translated category label
 */
export const getCategoryLabel = (categoryId: string, t: (key: string) => string): string => {
  const category = PRODUCT_CATEGORIES.find(cat => cat.id === categoryId);
  return category ? t(category.translationKey) : categoryId;
};

/**
 * Get category icon
 * @param categoryId - The category ID
 * @returns Icon component or null
 */
export const getCategoryIcon = (categoryId: string) => {
  const category = PRODUCT_CATEGORIES.find(cat => cat.id === categoryId);
  return category ? category.icon : null;
};
