/**
 * DistanceTierEditor - Editable table for distance-based fee tiers
 */

import { Plus, Trash2 } from 'lucide-react';
import { useLanguage } from '../../../../../context/LanguageContext';
import { UNLIMITED_DISTANCE } from '../../../../../services/delivery/constants';
import type { DistanceTier } from '../../../../../services/delivery/types';
import styles from '../DeliveryFeeSimulator.module.css';

interface DistanceTierEditorProps {
  tiers: DistanceTier[];
  onUpdateTier: (index: number, field: keyof DistanceTier, value: number) => void;
  onAddTier: () => void;
  onRemoveTier: (index: number) => void;
}

export function DistanceTierEditor({
  tiers,
  onUpdateTier,
  onAddTier,
  onRemoveTier,
}: DistanceTierEditorProps) {
  const { t } = useLanguage();

  const handleInputChange = (
    index: number,
    field: keyof DistanceTier,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseFloat(e.target.value) || 0;
    onUpdateTier(index, field, value);
  };

  const formatToKm = (value: number): string => {
    return value >= UNLIMITED_DISTANCE ? '' : value.toString();
  };

  return (
    <div className={styles.tierEditor}>
      <h3 className={styles.sectionTitle}>{t('deliveryFeeSimulator.distanceTiers')}</h3>

      <div className={styles.tierTableWrapper}>
        <table className={styles.tierTable}>
          <thead>
            <tr>
              <th>{t('deliveryFeeSimulator.from')}</th>
              <th>{t('deliveryFeeSimulator.to')}</th>
              <th>{t('deliveryFeeSimulator.rate')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {tiers.map((tier, index) => (
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
                    placeholder={t('deliveryFeeSimulator.unlimited')}
                    onChange={(e) => {
                      const value = e.target.value === '' ? UNLIMITED_DISTANCE : parseFloat(e.target.value) || 0;
                      onUpdateTier(index, 'toKm', value);
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
                    onClick={() => onRemoveTier(index)}
                    disabled={tiers.length <= 1}
                    className={styles.removeButton}
                    title={t('deliveryFeeSimulator.removeTier')}
                  >
                    <Trash2 className={styles.removeIcon} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button type="button" onClick={onAddTier} className={styles.addTierButton}>
        <Plus className={styles.addTierIcon} />
        {t('deliveryFeeSimulator.addTier')}
      </button>
    </div>
  );
}
