/**
 * FeeCalculatorTest - Test panel for calculating fees with manual distance input
 */

import { useState, useCallback } from 'react';
import { Calculator } from 'lucide-react';
import { useLanguage } from '../../../../../context/LanguageContext';
import { calculateDeliveryFee } from '../../../../../services/delivery/deliveryFeeCalculator';
import { UNLIMITED_DISTANCE } from '../../../../../services/delivery/constants';
import type { DeliveryFeeConfig, FeeCalculationResult } from '../../../../../services/delivery/types';
import styles from '../DeliveryFeeSimulator.module.css';

interface FeeCalculatorTestProps {
  config: DeliveryFeeConfig;
}

export function FeeCalculatorTest({ config }: FeeCalculatorTestProps) {
  const { t } = useLanguage();
  const [testDistance, setTestDistance] = useState<string>('5');
  const [result, setResult] = useState<FeeCalculationResult | null>(null);

  const handleCalculate = useCallback(() => {
    const distance = parseFloat(testDistance) || 0;
    const calculationResult = calculateDeliveryFee(distance, config);
    setResult(calculationResult);
  }, [testDistance, config]);

  const handleDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTestDistance(e.target.value);
    setResult(null); // Clear result when input changes
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCalculate();
    }
  };

  const formatTierRange = (fromKm: number, toKm: number): string => {
    if (toKm >= UNLIMITED_DISTANCE) {
      return `${fromKm}+ km`;
    }
    return `${fromKm}-${toKm} km`;
  };

  return (
    <div className={styles.testPanel}>
      <h3 className={styles.sectionTitle}>{t('deliveryFeeSimulator.testCalculation')}</h3>

      <div className={styles.testInputRow}>
        <label htmlFor="testDistance" className={styles.testLabel}>
          {t('deliveryFeeSimulator.distance')}
        </label>
        <input
          id="testDistance"
          type="number"
          value={testDistance}
          min={0}
          step={0.1}
          onChange={handleDistanceChange}
          onKeyDown={handleKeyDown}
          className={styles.testInput}
        />
        <button type="button" onClick={handleCalculate} className={styles.calculateButton}>
          <Calculator className={styles.calculateIcon} />
          {t('deliveryFeeSimulator.calculate')}
        </button>
      </div>

      {result && (
        <div className={styles.resultCard}>
          <div className={styles.totalFee}>
            <span>{t('deliveryFeeSimulator.totalFee')}</span>
            <strong>${result.totalFee.toFixed(2)}</strong>
          </div>

          <div className={styles.breakdown}>
            <div className={styles.breakdownRow}>
              <span>{t('deliveryFeeSimulator.baseFee')}</span>
              <span>${result.baseFee.toFixed(2)}</span>
            </div>

            <div className={styles.breakdownRow}>
              <span>
                {t('deliveryFeeSimulator.distanceFee')} ({result.distance.toFixed(1)} km)
              </span>
              <span>${result.distanceFee.toFixed(2)}</span>
            </div>

            {result.tierBreakdown.length > 0 && (
              <div className={styles.tierDetails}>
                {result.tierBreakdown.map((tb, index) => (
                  <div key={index} className={styles.tierDetail}>
                    <span className={styles.tierRange}>
                      {formatTierRange(tb.tier.fromKm, tb.tier.toKm)}
                    </span>
                    <span className={styles.tierCalc}>
                      {tb.kmInTier.toFixed(1)} km × ${tb.tier.ratePerKm.toFixed(2)}/km
                    </span>
                    <span className={styles.tierFee}>${tb.fee.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            {result.cappedAt && (
              <div className={styles.capNote}>
                {t('deliveryFeeSimulator.feeCappedAt')} {result.cappedAt === 'min' ? 'minimum' : 'maximum'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
