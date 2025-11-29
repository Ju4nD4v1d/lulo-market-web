import { Truck, Calendar } from 'lucide-react';
import { StoreData } from '../../../types/store';
import { useLanguage } from '../../../context/LanguageContext';
import styles from './DeliverySchedule.module.css';

interface DeliveryScheduleProps {
  store: StoreData;
}

interface DayInfo {
  dayIndex: number;
  dayKeyFull: string;
  dayKeyShort: string;
  isOpen: boolean;
}

/**
 * DeliverySchedule - Shows which days a store delivers
 *
 * Features:
 * - Only shows days the store is open (hides closed days)
 * - Desktop: Full day names in horizontal row
 * - Mobile: Abbreviated day names with flex wrap
 * - Highlights today with primary color
 * - Shows simplified "Next delivery" indicator
 */
export const DeliverySchedule = ({ store }: DeliveryScheduleProps) => {
  const { t } = useLanguage();

  // Day mapping: index, full translation key, short translation key
  const daysConfig = [
    { index: 0, fullKey: 'days.sunday', shortKey: 'days.sun' },
    { index: 1, fullKey: 'days.monday', shortKey: 'days.mon' },
    { index: 2, fullKey: 'days.tuesday', shortKey: 'days.tue' },
    { index: 3, fullKey: 'days.wednesday', shortKey: 'days.wed' },
    { index: 4, fullKey: 'days.thursday', shortKey: 'days.thu' },
    { index: 5, fullKey: 'days.friday', shortKey: 'days.fri' },
    { index: 6, fullKey: 'days.saturday', shortKey: 'days.sat' },
  ];

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  /**
   * Get the schedule for each day, filtering only open days
   */
  const getOpenDays = (): DayInfo[] => {
    const businessHours = store.businessHours || store.deliveryHours;
    if (!businessHours) return [];

    return daysConfig
      .map((config) => {
        const dayName = dayNames[config.index];
        const dayHours = businessHours[dayName] || businessHours[dayName.toLowerCase()];
        const isOpen = dayHours && !dayHours.closed;

        return {
          dayIndex: config.index,
          dayKeyFull: config.fullKey,
          dayKeyShort: config.shortKey,
          isOpen: Boolean(isOpen),
        };
      })
      .filter((day) => day.isOpen);
  };

  /**
   * Get next delivery info
   */
  const getNextDelivery = (): { label: string; isToday: boolean } | null => {
    const businessHours = store.businessHours || store.deliveryHours;
    if (!businessHours) return null;

    const today = new Date().getDay();

    // Check if today delivers
    const todayName = dayNames[today];
    const todayHours = businessHours[todayName] || businessHours[todayName.toLowerCase()];
    if (todayHours && !todayHours.closed) {
      return { label: t('deliverySchedule.today'), isToday: true };
    }

    // Find next open day
    for (let i = 1; i <= 7; i++) {
      const checkDay = (today + i) % 7;
      const checkDayName = dayNames[checkDay];
      const dayHours = businessHours[checkDayName] || businessHours[checkDayName.toLowerCase()];

      if (dayHours && !dayHours.closed) {
        if (i === 1) {
          return { label: t('deliverySchedule.tomorrow'), isToday: false };
        }
        // Return the day name
        const config = daysConfig[checkDay];
        return { label: t(config.fullKey), isToday: false };
      }
    }

    return null;
  };

  const openDays = getOpenDays();
  const nextDelivery = getNextDelivery();
  const today = new Date().getDay();

  // If no open days at all
  if (openDays.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <Truck className={styles.headerIcon} />
          <h2 className={styles.title}>{t('deliverySchedule.title')}</h2>
        </div>
        <div className={styles.emptyState}>
          {t('deliverySchedule.noDeliveryDays')}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <Truck className={styles.headerIcon} />
        <h2 className={styles.title}>{t('deliverySchedule.title')}</h2>
      </div>

      {/* Day Pills */}
      <div className={styles.daysGrid}>
        {openDays.map((day) => {
          const isToday = day.dayIndex === today;
          const pillClass = isToday ? styles.dayPillActive : styles.dayPillDefault;

          return (
            <div
              key={day.dayIndex}
              className={`${styles.dayPill} ${pillClass}`}
            >
              <span>
                <span className={styles.dayNameShort}>{t(day.dayKeyShort)}</span>
                <span className={styles.dayNameFull}>{t(day.dayKeyFull)}</span>
              </span>
            </div>
          );
        })}
      </div>

      {/* Next Delivery Callout */}
      {nextDelivery ? (
        <div className={styles.nextDelivery}>
          <Calendar className={styles.nextDeliveryIcon} />
          <span className={styles.nextDeliveryText}>
            {t('deliverySchedule.nextDelivery')}:{' '}
            <span className={styles.nextDeliveryValue}>{nextDelivery.label}</span>
          </span>
        </div>
      ) : (
        <div className={styles.noService}>
          <span className={styles.noServiceText}>
            {t('deliverySchedule.noService')}
          </span>
        </div>
      )}
    </div>
  );
};
