import type * as React from 'react';

import {
  Store,
  MapPin,
  Phone,
  Globe,
  Clock,
  Building2,
  Edit3,
  CheckCircle2,
  Star,
  Users,
  Calendar,
  ExternalLink,
  Image as ImageIcon,
  Package
} from 'lucide-react';
import { StoreData } from '../../../../../types/store';
import { PaymentSettings } from './PaymentSettings';
import styles from './StoreProfileView.module.css';

interface StoreStats {
  productCount: number;
  orderCount: number;
  rating: number;
  status: string;
  loading: boolean;
}

interface StoreProfileViewProps {
  storeData: StoreData;
  storeStats: StoreStats;
  onEdit: () => void;
  t: (key: string) => string;
}

const daysOrder = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

const getDayName = (day: string, t: (key: string) => string) => {
  const dayMap: { [key: string]: string } = {
    'Sunday': t('day.sunday'),
    'Monday': t('day.monday'),
    'Tuesday': t('day.tuesday'),
    'Wednesday': t('day.wednesday'),
    'Thursday': t('day.thursday'),
    'Friday': t('day.friday'),
    'Saturday': t('day.saturday')
  };
  return dayMap[day] || day;
};

export const StoreProfileView: React.FC<StoreProfileViewProps> = ({
  storeData,
  storeStats,
  onEdit,
  t
}) => {
  // Filter out empty about sections for display
  // Support both aboutUsSections and aboutUs for backward compatibility
  const aboutItems = (storeData.aboutUsSections || storeData.aboutUs || []).filter(item => item.title || item.description || item.imageUrl);

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerInfo}>
            <div className={styles.storeImageContainer}>
              {/* Store Image */}
              {storeData.storeImage ? (
                <img
                  src={storeData.storeImage}
                  alt="Store"
                  className={styles.storeImage}
                />
              ) : (
                <div className={styles.storeImagePlaceholder}>
                  <Store className={styles.storePlaceholderIcon} />
                </div>
              )}
              <div className={styles.verifiedBadge}>
                <CheckCircle2 className={styles.verifiedIcon} />
              </div>
            </div>

            {/* Store Info */}
            <div>
              <div className={styles.titleRow}>
                <h1 className={styles.title}>{storeData.name}</h1>
                <div className={styles.activeBadge}>
                  <CheckCircle2 className={styles.activeBadgeIcon} />
                  {t('store.dashboard.active')}
                </div>
              </div>
              <p className={styles.description}>{storeData.description}</p>
              <div className={styles.metadata}>
                <div className={styles.metadataItem}>
                  <MapPin className={styles.metadataIcon} />
                  <span>{storeData.cuisine ? t(`store.cuisine.${storeData.cuisine}`) : ''}</span>
                </div>
                <div className={styles.metadataItem}>
                  <Calendar className={styles.metadataIcon} />
                  <span>{t('store.dashboard.joined')} 2024</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button onClick={onEdit} className={styles.editButton}>
            <Edit3 className={styles.editIcon} />
            {t('store.dashboard.editStore')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.content}>
        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} ${styles.statCardGreen}`}>
            <div className={styles.statCardContent}>
              <div>
                <p className={styles.statLabel}>{t('store.dashboard.storeStatus')}</p>
                {storeStats.loading ? (
                  <div className={styles.statSkeleton}></div>
                ) : (
                  <p className={styles.statValueGreen}>{t('store.dashboard.active')}</p>
                )}
              </div>
              <div className={styles.statIconGreen}>
                <CheckCircle2 className={styles.statIcon} />
              </div>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.statCardBlue}`}>
            <div className={styles.statCardContent}>
              <div>
                <p className={styles.statLabel}>{t('store.dashboard.products')}</p>
                {storeStats.loading ? (
                  <div className={styles.statSkeleton}></div>
                ) : (
                  <p className={styles.statValueBlue}>{storeStats.productCount}</p>
                )}
              </div>
              <div className={styles.statIconBlue}>
                <Package className={styles.statIcon} />
              </div>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.statCardPurple}`}>
            <div className={styles.statCardContent}>
              <div>
                <p className={styles.statLabel}>{t('store.dashboard.orders')}</p>
                {storeStats.loading ? (
                  <div className={styles.statSkeleton}></div>
                ) : (
                  <p className={styles.statValuePurple}>{storeStats.orderCount}</p>
                )}
              </div>
              <div className={styles.statIconPurple}>
                <Users className={styles.statIcon} />
              </div>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.statCardYellow}`}>
            <div className={styles.statCardContent}>
              <div>
                <p className={styles.statLabel}>{t('store.dashboard.rating')}</p>
                {storeStats.loading ? (
                  <div className={styles.statSkeleton}></div>
                ) : (
                  <p className={styles.statValueYellow}>{storeStats.rating}</p>
                )}
              </div>
              <div className={styles.statIconYellow}>
                <Star className={styles.statIcon} />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Settings Section */}
        <PaymentSettings storeId={storeData.id} storeName={storeData.name} />

        {/* Main Content Grid */}
        <div className={styles.mainGrid}>
          {/* Left Column - Basic Info */}
          <div className={styles.leftColumn}>
            {/* Basic Information Card */}
            <div className={styles.card}>
              <div className={`${styles.cardHeader} ${styles.cardHeaderPrimary}`}>
                <div className={styles.cardHeaderIconPrimary}>
                  <Store className={styles.cardHeaderIcon} />
                </div>
                <h3 className={styles.cardTitle}>{t('store.dashboard.basicInfo')}</h3>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.infoGrid}>
                  <div>
                    <label className={styles.infoLabel}>{t('store.dashboard.storeName')}</label>
                    <p className={styles.infoValue}>{storeData.name}</p>
                  </div>
                  <div>
                    <label className={styles.infoLabel}>{t('store.dashboard.cuisine')}</label>
                    <p className={styles.infoValue}>{storeData.cuisine ? t(`store.cuisine.${storeData.cuisine}`) : ''}</p>
                  </div>
                </div>
                <div>
                  <label className={styles.infoLabel}>{t('store.dashboard.description')}</label>
                  <p className={styles.infoDescription}>{storeData.description}</p>
                </div>
              </div>
            </div>

            {/* Contact Information Card */}
            <div className={styles.card}>
              <div className={`${styles.cardHeader} ${styles.cardHeaderBlue}`}>
                <div className={styles.cardHeaderIconBlue}>
                  <Phone className={styles.cardHeaderIcon} />
                </div>
                <h3 className={styles.cardTitle}>{t('store.dashboard.contactInfo')}</h3>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.contactItem}>
                  <MapPin className={styles.contactIcon} />
                  <div>
                    <p className={styles.contactLabel}>{t('store.dashboard.address')}</p>
                    <p className={styles.contactValue}>{storeData.address}</p>
                  </div>
                </div>
                <div className={styles.contactItem}>
                  <Phone className={styles.contactIcon} />
                  <div>
                    <p className={styles.contactLabel}>{t('store.dashboard.phone')}</p>
                    <p className={styles.contactValue}>{storeData.phone}</p>
                  </div>
                </div>
                <div className={styles.contactItem}>
                  <Globe className={styles.contactIcon} />
                  <div>
                    <p className={styles.contactLabel}>{t('store.dashboard.website')}</p>
                    <a
                      href={storeData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.contactLink}
                    >
                      {storeData.website}
                      <ExternalLink className={styles.contactLinkIcon} />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* About Us Section */}
            {aboutItems.length > 0 && (
              <div className={styles.card}>
                <div className={`${styles.cardHeader} ${styles.cardHeaderPurple}`}>
                  <div className={styles.cardHeaderIconPurple}>
                    <Building2 className={styles.cardHeaderIcon} />
                  </div>
                  <h3 className={styles.cardTitle}>About Us</h3>
                </div>
                <div className={styles.cardContent}>
                  <div className={styles.aboutGrid}>
                    {aboutItems.map((item, i) => (
                      <div key={i} className={styles.aboutItem}>
                        {(item.imageUrl || item.imagePreview) ? (
                          <img
                            src={item.imageUrl || item.imagePreview}
                            alt={item.title}
                            className={styles.aboutImage}
                          />
                        ) : (
                          <div className={styles.aboutImagePlaceholder}>
                            <ImageIcon className={styles.aboutImageIcon} />
                          </div>
                        )}
                        <h4 className={styles.aboutTitle}>{item.title}</h4>
                        <p className={styles.aboutDescription}>{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Delivery Hours & Quick Actions */}
          <div className={styles.rightColumn}>
            <div className={styles.card}>
              <div className={`${styles.cardHeader} ${styles.cardHeaderGreen}`}>
                <div className={styles.cardHeaderIconGreen}>
                  <Clock className={styles.cardHeaderIcon} />
                </div>
                <h3 className={styles.cardTitle}>{t('store.dashboard.deliveryHours')}</h3>
              </div>
              <div className={styles.cardContent}>
                {daysOrder.map(day => {
                  const hours = storeData.deliveryHours?.[day] || storeData.businessHours?.[day];
                  return (
                    <div key={day} className={styles.hoursRow}>
                      <span className={styles.hoursDay}>{getDayName(day, t)}</span>
                      {!hours ? (
                        <span className={styles.hoursClosed}>{t('store.dashboard.closed')}</span>
                      ) : hours.closed ? (
                        <span className={styles.hoursClosed}>{t('store.dashboard.closed')}</span>
                      ) : (
                        <span className={styles.hoursOpen}>
                          {hours.open} - {hours.close}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className={styles.card}>
              <h3 className={styles.quickActionsTitle}>{t('store.dashboard.quickActions')}</h3>
              <div className={styles.quickActionsContent}>
                <button
                  onClick={() => window.location.hash = '#dashboard/products'}
                  className={`${styles.quickActionButton} ${styles.quickActionBlue}`}
                >
                  {t('store.dashboard.manageProducts')}
                </button>
                <button
                  onClick={() => window.location.hash = '#dashboard/orders'}
                  className={`${styles.quickActionButton} ${styles.quickActionPurple}`}
                >
                  {t('store.dashboard.viewOrders')}
                </button>
                <button
                  onClick={() => window.location.hash = '#dashboard/metrics'}
                  className={`${styles.quickActionButton} ${styles.quickActionGreen}`}
                >
                  {t('store.dashboard.analytics')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
