import { ChevronRight } from 'lucide-react';
import { StoreData } from '../../../types/store';
import { useLanguage } from '../../../context/LanguageContext';
import { HorizontalStoreCard } from './HorizontalStoreCard';
import styles from './HorizontalRow.module.css';

interface HorizontalStoreRowProps {
  stores: StoreData[];
  onStoreClick: (store: StoreData) => void;
  onViewAll?: () => void;
}

export const HorizontalStoreRow: React.FC<HorizontalStoreRowProps> = ({
  stores,
  onStoreClick,
  onViewAll,
}) => {
  const { t } = useLanguage();

  if (stores.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>{t('home.stores.title')}</h2>
          <p className={styles.subtitle}>{t('home.stores.subtitle')}</p>
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
          {stores.map((store) => (
            <HorizontalStoreCard
              key={store.id}
              store={store}
              onClick={() => onStoreClick(store)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
