import { Store, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import styles from './EmptyStateSection.module.css';

export const EmptyStateSection: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handlePartnerClick = () => {
    navigate('/business');
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.icons}>
          <div className={styles.iconWrapper}>
            <Store className={styles.icon} />
          </div>
          <div className={styles.iconWrapper}>
            <ShoppingBag className={styles.icon} />
          </div>
        </div>

        <h2 className={styles.title}>{t('home.emptyState.title')}</h2>
        <p className={styles.subtitle}>{t('home.emptyState.subtitle')}</p>

        <button className={styles.ctaButton} onClick={handlePartnerClick}>
          {t('home.emptyState.cta')}
        </button>
      </div>
    </section>
  );
};
