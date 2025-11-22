import React from 'react';
import TotalWeeklyProductsCard from '../../../../../components/TotalWeeklyProductsCard';
import TotalActiveCustomersCard from '../../../../../components/TotalActiveCustomersCard';
import TotalWeeklyRevenueCard from '../../../../../components/TotalWeeklyRevenueCard';
import TotalWeeklyOrdersCard from '../../../../../components/TotalWeeklyOrdersCard';
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
