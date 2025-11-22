import type * as React from 'react';

import clsx from 'clsx';
import { MapPin, Star, Search } from 'lucide-react';
import { StoreData } from '../../../types/store';
import styles from './StoreCard.module.css';
import badgeStyles from '../../../styles/badge.module.css';

interface StoreCardProps {
  store: StoreData;
  index: number;
  isUsingFallbackSearch: boolean;
  onStoreClick: (store: StoreData, index: number) => void;
  calculateDistance: (store: StoreData) => string;
  isStoreNew: (store: StoreData) => boolean;
  t: (key: string) => string;
}

export const StoreCard: React.FC<StoreCardProps> = ({
  store,
  index,
  isUsingFallbackSearch,
  onStoreClick,
  calculateDistance,
  isStoreNew,
  t,
}) => {
  return (
    <div
      key={store.id}
      onClick={() => onStoreClick(store, index)}
      className={styles.card}
      tabIndex={0}
      role="button"
      aria-label={`View menu for ${store.name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onStoreClick(store, index);
        }
      }}
    >
      {/* Store Image */}
      <div className={styles.imageContainer}>
        {(store.storeImage || store.imageUrl) ? (
          <img
            src={store.storeImage || store.imageUrl}
            alt={store.name}
            className={styles.image}
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (store.storeImage && store.imageUrl && target.src === store.storeImage) {
                target.src = store.imageUrl;
              }
            }}
          />
        ) : (
          <div className={styles.placeholder}>
            <div className={styles.placeholderContent}>
              <div className={styles.placeholderIcon}>
                <span>🍽️</span>
              </div>
              <span className={styles.placeholderText}>Coming Soon</span>
            </div>
          </div>
        )}

        <div className={styles.overlay}></div>

        {/* Search Match Badge */}
        {store.searchMetadata && (
          <div className={clsx(
            badgeStyles.badge,
            badgeStyles.positioned,
            badgeStyles.topLeft,
            isUsingFallbackSearch ? badgeStyles.searchFallback : badgeStyles.searchExact
          )}>
            <Search style={{ width: '12px', height: '12px' }} />
            <span style={{ display: 'none', fontSize: '12px' }} className="lg:inline">
              {store.searchMetadata.matchType === 'exact_name' && 'Nombre exacto'}
              {store.searchMetadata.matchType === 'partial_name' && 'Nombre'}
              {store.searchMetadata.matchType === 'description' && 'Descripción'}
              {store.searchMetadata.matchType === 'product_match' && 'Producto'}
            </span>
          </div>
        )}

        {/* Verification Badge */}
        {store.isVerified && (
          <div className={clsx(
            badgeStyles.badge,
            badgeStyles.positioned,
            store.searchMetadata ? badgeStyles.topRight : badgeStyles.topLeft,
            badgeStyles.verification
          )}>
            <span>✓</span>
            <span style={{ display: 'none', fontSize: '12px' }} className="lg:inline">{t('shopper.verified')}</span>
          </div>
        )}

        {/* Badge Logic */}
        {isStoreNew(store) ? (
          <div className={clsx(badgeStyles.badge, badgeStyles.positioned, badgeStyles.bottomLeft, badgeStyles.new)}>
            <Star style={{ width: '12px', height: '12px' }} fill="currentColor" />
            <span>{t('store.new')}</span>
          </div>
        ) : store.averageRating ? (
          <div className={clsx(badgeStyles.badge, badgeStyles.positioned, badgeStyles.bottomLeft, badgeStyles.rating)}>
            <Star style={{ width: '12px', height: '12px', color: '#fbbf24' }} fill="#fbbf24" />
            <span>
              {store.averageRating.toFixed(1)}
            </span>
          </div>
        ) : null}
      </div>

      {/* Store Info */}
      <div className={styles.info}>
        <div>
          <h3 className={styles.storeName}>
            {store.name}
          </h3>
          <p className={styles.location} style={{ marginTop: '4px' }}>
            <MapPin className={styles.locationIcon} style={{ color: '#C8E400' }} />
            <span>{calculateDistance(store)}</span>
            <span style={{ marginLeft: 'auto' }}>{store.totalReviews || 0} {t('shopper.reviews')}</span>
          </p>
        </div>

        <div className={styles.deliveryOptions}>
          {store.deliveryOptions?.delivery && (
            <div className={badgeStyles.delivery}>
              🚚 ${store.deliveryCostWithDiscount || 'Free'}
            </div>
          )}
          {store.deliveryOptions?.pickup && (
            <div className={badgeStyles.pickup}>
              📦 {t('shopper.pickup')}
            </div>
          )}
          {store.minimumOrder && (
            <span style={{
              background: '#f3f4f6',
              color: '#4b5563',
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 500
            }}>
              Min: ${store.minimumOrder}
            </span>
          )}
        </div>

        <div className={styles.ctaButton}>
          {t('shopper.viewMenuOrder')}
        </div>
      </div>
    </div>
  );
};
