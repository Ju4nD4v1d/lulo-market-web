import { Truck, Calendar, Loader2 } from 'lucide-react';
import { StoreData } from '../../../types/store';
import { useLanguage } from '../../../context/LanguageContext';
import { useEffectiveHours } from '../../../hooks/useEffectiveHours';
import { formatTime12Hour } from '../../../utils/effectiveHours';
import styles from './DeliverySchedule.module.css';

interface DeliveryScheduleProps {
  store: StoreData;
}

interface DayInfo {
  dayIndex: number;
  dayKeyFull: string;
  dayKeyShort: string;
  isOpen: boolean;
  timeWindow: string;
}

/**
 * DeliverySchedule - Shows which days a store delivers
 *
 * Features:
 * - Uses effective hours (intersection of store hours + driver availability)
 * - Only shows days the store is open (hides closed days)
 * - Desktop: Full day names in horizontal row
 * - Mobile: Abbreviated day names with flex wrap
 * - Highlights today with primary color
 * - Shows simplified "Next delivery" indicator
 */
export const DeliverySchedule = ({ store }: DeliveryScheduleProps) => {
  const { t } = useLanguage();
  const { effectiveHours, nextAvailableDay, isLoading } = useEffectiveHours({ store });

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
   * Now uses effectiveHours (intersection of store + driver availability)
   */
  const getOpenDays = (): DayInfo[] => {
    if (!effectiveHours) return [];

    return daysConfig
      .map((config) => {
        const dayName = dayNames[config.index];
        const dayHours = effectiveHours[dayName];
        const isOpen = dayHours && !dayHours.closed;

        // Format time window
        let timeWindow = '';
        if (isOpen && dayHours) {
          timeWindow = `${formatTime12Hour(dayHours.open)} - ${formatTime12Hour(dayHours.close)}`;
        }

        return {
          dayIndex: config.index,
          dayKeyFull: config.fullKey,
          dayKeyShort: config.shortKey,
          isOpen: Boolean(isOpen),
          timeWindow,
        };
      })
      .filter((day) => day.isOpen);
  };

  /**
   * Get next delivery info from hook
   */
  const getNextDelivery = (): { label: string; isToday: boolean } | null => {
    if (!nextAvailableDay) return null;

    if (nextAvailableDay.isToday) {
      return { label: t('deliverySchedule.today'), isToday: true };
    }

    if (nextAvailableDay.isTomorrow) {
      return { label: t('deliverySchedule.tomorrow'), isToday: false };
    }

    // Find the translation key for this day
    const dayIndex = dayNames.indexOf(nextAvailableDay.day);
    if (dayIndex >= 0) {
      return { label: t(daysConfig[dayIndex].fullKey), isToday: false };
    }

    return { label: nextAvailableDay.day, isToday: false };
  };

  const openDays = getOpenDays();
  const nextDelivery = getNextDelivery();
  const today = new Date().getDay();

  // Show loading state while fetching driver availability
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <Truck className={styles.headerIcon} />
          <h2 className={styles.title}>{t('deliverySchedule.title')}</h2>
        </div>
        <div className={styles.loadingState}>
          <Loader2 className={styles.loadingIcon} />
        </div>
      </div>
    );
  }

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

      {/* Schedule List */}
      <div className={styles.scheduleList}>
        {openDays.map((day) => {
          const isToday = day.dayIndex === today;

          return (
            <div
              key={day.dayIndex}
              className={`${styles.scheduleItem} ${isToday ? styles.scheduleItemActive : ''}`}
            >
              <span className={styles.dayName}>
                <span className={styles.dayNameShort}>{t(day.dayKeyShort)}</span>
                <span className={styles.dayNameFull}>{t(day.dayKeyFull)}</span>
                {isToday && <span className={styles.todayBadge}>{t('deliverySchedule.today')}</span>}
              </span>
              <span className={styles.timeWindow}>{day.timeWindow}</span>
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
