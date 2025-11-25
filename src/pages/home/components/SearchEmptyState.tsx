import { Search, Package } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { useSearchStore } from '../../../stores/searchStore';
import styles from './SearchEmptyState.module.css';

interface SearchEmptyStateProps {
  searchQuery: string;
}

export const SearchEmptyState: React.FC<SearchEmptyStateProps> = ({ searchQuery }) => {
  const { t } = useLanguage();
  const { setSearchQuery } = useSearchStore();

  const popularSearches = ['Arepas', 'Empanadas', 'Tequeños', 'Cachapas', 'Patacones'];

  const handlePopularSearch = (term: string) => {
    setSearchQuery(term);
  };

  return (
    <div className={styles.container}>
      <div className={styles.iconWrapper}>
        <Search className={styles.icon} />
      </div>

      <h3 className={styles.title}>
        {t('search.noResultsFound')}
      </h3>

      <p className={styles.searchedFor}>
        {t('search.searchedFor')}: <span className={styles.query}>"{searchQuery}"</span>
      </p>

      <div className={styles.suggestions}>
        <p className={styles.suggestionsTitle}>{t('search.suggestions')}</p>
        <ul className={styles.suggestionsList}>
          <li>{t('search.checkSpelling')}</li>
          <li>{t('search.tryDifferentKeywords')}</li>
          <li>{t('search.useLessSpecific')}</li>
        </ul>
      </div>

      <div className={styles.popularSearches}>
        <div className={styles.popularHeader}>
          <Package className={styles.popularIcon} />
          <p className={styles.popularTitle}>{t('search.popularSearches')}</p>
        </div>
        <div className={styles.popularList}>
          {popularSearches.map((term) => (
            <button
              key={term}
              onClick={() => handlePopularSearch(term)}
              className={styles.popularButton}
            >
              {term}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
