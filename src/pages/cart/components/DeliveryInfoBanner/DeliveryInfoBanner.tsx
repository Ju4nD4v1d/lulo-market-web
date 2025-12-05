/**
 * DeliveryInfoBanner - Displays delivery info and cancellation policy in the cart
 */

import type * as React from 'react';
import { useMemo } from 'react';
import { Info, Calendar, FileText } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';
import { useStoreQuery } from '../../../../hooks/queries/useStoreQuery';
import { useEffectiveHours } from '../../../../hooks/useEffectiveHours';
import { getAvailableDeliveryDatesMultiSlot } from '../../../../utils/effectiveHours';
import styles from './DeliveryInfoBanner.module.css';

interface DeliveryInfoBannerProps {
  storeId: string;
}

export const DeliveryInfoBanner: React.FC<DeliveryInfoBannerProps> = ({ storeId }) => {
  const { t, locale } = useLanguage();
  const { store, isLoading: isLoadingStore } = useStoreQuery(storeId);
  const { effectiveHours, isLoading: isLoadingHours } = useEffectiveHours({
    store,
    enabled: !!store,
  });

  // Get the next available delivery date (without 24-hour cutoff - for display only)
  const nextDelivery = useMemo(() => {
    if (!effectiveHours) return null;
    // Use minHoursFromNow = 0 to show actual next delivery slot
    const dates = getAvailableDeliveryDatesMultiSlot(effectiveHours, 14, 0);
    return dates.length > 0 ? dates[0] : null;
  }, [effectiveHours]);

  // Format the date for display
  const formattedDate = useMemo(() => {
    if (!nextDelivery) return null;

    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    };

    return nextDelivery.date.toLocaleDateString(
      locale === 'es' ? 'es-ES' : 'en-US',
      options
    );
  }, [nextDelivery, locale]);

  // Check if delivery is within 24 hours
  const isWithin24Hours = useMemo(() => {
    if (!nextDelivery) return false;
    const now = new Date();
    const hoursUntilDelivery = (nextDelivery.date.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilDelivery <= 24;
  }, [nextDelivery]);

  // Format time window
  const timeWindow = useMemo(() => {
    if (!nextDelivery || nextDelivery.slots.length === 0) return null;

    // Get the earliest open and latest close from all slots
    const firstSlot = nextDelivery.slots[0];
    const lastSlot = nextDelivery.slots[nextDelivery.slots.length - 1];

    // Ensure slots have valid time values
    if (!firstSlot?.open || !lastSlot?.close) return null;

    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes);
      return date.toLocaleTimeString(locale === 'es' ? 'es-ES' : 'en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    };

    return {
      start: formatTime(firstSlot.open),
      end: formatTime(lastSlot.close),
    };
  }, [nextDelivery, locale]);

  // Show loading state briefly or nothing
  if (isLoadingStore || isLoadingHours) {
    return null;
  }

  // If no delivery schedule available, don't show the banner
  if (!effectiveHours || !nextDelivery) {
    return null;
  }

  return (
    <div className={styles.banner}>
      {/* Cancellation Policy - only shown when delivery is within 24 hours */}
      {isWithin24Hours && (
        <div className={styles.infoRow}>
          <Info className={styles.icon} />
          <p className={styles.text}>{t('cart.deliveryInfo.cancellationPolicy')}</p>
        </div>
      )}

      {/* Next Delivery Date */}
      <div className={styles.infoRow}>
        <Calendar className={styles.icon} />
        <div className={styles.deliveryInfo}>
          <span className={styles.label}>{t('cart.deliveryInfo.nextDelivery')}</span>
          <span className={styles.value}>
            {formattedDate}
            {timeWindow && (
              <span className={styles.timeWindow}>
                {' '}
                {t('cart.deliveryInfo.timeWindow')
                  .replace('{start}', timeWindow.start)
                  .replace('{end}', timeWindow.end)}
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Notes Hint */}
      <div className={styles.infoRow}>
        <FileText className={styles.icon} />
        <p className={styles.hintText}>{t('cart.deliveryInfo.addNotesHint')}</p>
      </div>
    </div>
  );
};

export default DeliveryInfoBanner;
