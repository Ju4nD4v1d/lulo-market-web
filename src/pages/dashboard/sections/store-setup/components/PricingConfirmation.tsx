/**
 * PricingConfirmation Component
 *
 * Displays Founders Plan pricing details and benefits
 * Features:
 * - Pricing comparison (Founders vs Regular)
 * - Benefits list
 * - Warning about cancellation
 * - Confirmation checkbox
 */

import type * as React from 'react';
import { DollarSign, Percent, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { useLanguage } from '../../../../../context/LanguageContext';
import styles from './PricingConfirmation.module.css';

interface PricingConfirmationProps {
  confirmed: boolean;
  onConfirmChange: (confirmed: boolean) => void;
}

export const PricingConfirmation: React.FC<PricingConfirmationProps> = ({
  confirmed,
  onConfirmChange,
}) => {
  const { t } = useLanguage();

  return (
    <div className={styles.container}>
      {/* Badge */}
      <div className={styles.badge}>
        <Sparkles className={styles.badgeIcon} />
        {t('store.pricing.badge')}
      </div>

      {/* Pricing Cards */}
      <div className={styles.pricingGrid}>
        {/* Monthly Subscription */}
        <div className={styles.pricingCard}>
          <div className={styles.cardHeader}>
            <DollarSign className={styles.cardIcon} />
            <h4 className={styles.cardTitle}>{t('store.pricing.monthly')}</h4>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.price}>
              <span className={styles.priceAmount}>{t('store.pricing.monthlyPrice')}</span>
              <span className={styles.priceRegular}>{t('store.pricing.monthlyRegular')}</span>
            </div>
            <p className={styles.priceDuration}>{t('store.pricing.monthlyDuration')}</p>
            <div className={styles.freeTag}>
              <CheckCircle2 className={styles.freeIcon} />
              {t('store.pricing.firstMonthFree')}
            </div>
          </div>
        </div>

        {/* Commission */}
        <div className={styles.pricingCard}>
          <div className={styles.cardHeader}>
            <Percent className={styles.cardIcon} />
            <h4 className={styles.cardTitle}>{t('store.pricing.commission')}</h4>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.price}>
              <span className={styles.priceAmount}>{t('store.pricing.commissionRate')}</span>
              <span className={styles.priceRegular}>{t('store.pricing.commissionRegular')}</span>
            </div>
            <p className={styles.priceDuration}>{t('store.pricing.commissionDuration')}</p>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className={styles.benefitsSection}>
        <h4 className={styles.benefitsTitle}>
          <Sparkles className={styles.benefitsIcon} />
          {t('store.pricing.benefits')}
        </h4>
        <ul className={styles.benefitsList}>
          <li className={styles.benefitItem}>
            <CheckCircle2 className={styles.benefitCheck} />
            {t('store.pricing.benefit1')}
          </li>
          <li className={styles.benefitItem}>
            <CheckCircle2 className={styles.benefitCheck} />
            {t('store.pricing.benefit2')}
          </li>
          <li className={styles.benefitItem}>
            <CheckCircle2 className={styles.benefitCheck} />
            {t('store.pricing.benefit3')}
          </li>
          <li className={styles.benefitItem}>
            <CheckCircle2 className={styles.benefitCheck} />
            {t('store.pricing.benefit4')}
          </li>
          <li className={styles.benefitItem}>
            <CheckCircle2 className={styles.benefitCheck} />
            {t('store.pricing.benefit5')}
          </li>
        </ul>
      </div>

      {/* Warning */}
      <div className={styles.warning}>
        <AlertTriangle className={styles.warningIcon} />
        <p className={styles.warningText}>{t('store.pricing.warning')}</p>
      </div>

      {/* Confirmation Checkbox */}
      <div className={styles.confirmBox}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => onConfirmChange(e.target.checked)}
            className={styles.checkbox}
          />
          <span className={styles.checkboxText}>
            {t('store.pricing.confirm')}
          </span>
        </label>
      </div>
    </div>
  );
};
