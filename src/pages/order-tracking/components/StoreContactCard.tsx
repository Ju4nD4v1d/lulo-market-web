import type * as React from 'react';
import { Store, Phone, MapPin } from 'lucide-react';
import { Order } from '../../../types/order';
import { useLanguage } from '../../../context/LanguageContext';
import { useStoreQuery } from '../../../hooks/queries/useStoreQuery';
import styles from './StoreContactCard.module.css';

interface StoreContactCardProps {
  order: Order;
}

/**
 * StoreContactCard - Displays store contact information with call button
 *
 * Uses storeInfo from order if available, otherwise fetches store data.
 * Provides a prominent call button for quick customer support.
 */
export const StoreContactCard: React.FC<StoreContactCardProps> = ({ order }) => {
  const { t } = useLanguage();

  // Fetch store data if storeInfo is not embedded in order
  const { store: fetchedStore, isLoading } = useStoreQuery(
    !order.storeInfo?.phone ? order.storeId : null
  );

  // Use embedded storeInfo first, fallback to fetched data
  const storeName = order.storeInfo?.name || order.storeName || fetchedStore?.name || '';
  const storePhone = order.storeInfo?.phone || fetchedStore?.phone || '';
  const storeAddress = order.storeInfo?.address || fetchedStore?.location?.address || '';

  // Format phone number for tel: link (remove spaces and special chars)
  const phoneLink = storePhone.replace(/[\s()-]/g, '');

  // Don't render if we have no store info at all
  if (!storeName && !isLoading) {
    return null;
  }

  // Loading state
  if (isLoading && !order.storeInfo) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        <Store className={styles.titleIcon} />
        {t('order.storeContact.title')}
      </h3>

      <div className={styles.content}>
        {/* Store Name */}
        <div className={styles.storeName}>
          {storeName}
        </div>

        {/* Store Address (if available) */}
        {storeAddress && (
          <div className={styles.infoRow}>
            <MapPin className={styles.infoIcon} />
            <span className={styles.infoText}>{storeAddress}</span>
          </div>
        )}

        {/* Store Phone */}
        {storePhone && (
          <div className={styles.infoRow}>
            <Phone className={styles.infoIcon} />
            <span className={styles.infoText}>{storePhone}</span>
          </div>
        )}

        {/* Call Button */}
        {storePhone && (
          <a
            href={`tel:${phoneLink}`}
            className={styles.callButton}
            aria-label={t('order.storeContact.callAriaLabel', { storeName })}
          >
            <Phone className={styles.callIcon} />
            {t('order.storeContact.callStore')}
          </a>
        )}

        {/* No phone available message */}
        {!storePhone && !isLoading && (
          <p className={styles.noPhone}>
            {t('order.storeContact.noPhone')}
          </p>
        )}
      </div>
    </div>
  );
};
