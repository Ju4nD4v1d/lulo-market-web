import { Star, MapPin, Store, Instagram, Facebook, Award } from 'lucide-react';
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
 * - Full-width section with background.jpg
 * - Glass card container with store info
 * - Mobile: Stacked (image on top, content below)
 * - Desktop (1024px+): Side-by-side (image left, content right)
 */
export const StoreHeroSection = ({ store }: StoreHeroSectionProps) => {
  const { t } = useLanguage();

  const imageUrl = store.storeImage || store.imageUrl;

  return (
    <section className={styles.section}>
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
        {/* Header: Name + Rating + Badges */}
        <div className={styles.header}>
          <div className={styles.nameWrapper}>
            <h1 className={styles.name}>{store.name}</h1>

            {/* Badges Row */}
            <div className={styles.badgesRow}>
              {/* Founder Badge */}
              {store.isFounderStore && (
                <div className={styles.founderBadge}>
                  <Award className={styles.founderIcon} />
                  <span>{t('store.founderBadge')}</span>
                </div>
              )}

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

        </div>

        {/* Social Media Links */}
        {(store.instagram || store.facebook) && (
          <div className={styles.socialLinks}>
            {store.instagram && (
              <a
                href={store.instagram.startsWith('http') ? store.instagram : `https://instagram.com/${store.instagram}`}
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
    </section>
  );
};
