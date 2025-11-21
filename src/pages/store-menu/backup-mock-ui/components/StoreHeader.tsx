import React from 'react';
import { ArrowLeft, Star, Clock, MapPin } from 'lucide-react';
import { StoreInfo } from '../types';
import styles from './StoreHeader.module.css';

interface StoreHeaderProps {
  store: StoreInfo;
  onBack: () => void;
}

export const StoreHeader: React.FC<StoreHeaderProps> = ({ store, onBack }) => {
  return (
    <div className={styles.header}>
      <div className={styles.container}>
        <div className={styles.topSection}>
          <button
            onClick={onBack}
            className={styles.backButton}
            aria-label="Go back to restaurants"
          >
            <ArrowLeft className={styles.backIcon} />
          </button>
          <div className={styles.info}>
            <h1 className={styles.name}>{store.name}</h1>
            <div className={styles.meta}>
              <Star className={styles.starIcon} />
              <span className={styles.metaItem}>
                {store.rating} ({store.reviewCount})
              </span>
              <Clock className={styles.icon} />
              <span className={styles.metaItem}>{store.deliveryTime}</span>
              <MapPin className={styles.icon} />
              <span className={styles.metaItem}>1.2 km</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
