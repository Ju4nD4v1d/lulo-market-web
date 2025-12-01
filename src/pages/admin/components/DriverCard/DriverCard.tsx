/**
 * DriverCard - Displays a driver's information in a card format
 */

import {
  MapPin,
  Calendar,
  Phone,
  Mail,
  Edit2,
  Trash2,
  Power,
  Loader2,
} from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';
import { Driver, DAYS_OF_WEEK } from '../../../../types/driver';
import styles from './DriverCard.module.css';

interface DriverCardProps {
  driver: Driver;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  isDeleting: boolean;
  isToggling: boolean;
}

export const DriverCard = ({
  driver,
  onEdit,
  onDelete,
  onToggleStatus,
  isDeleting,
  isToggling,
}: DriverCardProps) => {
  const { t } = useLanguage();

  // Get available days summary
  const availableDays = DAYS_OF_WEEK.filter((day) => {
    const slot = driver.availabilitySchedule[day];
    return slot && !slot.closed;
  }).map((day) => day.slice(0, 3)); // Abbreviate to 3 letters

  return (
    <div className={`${styles.card} ${!driver.isActive ? styles.inactive : ''}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <h3 className={styles.name}>{driver.name}</h3>
          <span
            className={`${styles.statusBadge} ${driver.isActive ? styles.active : styles.inactive}`}
          >
            {driver.isActive ? t('driver.active') : t('driver.inactive')}
          </span>
        </div>
        <div className={styles.actions}>
          <button
            className={`${styles.actionButton} ${styles.toggleButton}`}
            onClick={onToggleStatus}
            disabled={isToggling}
            title={driver.isActive ? t('driver.inactive') : t('driver.active')}
          >
            {isToggling ? (
              <Loader2 className={styles.loadingIcon} />
            ) : (
              <Power className={styles.actionIcon} />
            )}
          </button>
          <button
            className={styles.actionButton}
            onClick={onEdit}
            title={t('driver.edit')}
          >
            <Edit2 className={styles.actionIcon} />
          </button>
          <button
            className={`${styles.actionButton} ${styles.deleteButton}`}
            onClick={onDelete}
            disabled={isDeleting}
            title={t('driver.delete')}
          >
            {isDeleting ? (
              <Loader2 className={styles.loadingIcon} />
            ) : (
              <Trash2 className={styles.actionIcon} />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Address */}
        <div className={styles.infoRow}>
          <MapPin className={styles.infoIcon} />
          <div className={styles.infoText}>
            <span className={styles.infoLabel}>{t('driver.startingAddress')}</span>
            <span className={styles.infoValue}>
              {driver.startingAddress.street}
              {driver.startingAddress.city && `, ${driver.startingAddress.city}`}
            </span>
          </div>
        </div>

        {/* Schedule */}
        <div className={styles.infoRow}>
          <Calendar className={styles.infoIcon} />
          <div className={styles.infoText}>
            <span className={styles.infoLabel}>{t('driver.schedule')}</span>
            <div className={styles.dayPills}>
              {availableDays.length > 0 ? (
                availableDays.map((day) => (
                  <span key={day} className={styles.dayPill}>
                    {day}
                  </span>
                ))
              ) : (
                <span className={styles.noDays}>{t('schedule.closed')}</span>
              )}
            </div>
          </div>
        </div>

        {/* Contact Info */}
        {(driver.phone || driver.email) && (
          <div className={styles.contactInfo}>
            {driver.phone && (
              <div className={styles.contactRow}>
                <Phone className={styles.contactIcon} />
                <span>{driver.phone}</span>
              </div>
            )}
            {driver.email && (
              <div className={styles.contactRow}>
                <Mail className={styles.contactIcon} />
                <span>{driver.email}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverCard;
