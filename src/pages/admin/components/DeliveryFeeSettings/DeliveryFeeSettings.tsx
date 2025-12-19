/**
 * DeliveryFeeSettings - Admin configuration panel for delivery fee settings
 *
 * Editable form for all delivery fee config values with confirmation dialog on save.
 * Changes are persisted to Firestore (deliveryFeeConfig collection).
 */

import { useState } from 'react';
import { Settings, Plus, Trash2, Loader2 } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';
import { useAuth } from '../../../../context/AuthContext';
import { ConfirmDialog } from '../../../../components/ConfirmDialog';
import { UNLIMITED_DISTANCE } from '../../../../services/delivery/constants';
import { useDeliveryFeeSettings } from './hooks/useDeliveryFeeSettings';
import type { DistanceTier } from '../../../../services/delivery/types';
import styles from './DeliveryFeeSettings.module.css';

export function DeliveryFeeSettings() {
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
    setBaseFee,
    setMinFee,
    setMaxFee,
    setMaxDeliveryDistance,
    setDiscountPercentage,
    setDiscountEligibleOrders,
    updateTier,
    addTier,
    removeTier,
    saveConfig,
    resetToDefaults,
    discardChanges,
  } = useDeliveryFeeSettings();

  const handleSaveClick = () => {
    setShowSaveConfirm(true);
  };

  const handleConfirmSave = async () => {
    if (!currentUser?.uid) {
      console.error('Cannot save: User not authenticated');
      return;
    }
    try {
      console.log('Saving delivery fee config for user:', currentUser.uid);
      await saveConfig(currentUser.uid);
      console.log('Delivery fee config saved successfully');
    } catch (err) {
      console.error('Failed to save delivery fee config:', err);
      // Error is already set in the hook, but re-throw to keep dialog open
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

  const handleInputChange = (
    index: number,
    field: keyof DistanceTier,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseFloat(e.target.value) || 0;
    updateTier(index, field, value);
  };

  const formatToKm = (value: number): string => {
    return value >= UNLIMITED_DISTANCE ? '' : value.toString();
  };

  if (isLoading) {
    return (
      <div className={styles.settingsSection}>
        <div className={styles.loadingState}>
          <Loader2 className={styles.spinner} />
          <span>{t('deliveryFeeSettings.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.settingsSection}>
      {/* Section Header */}
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleGroup}>
          <Settings className={styles.sectionIcon} />
          <div>
            <h2 className={styles.sectionTitle}>{t('deliveryFeeSettings.title')}</h2>
            <p className={styles.sectionSubtitle}>{t('deliveryFeeSettings.subtitle')}</p>
          </div>
        </div>
        {isDirty && (
          <span className={styles.unsavedBadge}>{t('deliveryFeeSettings.unsavedChanges')}</span>
        )}
      </div>

      {/* Error Message */}
      {error && <div className={styles.errorMessage}>{error}</div>}

      {/* Section Content */}
      <div className={styles.sectionContent}>
        {/* Fee Configuration Grid */}
        <div className={styles.configGrid}>
          <div className={styles.configField}>
            <label className={styles.configLabel}>{t('deliveryFeeSettings.baseFee')}</label>
            <div className={styles.currencyInputWrapper}>
              <span className={styles.currencyPrefix}>$</span>
              <input
                type="number"
                value={config.baseFee}
                min={0}
                step={0.5}
                onChange={(e) => setBaseFee(parseFloat(e.target.value) || 0)}
                className={styles.currencyInput}
              />
            </div>
          </div>

          <div className={styles.configField}>
            <label className={styles.configLabel}>{t('deliveryFeeSettings.minFee')}</label>
            <div className={styles.currencyInputWrapper}>
              <span className={styles.currencyPrefix}>$</span>
              <input
                type="number"
                value={config.minFee}
                min={0}
                step={0.5}
                onChange={(e) => setMinFee(parseFloat(e.target.value) || 0)}
                className={styles.currencyInput}
              />
            </div>
          </div>

          <div className={styles.configField}>
            <label className={styles.configLabel}>{t('deliveryFeeSettings.maxFee')}</label>
            <div className={styles.currencyInputWrapper}>
              <span className={styles.currencyPrefix}>$</span>
              <input
                type="number"
                value={config.maxFee}
                min={0}
                step={0.5}
                onChange={(e) => setMaxFee(parseFloat(e.target.value) || 0)}
                className={styles.currencyInput}
              />
            </div>
          </div>

          <div className={styles.configField}>
            <label className={styles.configLabel}>{t('deliveryFeeSettings.maxDeliveryDistance')}</label>
            <div className={styles.currencyInputWrapper}>
              <input
                type="number"
                value={config.maxDeliveryDistance ?? 60}
                min={1}
                step={1}
                onChange={(e) => setMaxDeliveryDistance(parseFloat(e.target.value) || 60)}
                className={styles.currencyInput}
              />
              <span className={styles.currencySuffix}>km</span>
            </div>
          </div>
        </div>

        {/* Distance Tiers Editor */}
        <div className={styles.tierEditor}>
          <h3 className={styles.tierTitle}>{t('deliveryFeeSettings.distanceTiers')}</h3>

          <div className={styles.tierTableWrapper}>
            <table className={styles.tierTable}>
              <thead>
                <tr>
                  <th>{t('deliveryFeeSettings.from')}</th>
                  <th>{t('deliveryFeeSettings.to')}</th>
                  <th>{t('deliveryFeeSettings.rate')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {config.tiers.map((tier, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        type="number"
                        value={tier.fromKm}
                        min={0}
                        step={1}
                        onChange={(e) => handleInputChange(index, 'fromKm', e)}
                        className={styles.tierInput}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={formatToKm(tier.toKm)}
                        min={tier.fromKm}
                        step={1}
                        placeholder={t('deliveryFeeSettings.unlimited')}
                        onChange={(e) => {
                          const value =
                            e.target.value === ''
                              ? UNLIMITED_DISTANCE
                              : parseFloat(e.target.value) || 0;
                          updateTier(index, 'toKm', value);
                        }}
                        className={styles.tierInput}
                      />
                    </td>
                    <td>
                      <div className={styles.rateInputWrapper}>
                        <span className={styles.currencyPrefix}>$</span>
                        <input
                          type="number"
                          value={tier.ratePerKm}
                          min={0}
                          step={0.05}
                          onChange={(e) => handleInputChange(index, 'ratePerKm', e)}
                          className={styles.tierInput}
                        />
                      </div>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => removeTier(index)}
                        disabled={config.tiers.length <= 1}
                        className={styles.removeButton}
                        title={t('deliveryFeeSettings.removeTier')}
                      >
                        <Trash2 className={styles.removeIcon} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button type="button" onClick={addTier} className={styles.addTierButton}>
            <Plus className={styles.addTierIcon} />
            {t('deliveryFeeSettings.addTier')}
          </button>
        </div>

        {/* New Customer Discount Section */}
        <div className={styles.tierEditor}>
          <h3 className={styles.tierTitle}>{t('deliveryFeeSettings.newCustomerDiscount')}</h3>
          <div className={styles.configGrid}>
            <div className={styles.configField}>
              <label className={styles.configLabel}>{t('deliveryFeeSettings.discountPercentage')}</label>
              <div className={styles.currencyInputWrapper}>
                <input
                  type="number"
                  value={Math.round((config.discountPercentage ?? 0.20) * 100)}
                  min={0}
                  max={100}
                  step={1}
                  onChange={(e) => setDiscountPercentage((parseFloat(e.target.value) || 0) / 100)}
                  className={styles.currencyInput}
                />
                <span className={styles.currencySuffix}>%</span>
              </div>
            </div>

            <div className={styles.configField}>
              <label className={styles.configLabel}>{t('deliveryFeeSettings.discountEligibleOrders')}</label>
              <div className={styles.currencyInputWrapper}>
                <input
                  type="number"
                  value={config.discountEligibleOrders ?? 3}
                  min={0}
                  max={100}
                  step={1}
                  onChange={(e) => setDiscountEligibleOrders(parseInt(e.target.value) || 0)}
                  className={styles.currencyInput}
                />
                <span className={styles.currencySuffix}>{t('deliveryFeeSettings.orders')}</span>
              </div>
            </div>
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
            {t('deliveryFeeSettings.resetToDefaults')}
          </button>

          {isDirty && (
            <button
              type="button"
              onClick={discardChanges}
              className={styles.discardButton}
              disabled={isSaving}
            >
              {t('deliveryFeeSettings.discardChanges')}
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
                {t('deliveryFeeSettings.saving')}
              </>
            ) : (
              t('deliveryFeeSettings.saveChanges')
            )}
          </button>
        </div>
      </div>

      {/* Save Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={handleConfirmSave}
        title={t('deliveryFeeSettings.confirmSave.title')}
        message={t('deliveryFeeSettings.confirmSave.message')}
        confirmText={t('deliveryFeeSettings.confirmSave.confirm')}
        cancelText={t('deliveryFeeSettings.confirmSave.cancel')}
        variant="info"
      />

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleConfirmReset}
        title={t('deliveryFeeSettings.confirmReset.title')}
        message={t('deliveryFeeSettings.confirmReset.message')}
        confirmText={t('deliveryFeeSettings.confirmReset.confirm')}
        cancelText={t('deliveryFeeSettings.confirmReset.cancel')}
        variant="warning"
      />
    </div>
  );
}
