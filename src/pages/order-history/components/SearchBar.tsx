import React from 'react';
import { Search } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  const { t } = useLanguage();

  return (
    <div className={styles.container}>
      <Search className={styles.icon} />
      <input
        type="text"
        placeholder={t('orderHistory.searchPlaceholder')}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={styles.input}
      />
    </div>
  );
};
