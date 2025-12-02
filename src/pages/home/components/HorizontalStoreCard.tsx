import { MapPin, Star, Award } from 'lucide-react';
import { StoreData } from '../../../types/store';
import { useLanguage } from '../../../context/LanguageContext';
import styles from './HorizontalStoreCard.module.css';

interface HorizontalStoreCardProps {
  store: StoreData;
  onClick: () => void;
}

export const HorizontalStoreCard: React.FC<HorizontalStoreCardProps> = ({
  store,
  onClick,
}) => {
  const { t } = useLanguage();

  return (
    <div
      className={styles.card}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
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
            <span className={styles.placeholderIcon}>🍽️</span>
          </div>
        )}

        {/* Verified Badge */}
        {store.isVerified && (
          <div className={styles.verifiedBadge}>
            <span>✓</span>
          </div>
        )}

        {/* Rating Badge */}
        {store.averageRating && (
          <div className={styles.ratingBadge}>
            <Star className={styles.starIcon} fill="#fbbf24" />
            <span>{store.averageRating.toFixed(1)}</span>
          </div>
        )}

        {/* Founder Badge */}
        {store.isFounderStore && (
          <div className={styles.founderBadge}>
            <Award className={styles.founderIcon} />
            <span>{t('store.founderBadge')}</span>
          </div>
        )}
      </div>

      {/* Store Info */}
      <div className={styles.info}>
        <h3 className={styles.storeName}>{store.name}</h3>

        <div className={styles.location}>
          <MapPin className={styles.locationIcon} />
          <span className={styles.locationText}>
            {store.location?.address?.split(',')[0] || t('store.nearYou')}
          </span>
        </div>

        {/* Delivery Options */}
        <div className={styles.tags}>
          {store.deliveryOptions?.delivery && (
            <span className={styles.tag}>🚚 {t('shopper.delivery')}</span>
          )}
          {store.deliveryOptions?.pickup && (
            <span className={styles.tag}>📦 {t('shopper.pickup')}</span>
          )}
        </div>
      </div>
    </div>
  );
};
