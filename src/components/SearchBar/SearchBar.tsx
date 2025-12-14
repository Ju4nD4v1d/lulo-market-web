import { type FC, type ChangeEvent } from 'react';
import { Search } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder,
  className = ''
}) => {
  const { t } = useLanguage();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`${styles.wrapper} ${className}`}>
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.inputContainer}>
        <Search className={styles.icon} />
        <input
          type="text"
          data-glass-search
          placeholder={placeholder || t('home.search.placeholder')}
          value={value}
          onChange={handleChange}
          className={styles.input}
        />
      </div>
    </div>
  );
};
