import type * as React from 'react';

import { Receipt } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  onStartShopping: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onStartShopping }) => {
  const { t } = useLanguage();

  return (
    <div className={styles.container}>
      <Receipt className={styles.icon} />
      <h3 className={styles.title}>{t('orderHistory.noOrders')}</h3>
      <p className={styles.description}>{t('orderHistory.noOrdersDescription')}</p>
      <button onClick={onStartShopping} className={styles.button}>
        {t('orderHistory.startShopping')}
      </button>
    </div>
  );
};
