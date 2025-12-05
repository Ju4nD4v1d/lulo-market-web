/**
 * DeliverySchedule - Clean display of store delivery days and times
 *
 * Mobile: Compact list with next delivery highlighted at top
 * Desktop: Horizontal week view showing all days at a glance
 */

import { Truck, Clock, Loader2 } from 'lucide-react';
import { StoreData } from '../../../types/store';
import { useLanguage } from '../../../context/LanguageContext';
import { useEffectiveHours } from '../../../hooks/useEffectiveHours';
import { formatTime12Hour } from '../../../utils/scheduleUtils';
import { DayOfWeek } from '../../../types/schedule';
import styles from './DeliverySchedule.module.css';

interface DeliveryScheduleProps {
  store: StoreData;
}

interface DayInfo {
  dayIndex: number;
  dayName: DayOfWeek;
  dayKeyFull: string;
  dayKeyShort: string;
  isOpen: boolean;
  timeWindows: string[];
}

export const DeliverySchedule = ({ store }: DeliveryScheduleProps) => {
  const { t } = useLanguage();
  const { effectiveHours, nextAvailableDay, isLoading } = useEffectiveHours({ store });

  const daysConfig: Array<{ dayName: DayOfWeek; fullKey: string; shortKey: string }> = [
    { dayName: 'Sunday', fullKey: 'days.sunday', shortKey: 'days.sun' },
    { dayName: 'Monday', fullKey: 'days.monday', shortKey: 'days.mon' },
    { dayName: 'Tuesday', fullKey: 'days.tuesday', shortKey: 'days.tue' },
    { dayName: 'Wednesday', fullKey: 'days.wednesday', shortKey: 'days.wed' },
    { dayName: 'Thursday', fullKey: 'days.thursday', shortKey: 'days.thu' },
    { dayName: 'Friday', fullKey: 'days.friday', shortKey: 'days.fri' },
    { dayName: 'Saturday', fullKey: 'days.saturday', shortKey: 'days.sat' },
  ];

  const getOpenDays = (): DayInfo[] => {
    if (!effectiveHours) return [];

    return daysConfig
      .map((config, index) => {
        const daySchedule = effectiveHours[config.dayName];
        const isOpen = daySchedule && !daySchedule.closed && daySchedule.slots.length > 0;

        const timeWindows: string[] = [];
        if (isOpen && daySchedule) {
          for (const slot of daySchedule.slots) {
            timeWindows.push(`${formatTime12Hour(slot.open)} - ${formatTime12Hour(slot.close)}`);
          }
        }

        return {
          dayIndex: index,
          dayName: config.dayName,
          dayKeyFull: config.fullKey,
          dayKeyShort: config.shortKey,
          isOpen: Boolean(isOpen),
          timeWindows,
        };
      })
      .filter((day) => day.isOpen);
  };

  const getNextDeliveryLabel = (): string | null => {
    if (!nextAvailableDay) return null;

    if (nextAvailableDay.isToday) {
      return t('deliverySchedule.today');
    }

    if (nextAvailableDay.isTomorrow) {
      return t('deliverySchedule.tomorrow');
    }

    const config = daysConfig.find(c => c.dayName === nextAvailableDay.day);
    return config ? t(config.fullKey) : nextAvailableDay.day;
  };

  const openDays = getOpenDays();
  const nextDeliveryLabel = getNextDeliveryLabel();
  const today = new Date().getDay();

  // Sort days from closest to furthest (starting from today)
  const sortedOpenDays = [...openDays].sort((a, b) => {
    // Calculate days until each day from today
    const daysUntilA = (a.dayIndex - today + 7) % 7;
    const daysUntilB = (b.dayIndex - today + 7) % 7;
    return daysUntilA - daysUntilB;
  });

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <Loader2 className={styles.loadingIcon} />
        </div>
      </div>
    );
  }

  if (openDays.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <Truck className={styles.headerIcon} />
          <span className={styles.title}>{t('deliverySchedule.title')}</span>
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
        <span className={styles.title}>{t('deliverySchedule.title')}</span>
        {nextDeliveryLabel && (
          <span className={styles.nextDelivery}>
            {t('deliverySchedule.nextDelivery')}: <strong>{nextDeliveryLabel}</strong>
          </span>
        )}
      </div>

      {/* Schedule - Mobile: List / Desktop: Grid */}
      <div className={styles.schedule}>
        {sortedOpenDays.map((day) => {
          const isToday = day.dayIndex === today;

          return (
            <div
              key={day.dayIndex}
              className={`${styles.dayItem} ${isToday ? styles.dayItemToday : ''}`}
            >
              <div className={styles.dayName}>
                <span className={styles.dayNameShort}>{t(day.dayKeyShort)}</span>
                <span className={styles.dayNameFull}>{t(day.dayKeyFull)}</span>
                {isToday && <span className={styles.todayBadge}>{t('deliverySchedule.today')}</span>}
              </div>
              <div className={styles.timeSlots}>
                {day.timeWindows.map((window, idx) => (
                  <span key={idx} className={styles.timeSlot}>
                    <Clock className={styles.clockIcon} />
                    {window}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
