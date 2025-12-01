import type * as React from 'react';
import { useMemo } from 'react';
import {
  Loader2,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';
import { useProductsQuery } from '../../../../../hooks/queries/useProductsQuery';
import { useStore } from '../../../../../context/StoreContext';
import { useLanguage } from '../../../../../context/LanguageContext';
import styles from './KPICard.module.css';

interface LowStockItemsCardProps {
  storeId: string;
}

const LowStockItemsCard: React.FC<LowStockItemsCardProps> = ({ storeId }) => {
  const { t } = useLanguage();
  const { store } = useStore();
  const { products, isLoading, error } = useProductsQuery({ storeId });

  // Get threshold from store settings, default to 10
  const threshold = store?.lowStockThreshold ?? 10;

  // Calculate low stock products count
  const lowStockCount = useMemo(() => {
    return products.filter(
      product =>
        product.status === 'active' &&
        product.stock > 0 &&
        product.stock <= threshold
    ).length;
  }, [products, threshold]);

  if (isLoading) {
    return (
      <div className={`${styles.card} ${styles.loadingCard}`}>
        <div className={styles.loadingContent}>
          <Loader2 className={styles.loadingSpinner} />
          <p className={styles.loadingText}>{t('inventory.loadingStock')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.card} ${styles.errorCard}`}>
        <div className={styles.cardContent}>
          <div className={styles.cardMain}>
            <p className={styles.cardLabel}>{t('dashboard.lowStockItems')}</p>
            <div className={styles.errorText}>
              <AlertCircle className={styles.errorIcon} />
              <span>{t('metrics.couldNotLoadData')}</span>
            </div>
          </div>
          <div className={styles.errorIconWrapper}>
            <AlertTriangle className={styles.errorCardIcon} />
          </div>
        </div>
      </div>
    );
  }

  // Determine if we should show warning styling
  const hasWarning = lowStockCount > 0;

  return (
    <div className={`${styles.card} ${hasWarning ? styles.warningCard : ''}`}>
      <div className={styles.cardContent}>
        <div className={styles.cardMain}>
          <p className={styles.cardLabel}>{t('dashboard.lowStockItems')}</p>
          <h3 className={`${styles.cardValue} ${hasWarning ? styles.warningValue : ''}`}>
            {lowStockCount}
          </h3>
          <p className={styles.cardSubtext}>
            {t('inventory.thresholdLabel').replace('{count}', threshold.toString())}
          </p>
        </div>
        <div className={styles.iconContainer}>
          <div className={`${styles.iconWrapper} ${hasWarning ? styles.warningIconWrapper : ''}`}>
            <AlertTriangle className={styles.cardIcon} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LowStockItemsCard;
