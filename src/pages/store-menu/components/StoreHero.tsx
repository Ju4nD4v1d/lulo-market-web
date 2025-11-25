import type * as React from 'react';

import { StoreInfo } from '../types';
import styles from './StoreHero.module.css';

interface StoreHeroProps {
  store: StoreInfo;
}

export const StoreHero: React.FC<StoreHeroProps> = ({ store }) => {
  return (
    <div className={styles.hero}>
      <img src={store.image} alt={store.name} className={styles.image} />
      <div className={styles.overlay} />
      <div className={styles.info}>
        <div className={styles.infoCard}>
          <div className={styles.details}>
            <div>
              <span className={styles.label}>Delivery Fee: </span>
              ${store.deliveryFee.toFixed(2)}
            </div>
            <div>
              <span className={styles.label}>Minimum: </span>
              ${store.minimumOrder.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
