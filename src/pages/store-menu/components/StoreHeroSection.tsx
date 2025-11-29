import { Star, MapPin, Clock, Store, Instagram, Facebook } from 'lucide-react';
import { StoreData } from '../../../types/store';
import { useLanguage } from '../../../context/LanguageContext';
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
 */
export const StoreHeroSection = ({ store }: StoreHeroSectionProps) => {
  const { t } = useLanguage();

  /**
   * Format 24-hour time to 12-hour format with AM/PM
   */
  const formatTime12Hour = (time24: string): string => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  /**
   * Get today's delivery hours as formatted string
   */
  const getDeliveryHoursToday = (): string => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = daysOfWeek[new Date().getDay()];

    const businessHours = store.businessHours || store.deliveryHours;
    const todayHours = businessHours?.[dayName] || businessHours?.[dayName.toLowerCase()];

    if (!todayHours || todayHours.closed) {
      return t('delivery.noDeliveryToday');
    }

    return `${formatTime12Hour(todayHours.open)} - ${formatTime12Hour(todayHours.close)}`;
  };

  /**
   * Check if delivery is currently available based on today's hours
   */
  const isDeliveryAvailable = (): boolean => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = daysOfWeek[new Date().getDay()];

    const businessHours = store.businessHours || store.deliveryHours;
    const todayHours = businessHours?.[dayName] || businessHours?.[dayName.toLowerCase()];

    return Boolean(todayHours && !todayHours.closed);
  };

  const imageUrl = store.storeImage || store.imageUrl;
  const isOpen = isDeliveryAvailable();

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
              <div className={styles.metaValue}>{getDeliveryHoursToday()}</div>
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
