import type * as React from 'react';
import { useState, useMemo } from 'react';
import { UtensilsCrossed, Search, X, BookOpen } from 'lucide-react';
import { StoreData } from '../../../types/store';
import { Product } from '../../../types/product';
import { StoreProductCard } from './StoreProductCard';
import { useLanguage } from '../../../context/LanguageContext';
import { PRODUCT_CATEGORIES } from '../../../constants/productCategories';
import styles from './MenuSection.module.css';

interface MenuSectionProps {
  store: StoreData;
  products: Product[];
  loading: boolean;
  searchTerm?: string;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  store,
  products,
  loading,
  searchTerm = '',
}) => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Build categories from PRODUCT_CATEGORIES
  const categories = useMemo(() => [
    { id: 'all', name: t('category.all'), Icon: BookOpen },
    ...PRODUCT_CATEGORIES.map(category => ({
      id: category.id,
      name: t(category.translationKey),
      Icon: category.icon
    }))
  ], [t]);

  // Filter products by category and search term
  const filteredProducts = useMemo(() => {
    // Exclude draft products
    let filtered = products.filter(product => product.status !== 'draft');

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    return filtered;
  }, [products, selectedCategory, searchTerm]);

  const handleClearFilters = () => {
    setSelectedCategory('all');
  };

  return (
    <div className={styles.container} data-menu-section>
      {/* Header */}
      <div className={styles.header}>
        <UtensilsCrossed className={styles.headerIcon} />
        <h2 className={styles.title}>{t('storeDetail.ourMenu')}</h2>
      </div>

      {/* Category Pills */}
      <div className={styles.categoryContainer}>
        <div className={styles.categoryPills}>
          {categories.map((category) => {
            const Icon = category.Icon;
            const isActive = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`${styles.categoryPill} ${
                  isActive ? styles.categoryPillActive : styles.categoryPillDefault
                }`}
              >
                <Icon className={styles.categoryPillIcon} />
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Grid */}
      <div className={styles.productsContainer}>
        {loading ? (
          <div className={styles.productsGrid}>
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className={styles.skeletonCard}>
                <div className={styles.skeletonImage} />
                <div className={styles.skeletonContent}>
                  <div className={styles.skeletonLine} />
                  <div className={`${styles.skeletonLine} ${styles.skeletonLineShort}`} />
                  <div className={`${styles.skeletonLine} ${styles.skeletonLinePrice}`} />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className={styles.productsGrid}>
            {filteredProducts.map((product) => (
              <StoreProductCard
                key={product.id}
                product={product}
                storeId={store.id}
                storeName={store.name}
                storeImage={store.storeImage || store.imageUrl}
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <Search className={styles.emptyStateIcon} />
            <h4 className={styles.emptyStateTitle}>
              {searchTerm || selectedCategory !== 'all'
                ? t('storeDetail.noDishesFound')
                : t('storeDetail.menuComingSoon')}
            </h4>
            <p className={styles.emptyStateText}>
              {searchTerm || selectedCategory !== 'all'
                ? t('storeDetail.adjustSearch')
                : t('storeDetail.checkBackSoon')}
            </p>
            {selectedCategory !== 'all' && (
              <button
                onClick={handleClearFilters}
                className={styles.clearFiltersButton}
              >
                <X className={styles.clearFiltersIcon} />
                <span>{t('storeDetail.clearFilters')}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
