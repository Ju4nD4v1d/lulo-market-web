import { useState, useEffect, useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { Product } from '../../../types/product';
import { StoreData } from '../../../types/store';
import { useLanguage } from '../../../context/LanguageContext';
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
  const [products, setProducts] = useState<Array<Product & { storeName: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize store IDs to prevent infinite loop
  const storeIds = useMemo(() => stores.map(s => s.id).join(','), [stores]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productsRef = collection(db, 'products');
        const snapshot = await getDocs(productsRef);

        const productsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];

        // Filter only active products
        const activeProducts = productsData.filter(p => p.status === 'active');

        // Map products with store names
        const productsWithStore = activeProducts
          .map(product => {
            const store = stores.find(s => s.id === product.storeId);
            if (!store) return null;

            return {
              ...product,
              storeName: store.name,
            };
          })
          .filter(Boolean) as Array<Product & { storeName: string }>;

        setProducts(productsWithStore);
        setError(null);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError(t('home.products.error'));
      } finally {
        setLoading(false);
      }
    };

    if (storeIds) {
      fetchProducts();
    }
  }, [storeIds, stores, t]);

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
