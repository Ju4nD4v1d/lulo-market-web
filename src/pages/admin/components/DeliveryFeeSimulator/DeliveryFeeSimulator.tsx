/**
 * DeliveryFeeSimulator - Test calculator for delivery fees
 *
 * Loads config from Firestore on mount, allows local editing for testing.
 * Changes are NOT persisted - they reset on page reload.
 * To save changes permanently, use the DeliveryFeeSettings component.
 */

import { Calculator, ChevronDown, RotateCcw, Loader2 } from 'lucide-react';
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
    isLoading,
    setBaseFee,
    setMinFee,
    setMaxFee,
    setDiscountPercentage,
    setDiscountEligibleOrders,
    updateTier,
    addTier,
    removeTier,
    resetToSaved,
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
          {isLoading ? (
            <div className={styles.loadingState}>
              <Loader2 className={styles.spinner} />
              <span>{t('deliveryFeeSettings.loading')}</span>
            </div>
          ) : (
            <>
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

              {/* New Customer Discount */}
              <div className={styles.configGrid}>
                <div className={styles.configField}>
                  <label htmlFor="discountPercentage" className={styles.configLabel}>
                    {t('deliveryFeeSimulator.discountPercentage')}
                  </label>
                  <div className={styles.currencyInputWrapper}>
                    <input
                      id="discountPercentage"
                      type="number"
                      value={Math.round((config.discountPercentage ?? 0.20) * 100)}
                      min={0}
                      max={100}
                      step={1}
                      onChange={(e) => setDiscountPercentage((parseFloat(e.target.value) || 0) / 100)}
                      className={styles.configInput}
                    />
                    <span className={styles.currencySuffix}>%</span>
                  </div>
                </div>

                <div className={styles.configField}>
                  <label htmlFor="discountEligibleOrders" className={styles.configLabel}>
                    {t('deliveryFeeSimulator.discountEligibleOrders')}
                  </label>
                  <div className={styles.currencyInputWrapper}>
                    <input
                      id="discountEligibleOrders"
                      type="number"
                      value={config.discountEligibleOrders ?? 3}
                      min={0}
                      max={100}
                      step={1}
                      onChange={(e) => setDiscountEligibleOrders(parseInt(e.target.value) || 0)}
                      className={styles.configInput}
                    />
                    <span className={styles.currencySuffix}>{t('deliveryFeeSimulator.orders')}</span>
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
                <button type="button" onClick={resetToSaved} className={styles.resetButton}>
                  <RotateCcw className={styles.resetIcon} />
                  {t('deliveryFeeSimulator.resetToDefaults')}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}

export default DeliveryFeeSimulator;
