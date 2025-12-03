/**
 * DeliveryFeeSimulator - Control panel for configuring and testing delivery fees
 * Phase 1: Manual distance input for testing fee calculations
 * Phase 2 (future): Map-based simulation with store/driver/buyer pins
 */

import { Calculator, ChevronDown, RotateCcw } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';
import { useDeliveryFeeSimulator } from './hooks/useDeliveryFeeSimulator';
import { DistanceTierEditor } from './components/DistanceTierEditor';
import { FeeCalculatorTest } from './components/FeeCalculatorTest';
import styles from './DeliveryFeeSimulator.module.css';

export function DeliveryFeeSimulator() {
  const { t } = useLanguage();
  const {
    config,
    isExpanded,
    toggleExpanded,
    setEnabled,
    setBaseFee,
    setMinFee,
    setMaxFee,
    updateTier,
    addTier,
    removeTier,
    resetToDefaults,
  } = useDeliveryFeeSimulator();

  const handleNumberChange = (
    setter: (value: number) => void,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseFloat(e.target.value) || 0;
    setter(value);
  };

  return (
    <section className={styles.simulatorSection}>
      {/* Collapsible Header */}
      <button
        type="button"
        className={styles.sectionHeader}
        onClick={toggleExpanded}
        aria-expanded={isExpanded}
      >
        <div className={styles.sectionTitleGroup}>
          <Calculator className={styles.sectionIcon} />
          <div>
            <h2 className={styles.sectionTitle}>{t('deliveryFeeSimulator.title')}</h2>
            <p className={styles.sectionSubtitle}>{t('deliveryFeeSimulator.subtitle')}</p>
          </div>
        </div>
        <ChevronDown className={`${styles.chevronIcon} ${isExpanded ? styles.chevronUp : ''}`} />
      </button>

      {isExpanded && (
        <div className={styles.sectionContent}>
          {/* Enable Toggle */}
          <div className={styles.toggleRow}>
            <label htmlFor="enableDynamicFees" className={styles.toggleLabel}>
              {t('deliveryFeeSimulator.enableDynamicFees')}
            </label>
            <button
              type="button"
              id="enableDynamicFees"
              role="switch"
              aria-checked={config.enabled}
              onClick={() => setEnabled(!config.enabled)}
              className={`${styles.toggleSwitch} ${config.enabled ? styles.toggleOn : ''}`}
            >
              <span className={styles.toggleKnob} />
            </button>
          </div>

          {/* Base Configuration Grid */}
          <div className={styles.configGrid}>
            <div className={styles.configField}>
              <label htmlFor="baseFee" className={styles.configLabel}>
                {t('deliveryFeeSimulator.baseFee')}
              </label>
              <div className={styles.currencyInputWrapper}>
                <span className={styles.currencyPrefix}>$</span>
                <input
                  id="baseFee"
                  type="number"
                  value={config.baseFee}
                  min={0}
                  step={0.5}
                  onChange={(e) => handleNumberChange(setBaseFee, e)}
                  className={styles.configInput}
                />
              </div>
            </div>

            <div className={styles.configField}>
              <label htmlFor="minFee" className={styles.configLabel}>
                {t('deliveryFeeSimulator.minFee')}
              </label>
              <div className={styles.currencyInputWrapper}>
                <span className={styles.currencyPrefix}>$</span>
                <input
                  id="minFee"
                  type="number"
                  value={config.minFee}
                  min={0}
                  step={0.5}
                  onChange={(e) => handleNumberChange(setMinFee, e)}
                  className={styles.configInput}
                />
              </div>
            </div>

            <div className={styles.configField}>
              <label htmlFor="maxFee" className={styles.configLabel}>
                {t('deliveryFeeSimulator.maxFee')}
              </label>
              <div className={styles.currencyInputWrapper}>
                <span className={styles.currencyPrefix}>$</span>
                <input
                  id="maxFee"
                  type="number"
                  value={config.maxFee}
                  min={0}
                  step={1}
                  onChange={(e) => handleNumberChange(setMaxFee, e)}
                  className={styles.configInput}
                />
              </div>
            </div>
          </div>

          {/* Distance Tiers */}
          <DistanceTierEditor
            tiers={config.tiers}
            onUpdateTier={updateTier}
            onAddTier={addTier}
            onRemoveTier={removeTier}
          />

          {/* Test Calculator */}
          <FeeCalculatorTest config={config} />

          {/* Reset Button */}
          <div className={styles.resetRow}>
            <button type="button" onClick={resetToDefaults} className={styles.resetButton}>
              <RotateCcw className={styles.resetIcon} />
              {t('deliveryFeeSimulator.resetToDefaults')}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default DeliveryFeeSimulator;
