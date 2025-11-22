import type * as React from 'react';

import { Filter, SortDesc } from 'lucide-react';
import { OrderStatus } from '../../../types/order';
import { useLanguage } from '../../../context/LanguageContext';
import { getStatusText } from '../utils/orderStatus';
import styles from './FilterBar.module.css';

interface FilterBarProps {
  statusFilter: OrderStatus | 'all';
  onStatusFilterChange: (status: OrderStatus | 'all') => void;
  sortBy: 'date' | 'amount' | 'status';
  onSortByChange: (sort: 'date' | 'amount' | 'status') => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: () => void;
  availableStatuses: OrderStatus[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  availableStatuses,
}) => {
  const { t } = useLanguage();

  return (
    <div className={styles.container}>
      {/* Status Filter */}
      <div className={styles.filterGroup}>
        <Filter className={styles.filterIcon} />
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as OrderStatus | 'all')}
          className={styles.select}
        >
          <option value="all">{t('orderHistory.allStatuses')}</option>
          {availableStatuses.map(status => (
            <option key={status} value={status}>
              {getStatusText(status, t)}
            </option>
          ))}
        </select>
      </div>

      {/* Sort Controls */}
      <div className={styles.sortGroup}>
        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value as 'date' | 'amount' | 'status')}
          className={styles.select}
        >
          <option value="date">{t('orderHistory.sortByDate')}</option>
          <option value="amount">{t('orderHistory.sortByAmount')}</option>
          <option value="status">{t('orderHistory.sortByStatus')}</option>
        </select>
        <button
          onClick={onSortOrderChange}
          className={styles.sortButton}
          title={sortOrder === 'asc' ? t('orderHistory.ascending') : t('orderHistory.descending')}
        >
          <SortDesc className={`${styles.sortIcon} ${sortOrder === 'asc' ? styles.ascending : ''}`} />
        </button>
      </div>
    </div>
  );
};
