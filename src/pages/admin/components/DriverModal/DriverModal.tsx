/**
 * DriverModal - Modal for adding/editing drivers
 */

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';
import { useDriverMutations } from '../../../../hooks/mutations/useDriverMutations';
import { ScheduleEditor } from '../ScheduleEditor';
import {
  Driver,
  DriverSchedule,
  DriverAddress,
  DEFAULT_DRIVER_SCHEDULE,
} from '../../../../types/driver';
import styles from './DriverModal.module.css';

interface DriverModalProps {
  driver: Driver | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const DriverModal = ({ driver, onClose, onSuccess }: DriverModalProps) => {
  const { t } = useLanguage();
  const { createDriver, updateDriver, isCreating, isUpdating } = useDriverMutations();
  const isEditing = !!driver;
  const isLoading = isCreating || isUpdating;

  // Form state
  const [name, setName] = useState(driver?.name || '');
  const [phone, setPhone] = useState(driver?.phone || '');
  const [email, setEmail] = useState(driver?.email || '');
  const [notes, setNotes] = useState(driver?.notes || '');
  const [address, setAddress] = useState<DriverAddress>(
    driver?.startingAddress || {
      street: '',
      city: '',
      province: 'BC',
      postalCode: '',
    }
  );
  const [schedule, setSchedule] = useState<DriverSchedule>(
    driver?.availabilitySchedule || DEFAULT_DRIVER_SCHEDULE
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!name.trim()) {
      setError(t('driver.form.nameRequired'));
      return;
    }

    try {
      if (isEditing && driver) {
        await updateDriver.mutateAsync({
          driverId: driver.id,
          data: {
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim(),
            notes: notes.trim(),
            startingAddress: address,
            availabilitySchedule: schedule,
          },
        });
      } else {
        await createDriver.mutateAsync({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          notes: notes.trim(),
          startingAddress: address,
          availabilitySchedule: schedule,
          isActive: true,
        });
      }
      onSuccess();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            {isEditing ? t('driver.modal.editTitle') : t('driver.modal.addTitle')}
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X className={styles.closeIcon} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          {/* Basic Info */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{t('driver.form.basicInfo') || 'Basic Information'}</h3>
            <div className={styles.field}>
              <label className={styles.label}>{t('driver.form.name')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('driver.form.namePlaceholder')}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>{t('driver.phone')}</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(604) 555-0123"
                  className={styles.input}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>{t('driver.email')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="driver@example.com"
                  className={styles.input}
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{t('driver.startingAddress')}</h3>
            <div className={styles.field}>
              <label className={styles.label}>{t('address.street') || 'Street'}</label>
              <input
                type="text"
                value={address.street}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
                placeholder="123 Main Street"
                className={styles.input}
              />
            </div>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>{t('address.city') || 'City'}</label>
                <input
                  type="text"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  placeholder="Vancouver"
                  className={styles.input}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>{t('address.province') || 'Province'}</label>
                <input
                  type="text"
                  value={address.province}
                  onChange={(e) => setAddress({ ...address, province: e.target.value })}
                  placeholder="BC"
                  className={styles.input}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>{t('address.postalCode') || 'Postal Code'}</label>
                <input
                  type="text"
                  value={address.postalCode}
                  onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                  placeholder="V6B 1A1"
                  className={styles.input}
                />
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{t('driver.schedule')}</h3>
            <ScheduleEditor schedule={schedule} onChange={setSchedule} />
          </div>

          {/* Notes */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{t('driver.notes')}</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('driver.form.notesPlaceholder') || 'Any additional notes...'}
              className={styles.textarea}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={isLoading}
            >
              {t('driver.form.cancel')}
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className={styles.loadingIcon} />
                  {t('driver.form.saving')}
                </>
              ) : (
                t('driver.form.save')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriverModal;
