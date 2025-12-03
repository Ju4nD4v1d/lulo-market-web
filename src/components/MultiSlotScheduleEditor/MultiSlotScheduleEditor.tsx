/**
 * MultiSlotScheduleEditor - Reusable component for editing weekly schedules
 *
 * Supports up to 3 time slots per day with validation for:
 * - Time order (open < close)
 * - No overlapping slots
 * - Maximum slots per day
 *
 * Used by:
 * - Store setup (delivery hours)
 * - Driver management (availability)
 */

import { DayOfWeek, MultiSlotSchedule, DaySchedule, DAYS_OF_WEEK_MONDAY_FIRST } from '../../types/schedule';
import { DayRow } from './DayRow';
import styles from './MultiSlotScheduleEditor.module.css';

interface MultiSlotScheduleEditorProps {
  schedule: MultiSlotSchedule;
  onChange: (schedule: MultiSlotSchedule) => void;
  className?: string;
}

export const MultiSlotScheduleEditor: React.FC<MultiSlotScheduleEditorProps> = ({
  schedule,
  onChange,
  className,
}) => {
  const handleDayChange = (day: DayOfWeek, daySchedule: DaySchedule) => {
    onChange({
      ...schedule,
      [day]: daySchedule,
    });
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      {DAYS_OF_WEEK_MONDAY_FIRST.map((day) => (
        <DayRow
          key={day}
          day={day}
          schedule={schedule[day]}
          onChange={(daySchedule) => handleDayChange(day, daySchedule)}
        />
      ))}
    </div>
  );
};

export default MultiSlotScheduleEditor;
