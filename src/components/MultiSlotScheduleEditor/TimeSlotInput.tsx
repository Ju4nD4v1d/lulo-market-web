/**
 * TimeSlotInput - Individual time slot with from/to time pickers
 *
 * Design: Clean card with labeled time inputs and formatted AM/PM display
 * Mobile: Stacked layout
 * Desktop: Inline layout
 */

import { Trash2, AlertCircle, Clock } from 'lucide-react';
import { TimeSlot } from '../../types/schedule';
import { isValidTimeSlot, formatTime12Hour } from '../../utils/scheduleUtils';
import { useLanguage } from '../../context/LanguageContext';
import styles from './MultiSlotScheduleEditor.module.css';

interface TimeSlotInputProps {
  slot: TimeSlot;
  index: number;
  onChange: (slot: TimeSlot) => void;
  onDelete: () => void;
  canDelete: boolean;
  hasOverlapError?: boolean;
  showErrorMessages?: boolean;
}

export const TimeSlotInput: React.FC<TimeSlotInputProps> = ({
  slot,
  index,
  onChange,
  onDelete,
  canDelete,
  hasOverlapError = false,
  showErrorMessages = true,
}) => {
  const { t } = useLanguage();
  const isValid = isValidTimeSlot(slot);
  const hasError = !isValid || hasOverlapError;

  const handleOpenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...slot, open: e.target.value });
  };

  const handleCloseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...slot, close: e.target.value });
  };

  const getErrorMessage = (): string | null => {
    if (!showErrorMessages) return null;
    if (!isValid) return t('schedule.invalidTime');
    if (hasOverlapError) return t('schedule.slotOverlap');
    return null;
  };

  const errorMessage = getErrorMessage();

  return (
    <div className={styles.slotContainer}>
      <div className={`${styles.slotCard} ${hasError ? styles.slotCardError : ''}`}>
        {/* Slot number */}
        <div className={styles.slotNumber}>{index + 1}</div>

        {/* Time range */}
        <div className={styles.timeRange}>
          {/* From */}
          <div className={styles.timeBlock}>
            <span className={styles.timeLabel}>{t('schedule.from')}</span>
            <div className={styles.timePickerWrapper}>
              <input
                type="time"
                value={slot.open}
                onChange={handleOpenChange}
                className={styles.timePicker}
                aria-label="Start time"
              />
              <div className={styles.timeValueDisplay}>
                <Clock className={styles.clockIcon} />
                <span className={styles.timeValue}>{formatTime12Hour(slot.open)}</span>
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className={styles.timeSeparatorBlock}>
            <span className={styles.timeSeparatorText}>→</span>
          </div>

          {/* To */}
          <div className={styles.timeBlock}>
            <span className={styles.timeLabel}>{t('schedule.to')}</span>
            <div className={styles.timePickerWrapper}>
              <input
                type="time"
                value={slot.close}
                onChange={handleCloseChange}
                className={styles.timePicker}
                aria-label="End time"
              />
              <div className={styles.timeValueDisplay}>
                <Clock className={styles.clockIcon} />
                <span className={styles.timeValue}>{formatTime12Hour(slot.close)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delete button */}
        {canDelete && (
          <button
            type="button"
            onClick={onDelete}
            className={styles.deleteBtn}
            aria-label="Delete time slot"
          >
            <Trash2 className={styles.deleteBtnIcon} />
          </button>
        )}
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className={styles.slotErrorMsg}>
          <AlertCircle className={styles.slotErrorIcon} />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
