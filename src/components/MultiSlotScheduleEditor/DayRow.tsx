/**
 * DayRow - Single day row with toggle and time slots
 */

import { Plus } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { DayOfWeek, DaySchedule, TimeSlot, MAX_SLOTS_PER_DAY } from '../../types/schedule';
import { createEmptySlot, sortSlots, slotsOverlap } from '../../utils/scheduleUtils';
import { TimeSlotInput } from './TimeSlotInput';
import styles from './MultiSlotScheduleEditor.module.css';

interface DayRowProps {
  day: DayOfWeek;
  schedule: DaySchedule;
  onChange: (schedule: DaySchedule) => void;
}

export const DayRow: React.FC<DayRowProps> = ({ day, schedule, onChange }) => {
  const { t } = useLanguage();

  const handleToggle = (checked: boolean) => {
    if (checked) {
      // Opening the day - add a default slot if empty
      const slots = schedule.slots.length > 0 ? schedule.slots : [createEmptySlot()];
      onChange({ closed: false, slots });
    } else {
      // Closing the day - keep slots for if they reopen
      onChange({ ...schedule, closed: true });
    }
  };

  const handleSlotChange = (index: number, updatedSlot: TimeSlot) => {
    const newSlots = [...schedule.slots];
    newSlots[index] = updatedSlot;
    onChange({ ...schedule, slots: sortSlots(newSlots) });
  };

  const handleSlotDelete = (index: number) => {
    const newSlots = schedule.slots.filter((_, i) => i !== index);
    // If no slots left, close the day
    if (newSlots.length === 0) {
      onChange({ closed: true, slots: [] });
    } else {
      onChange({ ...schedule, slots: newSlots });
    }
  };

  const handleAddSlot = () => {
    if (schedule.slots.length >= MAX_SLOTS_PER_DAY) return;

    const lastSlot = schedule.slots[schedule.slots.length - 1];
    const newSlot = createEmptySlot(lastSlot);
    onChange({ ...schedule, slots: sortSlots([...schedule.slots, newSlot]) });
  };

  // Check for overlaps between slots
  const getOverlapIndexes = (): Set<number> => {
    const overlapIndexes = new Set<number>();
    for (let i = 0; i < schedule.slots.length; i++) {
      for (let j = i + 1; j < schedule.slots.length; j++) {
        if (slotsOverlap(schedule.slots[i], schedule.slots[j])) {
          overlapIndexes.add(i);
          overlapIndexes.add(j);
        }
      }
    }
    return overlapIndexes;
  };

  const overlapIndexes = getOverlapIndexes();
  const canAddSlot = !schedule.closed && schedule.slots.length < MAX_SLOTS_PER_DAY;
  const dayName = t(`day.${day.toLowerCase()}`) || day;

  return (
    <div className={styles.dayRow}>
      <div className={styles.dayHeader}>
        <span className={styles.dayName}>{dayName}</span>
        <label className={styles.toggleWrapper}>
          <input
            type="checkbox"
            checked={!schedule.closed}
            onChange={(e) => handleToggle(e.target.checked)}
            className={styles.checkbox}
          />
          <span className={styles.toggleLabel}>
            {schedule.closed ? t('store.closed') : t('store.open')}
          </span>
        </label>
      </div>

      {!schedule.closed && (
        <div className={styles.slotsContainer}>
          {schedule.slots.map((slot, index) => (
            <TimeSlotInput
              key={index}
              slot={slot}
              index={index}
              onChange={(updated) => handleSlotChange(index, updated)}
              onDelete={() => handleSlotDelete(index)}
              canDelete={schedule.slots.length > 1}
              hasOverlapError={overlapIndexes.has(index)}
            />
          ))}

          {canAddSlot && (
            <button
              type="button"
              onClick={handleAddSlot}
              className={styles.addSlotButton}
            >
              <Plus className={styles.addSlotIcon} />
              {t('schedule.addSlot')}
            </button>
          )}

          {overlapIndexes.size > 0 && (
            <p className={styles.errorMessage}>{t('schedule.slotOverlap')}</p>
          )}
        </div>
      )}

      {schedule.closed && (
        <div className={styles.closedLabel}>
          <span className={styles.closedText}>{t('store.closed')}</span>
        </div>
      )}
    </div>
  );
};
