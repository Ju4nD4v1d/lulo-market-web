import type * as React from 'react';

import TotalWeeklyProductsCard from './TotalWeeklyProductsCard';
import TotalActiveCustomersCard from './TotalActiveCustomersCard';
import TotalWeeklyRevenueCard from './TotalWeeklyRevenueCard';
import TotalWeeklyOrdersCard from './TotalWeeklyOrdersCard';
import styles from './KPICardGrid.module.css';

interface KPICardGridProps {
  storeId: string | null;
}

export const KPICardGrid: React.FC<KPICardGridProps> = ({ storeId }) => {
  if (!storeId) return null;

  return (
    <div className={styles.grid}>
      <TotalWeeklyProductsCard storeId={storeId} />
      <TotalActiveCustomersCard storeId={storeId} />
      <TotalWeeklyRevenueCard storeId={storeId} />
      <TotalWeeklyOrdersCard storeId={storeId} />
    </div>
  );
};
