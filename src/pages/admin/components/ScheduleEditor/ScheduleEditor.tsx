/**
 * ScheduleEditor - Component for editing a weekly availability schedule
 */

import { useLanguage } from '../../../../context/LanguageContext';
import { DriverSchedule, DAYS_OF_WEEK, DayOfWeek } from '../../../../types/driver';
import styles from './ScheduleEditor.module.css';

interface ScheduleEditorProps {
  schedule: DriverSchedule;
  onChange: (schedule: DriverSchedule) => void;
}

export const ScheduleEditor = ({ schedule, onChange }: ScheduleEditorProps) => {
  const { t } = useLanguage();

  const handleDayToggle = (day: DayOfWeek, checked: boolean) => {
    onChange({
      ...schedule,
      [day]: {
        ...schedule[day],
        closed: !checked,
      },
    });
  };

  const handleTimeChange = (
    day: DayOfWeek,
    field: 'open' | 'close',
    value: string
  ) => {
    onChange({
      ...schedule,
      [day]: {
        ...schedule[day],
        [field]: value,
      },
    });
  };

  const dayNames: Record<DayOfWeek, string> = {
    Sunday: t('schedule.sunday') || 'Sunday',
    Monday: t('schedule.monday') || 'Monday',
    Tuesday: t('schedule.tuesday') || 'Tuesday',
    Wednesday: t('schedule.wednesday') || 'Wednesday',
    Thursday: t('schedule.thursday') || 'Thursday',
    Friday: t('schedule.friday') || 'Friday',
    Saturday: t('schedule.saturday') || 'Saturday',
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.headerDay}>{t('schedule.day')}</span>
        <span className={styles.headerAvailable}>{t('schedule.available')}</span>
        <span className={styles.headerOpen}>{t('schedule.open')}</span>
        <span className={styles.headerClose}>{t('schedule.close')}</span>
      </div>
      <div className={styles.rows}>
        {DAYS_OF_WEEK.map((day) => {
          const slot = schedule[day];
          const isAvailable = !slot.closed;

          return (
            <div key={day} className={styles.row}>
              <span className={styles.dayName}>{dayNames[day]}</span>
              <label className={styles.toggleWrapper}>
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => handleDayToggle(day, e.target.checked)}
                  className={styles.checkbox}
                />
                <span className={styles.toggle} />
              </label>
              <input
                type="time"
                value={slot.open}
                onChange={(e) => handleTimeChange(day, 'open', e.target.value)}
                disabled={!isAvailable}
                className={styles.timeInput}
              />
              <input
                type="time"
                value={slot.close}
                onChange={(e) => handleTimeChange(day, 'close', e.target.value)}
                disabled={!isAvailable}
                className={styles.timeInput}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScheduleEditor;
