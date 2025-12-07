import { useMemo } from 'react';
import type * as React from 'react';

import { useLanguage } from '../../../../../context/LanguageContext';
import TotalWeeklyProductsCard from './TotalWeeklyProductsCard';
import TotalActiveCustomersCard from './TotalActiveCustomersCard';
import TotalWeeklyOrdersCard from './TotalWeeklyOrdersCard';
import LowStockItemsCard from './LowStockItemsCard';
import styles from './KPICardGrid.module.css';

interface KPICardGridProps {
  storeId: string | null;
}

export const KPICardGrid: React.FC<KPICardGridProps> = ({ storeId }) => {
  const { t, locale } = useLanguage();

  // Calculate current week's date range (Sunday to Saturday)
  const weekDateRange = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday

    // Start of week (Sunday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    // End of week (Saturday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const formatOptions: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
    };

    const localeStr = locale === 'es' ? 'es-ES' : 'en-US';
    const startStr = startOfWeek.toLocaleDateString(localeStr, formatOptions);
    const endStr = endOfWeek.toLocaleDateString(localeStr, formatOptions);

    return `${startStr} - ${endStr}`;
  }, [locale]);

  if (!storeId) return null;

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleGroup}>
          <h2 className={styles.sectionTitle}>{t('metrics.weeklyPerformance')}</h2>
          <p className={styles.sectionSubtitle}>{weekDateRange}</p>
        </div>
      </div>
      <div className={styles.grid}>
        <TotalWeeklyProductsCard storeId={storeId} />
        <TotalActiveCustomersCard storeId={storeId} />
        <TotalWeeklyOrdersCard storeId={storeId} />
        <LowStockItemsCard storeId={storeId} />
      </div>
    </div>
  );
};
