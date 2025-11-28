import { useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { Product } from '../../../types';
import { StoreData } from '../../../types';
import { useLanguage } from '../../../context/LanguageContext';
import { useAllActiveProductsQuery } from '../../../hooks/queries/useAllActiveProductsQuery';
import { HorizontalProductCard } from './HorizontalProductCard';
import styles from './HorizontalRow.module.css';

interface HorizontalProductRowProps {
  stores: StoreData[];
  onProductClick: (product: Product, store: StoreData) => void;
  onViewAll?: () => void;
  searchQuery?: string;
}

export const HorizontalProductRow: React.FC<HorizontalProductRowProps> = ({
  stores,
  onProductClick,
  onViewAll,
  searchQuery = '',
}) => {
  const { t } = useLanguage();
  const { products: allProducts, isLoading: loading, error: queryError } = useAllActiveProductsQuery();

  // Map products with store names
  const products = useMemo(() => {
    return allProducts
      .map(product => {
        const store = stores.find(s => s.id === product.storeId);
        if (!store) return null;

        return {
          ...product,
          storeName: store.name,
        };
      })
      .filter(Boolean) as Array<Product & { storeName: string }>;
  }, [allProducts, stores]);

  const error = queryError ? t('home.products.error') : null;

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) {
      return products;
    }

    const query = searchQuery.toLowerCase().trim();
    return products.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query) ||
      product.category?.toLowerCase().includes(query) ||
      product.storeName.toLowerCase().includes(query)
    );
  }, [searchQuery, products]);

  if (loading) {
    return (
      <section className={styles.section}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>{t('home.products.title')}</h2>
            <p className={styles.subtitle}>{t('home.products.loading')}</p>
          </div>
        </div>

        <div className={styles.scrollContainer}>
          <div className={styles.scrollContent}>
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className={styles.skeletonCard} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.section}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>{t('home.products.title')}</h2>
            <p className={styles.subtitle} style={{ color: '#DC2626' }}>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (filteredProducts.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>{t('home.products.title')}</h2>
          <p className={styles.subtitle}>{t('home.products.subtitle')}</p>
        </div>

        {onViewAll && (
          <button
            className={styles.viewAllButton}
            onClick={onViewAll}
            aria-label={t('home.viewAll')}
          >
            <span className={styles.viewAllText}>{t('home.viewAll')}</span>
            <ChevronRight className={styles.chevronIcon} />
          </button>
        )}
      </div>

      {/* Horizontal Scroll Container */}
      <div className={styles.scrollContainer}>
        <div className={styles.scrollContent}>
          {filteredProducts.map((product) => {
            const store = stores.find(s => s.id === product.storeId);
            if (!store) return null;

            return (
              <HorizontalProductCard
                key={product.id}
                product={product}
                storeName={product.storeName}
                onClick={() => onProductClick(product, store)}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};
