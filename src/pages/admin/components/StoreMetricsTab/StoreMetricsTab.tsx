/**
 * StoreMetricsTab - Shows KPI cards for admin view
 */

import { Activity } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';
import { KPICardGrid } from '../../../dashboard/sections/metrics/components/KPICardGrid';
import styles from './StoreMetricsTab.module.css';

interface StoreMetricsTabProps {
  storeId: string;
}

export const StoreMetricsTab = ({ storeId }: StoreMetricsTabProps) => {
  const { t } = useLanguage();

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h2 className={styles.title}>
            <Activity className={styles.titleIcon} />
            {t('admin.storeMetrics.title')}
          </h2>
        </div>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiSection}>
        <KPICardGrid storeId={storeId} />
      </div>
    </div>
  );
};
