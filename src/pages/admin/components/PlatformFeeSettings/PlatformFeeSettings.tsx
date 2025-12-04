/**
 * PlatformFeeSettings - Admin configuration panel for platform fee settings
 *
 * Simple form for configuring the platform fee (Comisión de Plataforma).
 * Changes are persisted to Firestore (platformFeeConfig collection).
 */

import { useState } from 'react';
import { DollarSign, Loader2 } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';
import { useAuth } from '../../../../context/AuthContext';
import { ConfirmDialog } from '../../../../components/ConfirmDialog';
import { usePlatformFeeSettings, PLATFORM_FEE_LIMITS } from './hooks/usePlatformFeeSettings';
import styles from './PlatformFeeSettings.module.css';

export function PlatformFeeSettings() {
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const {
    config,
    isLoading,
    isSaving,
    error,
    isDirty,
    setFixedAmount,
    setEnabled,
    saveConfig,
    resetToDefaults,
    discardChanges,
  } = usePlatformFeeSettings();

  const handleSaveClick = () => {
    setShowSaveConfirm(true);
  };

  const handleConfirmSave = async () => {
    if (!currentUser?.uid) {
      console.error('Cannot save: User not authenticated');
      return;
    }
    try {
      await saveConfig(currentUser.uid);
    } catch (err) {
      console.error('Failed to save platform fee config:', err);
      throw err;
    }
  };

  const handleResetClick = () => {
    setShowResetConfirm(true);
  };

  const handleConfirmReset = async () => {
    if (currentUser?.uid) {
      await resetToDefaults(currentUser.uid);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.settingsSection}>
        <div className={styles.loadingState}>
          <Loader2 className={styles.spinner} />
          <span>{t('admin.platformFee.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.settingsSection}>
      {/* Section Header */}
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleGroup}>
          <DollarSign className={styles.sectionIcon} />
          <div>
            <h2 className={styles.sectionTitle}>{t('admin.platformFee.title')}</h2>
            <p className={styles.sectionSubtitle}>{t('admin.platformFee.subtitle')}</p>
          </div>
        </div>
        {isDirty && (
          <span className={styles.unsavedBadge}>{t('admin.platformFee.unsavedChanges')}</span>
        )}
      </div>

      {/* Error Message */}
      {error && <div className={styles.errorMessage}>{error}</div>}

      {/* Section Content */}
      <div className={styles.sectionContent}>
        {/* Enable/Disable Toggle */}
        <div className={styles.toggleRow}>
          <span className={styles.toggleLabel}>{t('admin.platformFee.enabled')}</span>
          <button
            type="button"
            onClick={() => setEnabled(!config.enabled)}
            className={`${styles.toggleSwitch} ${config.enabled ? styles.toggleOn : ''}`}
            aria-pressed={config.enabled}
          >
            <span className={styles.toggleKnob} />
          </button>
        </div>

        {/* Fee Configuration */}
        <div className={styles.configGrid}>
          <div className={styles.configField}>
            <label className={styles.configLabel}>{t('admin.platformFee.fixedAmount')}</label>
            <div className={styles.currencyInputWrapper}>
              <span className={styles.currencyPrefix}>$</span>
              <input
                type="number"
                value={config.fixedAmount}
                min={PLATFORM_FEE_LIMITS.MIN}
                max={PLATFORM_FEE_LIMITS.MAX}
                step={0.01}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  // Allow clearing the field (NaN) but validate on actual numbers
                  setFixedAmount(isNaN(value) ? 0 : value);
                }}
                className={styles.currencyInput}
                disabled={!config.enabled}
              />
            </div>
            <span className={styles.configHint}>{t('admin.platformFee.hint')}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actions}>
          <button
            type="button"
            onClick={handleResetClick}
            className={styles.resetButton}
            disabled={isSaving}
          >
            {t('admin.platformFee.resetToDefaults')}
          </button>

          {isDirty && (
            <button
              type="button"
              onClick={discardChanges}
              className={styles.discardButton}
              disabled={isSaving}
            >
              {t('admin.platformFee.discardChanges')}
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveClick}
            className={styles.saveButton}
            disabled={!isDirty || isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className={styles.spinner} />
                {t('admin.platformFee.saving')}
              </>
            ) : (
              t('admin.platformFee.saveChanges')
            )}
          </button>
        </div>
      </div>

      {/* Save Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={handleConfirmSave}
        title={t('admin.platformFee.confirmSave.title')}
        message={t('admin.platformFee.confirmSave.message')}
        confirmText={t('admin.platformFee.confirmSave.confirm')}
        cancelText={t('admin.platformFee.confirmSave.cancel')}
        variant="info"
      />

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleConfirmReset}
        title={t('admin.platformFee.confirmReset.title')}
        message={t('admin.platformFee.confirmReset.message')}
        confirmText={t('admin.platformFee.confirmReset.confirm')}
        cancelText={t('admin.platformFee.confirmReset.cancel')}
        variant="warning"
      />
    </div>
  );
}
