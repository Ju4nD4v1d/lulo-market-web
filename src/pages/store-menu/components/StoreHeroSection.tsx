import { Star, MapPin, Clock, Store, Instagram, Facebook } from 'lucide-react';
import { StoreData } from '../../../types/store';
import { useLanguage } from '../../../context/LanguageContext';
import { useEffectiveHours } from '../../../hooks/useEffectiveHours';
import styles from './StoreHeroSection.module.css';

interface StoreHeroSectionProps {
  store: StoreData;
}

/**
 * StoreHeroSection - Displays store image and key information
 *
 * Layout:
 * - Mobile: Stacked (image on top, content below)
 * - Desktop (1024px+): Side-by-side (image left, content right)
 *
 * Now uses effective hours (intersection of store hours + driver availability)
 */
export const StoreHeroSection = ({ store }: StoreHeroSectionProps) => {
  const { t } = useLanguage();
  const { isDeliveryAvailable, todayHoursText } = useEffectiveHours({ store });

  const imageUrl = store.storeImage || store.imageUrl;
  const isOpen = isDeliveryAvailable;

  return (
    <div className={styles.container}>
      {/* Image Section */}
      <div className={styles.imageWrapper}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={store.name}
            className={styles.image}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              // Try fallback image if available
              if (store.storeImage && store.imageUrl && target.src === store.storeImage) {
                target.src = store.imageUrl;
              }
            }}
          />
        ) : (
          <div className={styles.imageFallback}>
            <Store className={styles.fallbackIcon} />
            <span className={styles.fallbackText}>{store.name}</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className={styles.content}>
        {/* Header: Name + Rating + Verified Badge */}
        <div className={styles.header}>
          <div className={styles.nameWrapper}>
            <h1 className={styles.name}>{store.name}</h1>

            {/* Rating */}
            {store.averageRating !== undefined && store.averageRating > 0 && (
              <div className={styles.ratingWrapper}>
                <div className={styles.rating}>
                  <Star className={styles.starIcon} />
                  <span className={styles.ratingValue}>{store.averageRating.toFixed(1)}</span>
                </div>
                {store.totalReviews !== undefined && store.totalReviews > 0 && (
                  <span className={styles.reviewCount}>
                    ({store.totalReviews} {t('storeHero.reviews')})
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {store.description && (
          <p className={styles.description}>{store.description}</p>
        )}

        {/* Meta Grid: Location, Hours, Delivery Info */}
        <div className={styles.metaGrid}>
          {/* Location */}
          {(store.location?.address || store.address) && (
            <div className={styles.metaItem}>
              <div className={styles.metaIconWrapper}>
                <MapPin className={styles.metaIcon} />
              </div>
              <div className={styles.metaContent}>
                <div className={styles.metaLabel}>{t('storeHero.location')}</div>
                <div className={styles.metaValue}>
                  {store.location?.address || store.address}
                </div>
              </div>
            </div>
          )}

          {/* Hours */}
          <div className={styles.metaItem}>
            <div className={styles.metaIconWrapper}>
              <Clock className={styles.metaIcon} />
            </div>
            <div className={styles.metaContent}>
              <div className={styles.metaLabel}>{t('storeHero.todayHours')}</div>
              <div className={`${styles.metaValue} ${isOpen ? styles.metaValueOpen : styles.metaValueClosed}`}>
                {isOpen ? t('storeHero.openNow') : t('storeHero.closed')}
              </div>
              <div className={styles.metaValue}>{todayHoursText}</div>
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        {(store.instagram || store.facebook) && (
          <div className={styles.socialLinks}>
            {store.instagram && (
              <a
                href={`https://instagram.com/${store.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="Instagram"
              >
                <Instagram className={styles.socialIcon} />
              </a>
            )}
            {store.facebook && (
              <a
                href={store.facebook.startsWith('http') ? store.facebook : `https://facebook.com/${store.facebook}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="Facebook"
              >
                <Facebook className={styles.socialIcon} />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
