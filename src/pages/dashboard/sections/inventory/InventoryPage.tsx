import { useState, useMemo } from 'react';
import {
  Package,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Search,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';
import { useStore } from '../../../../context/StoreContext';
import { useProductsQuery } from '../../../../hooks/queries/useProductsQuery';
import { useDashboardNavigation } from '../../../../hooks/useDashboardNavigation';
import { Product } from '../../../../types/product';
import styles from './InventoryPage.module.css';

type StockFilter = 'all' | 'low' | 'out' | 'healthy';

export const InventoryPage = () => {
  const { t } = useLanguage();
  const { storeId, store } = useStore();
  const { goToProducts } = useDashboardNavigation();
  const { products, isLoading, error, refetch } = useProductsQuery({ storeId });

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<StockFilter>('all');

  // Get threshold from store settings, default to 10
  const threshold = store?.lowStockThreshold ?? 10;

  // Categorize products by stock level
  const stockStats = useMemo(() => {
    const activeProducts = products.filter(p => p.status === 'active');
    const lowStock = activeProducts.filter(p => p.stock > 0 && p.stock <= threshold);
    const outOfStock = activeProducts.filter(p => p.stock === 0);
    const healthy = activeProducts.filter(p => p.stock > threshold);

    return {
      total: activeProducts.length,
      lowStock,
      outOfStock,
      healthy,
      lowStockCount: lowStock.length,
      outOfStockCount: outOfStock.length,
      healthyCount: healthy.length
    };
  }, [products, threshold]);

  // Filter products based on search and stock filter
  const filteredProducts = useMemo(() => {
    let result: Product[] = [];

    switch (filter) {
      case 'low':
        result = stockStats.lowStock;
        break;
      case 'out':
        result = stockStats.outOfStock;
        break;
      case 'healthy':
        result = stockStats.healthy;
        break;
      default:
        result = products.filter(p => p.status === 'active');
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term)
      );
    }

    // Sort by stock level (lowest first)
    return result.sort((a, b) => a.stock - b.stock);
  }, [products, filter, searchTerm, stockStats]);

  const getStockStatus = (stock: number): 'critical' | 'low' | 'healthy' => {
    if (stock === 0) return 'critical';
    if (stock <= threshold) return 'low';
    return 'healthy';
  };

  const getStockStatusLabel = (status: 'critical' | 'low' | 'healthy'): string => {
    switch (status) {
      case 'critical':
        return t('inventory.outOfStock');
      case 'low':
        return t('inventory.lowStock');
      default:
        return t('inventory.inStock');
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.loadingSpinner} />
        <p>{t('inventory.loadingStock')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <AlertCircle className={styles.errorIcon} />
        <p>{error}</p>
        <button onClick={() => refetch()} className={styles.retryButton}>
          {t('common.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t('inventory.title')}</h1>
          <p className={styles.subtitle}>
            {t('inventory.thresholdLabel').replace('{count}', threshold.toString())}
          </p>
        </div>
        <button onClick={() => refetch()} className={styles.refreshButton}>
          <RefreshCw className={styles.refreshIcon} />
          {t('common.refresh')}
        </button>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Package className={styles.iconPackage} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stockStats.total}</span>
            <span className={styles.statLabel}>{t('inventory.totalProducts')}</span>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.statCardWarning}`}>
          <div className={`${styles.statIcon} ${styles.statIconWarning}`}>
            <AlertTriangle className={styles.iconWarning} />
          </div>
          <div className={styles.statContent}>
            <span className={`${styles.statValue} ${styles.statValueWarning}`}>
              {stockStats.lowStockCount}
            </span>
            <span className={styles.statLabel}>{t('inventory.lowStockCount')}</span>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.statCardError}`}>
          <div className={`${styles.statIcon} ${styles.statIconError}`}>
            <AlertCircle className={styles.iconError} />
          </div>
          <div className={styles.statContent}>
            <span className={`${styles.statValue} ${styles.statValueError}`}>
              {stockStats.outOfStockCount}
            </span>
            <span className={styles.statLabel}>{t('inventory.outOfStockCount')}</span>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.statCardSuccess}`}>
          <div className={`${styles.statIcon} ${styles.statIconSuccess}`}>
            <CheckCircle className={styles.iconSuccess} />
          </div>
          <div className={styles.statContent}>
            <span className={`${styles.statValue} ${styles.statValueSuccess}`}>
              {stockStats.healthyCount}
            </span>
            <span className={styles.statLabel}>{t('inventory.healthyCount')}</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder={t('products.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filters}>
          <button
            onClick={() => setFilter('all')}
            className={`${styles.filterButton} ${filter === 'all' ? styles.filterActive : ''}`}
          >
            {t('inventory.filterAll')} ({stockStats.total})
          </button>
          <button
            onClick={() => setFilter('low')}
            className={`${styles.filterButton} ${styles.filterWarning} ${filter === 'low' ? styles.filterActive : ''}`}
          >
            {t('inventory.filterLow')} ({stockStats.lowStockCount})
          </button>
          <button
            onClick={() => setFilter('out')}
            className={`${styles.filterButton} ${styles.filterError} ${filter === 'out' ? styles.filterActive : ''}`}
          >
            {t('inventory.filterOut')} ({stockStats.outOfStockCount})
          </button>
          <button
            onClick={() => setFilter('healthy')}
            className={`${styles.filterButton} ${styles.filterSuccess} ${filter === 'healthy' ? styles.filterActive : ''}`}
          >
            {t('inventory.filterHealthy')} ({stockStats.healthyCount})
          </button>
        </div>
      </div>

      {/* Products List */}
      {filteredProducts.length === 0 ? (
        <div className={styles.emptyState}>
          <CheckCircle className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>{t('inventory.noLowStock')}</h3>
        </div>
      ) : (
        <div className={styles.productList}>
          {filteredProducts.map(product => {
            const status = getStockStatus(product.stock);
            return (
              <div
                key={product.id}
                className={`${styles.productCard} ${styles[`productCard${status.charAt(0).toUpperCase()}${status.slice(1)}`]}`}
                onClick={() => {
                  goToProducts();
                }}
              >
                <div className={styles.productImage}>
                  {product.images && product.images[0] ? (
                    <img src={product.images[0]} alt={product.name} />
                  ) : (
                    <div className={styles.imagePlaceholder}>
                      <Package className={styles.placeholderIcon} />
                    </div>
                  )}
                </div>

                <div className={styles.productInfo}>
                  <h3 className={styles.productName}>{product.name}</h3>
                  <p className={styles.productCategory}>{product.category}</p>
                </div>

                <div className={styles.stockInfo}>
                  <div className={`${styles.stockBadge} ${styles[`stockBadge${status.charAt(0).toUpperCase()}${status.slice(1)}`]}`}>
                    {status === 'critical' && <AlertCircle className={styles.badgeIcon} />}
                    {status === 'low' && <AlertTriangle className={styles.badgeIcon} />}
                    {status === 'healthy' && <CheckCircle className={styles.badgeIcon} />}
                    <span>{getStockStatusLabel(status)}</span>
                  </div>
                  <span className={styles.stockCount}>
                    {product.stock} {t('products.units')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
