/**
 * LegalAgreements Component
 *
 * Displays the three legal agreements with checkboxes:
 * 1. Seller Partner Agreement
 * 2. Payout Policy
 * 3. Refund & Cancellation Policy
 *
 * Each agreement has a link to view the full document
 */

import type * as React from 'react';
import { FileText, ExternalLink, Handshake, Wallet, RotateCcw, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../../../../context/LanguageContext';
import styles from './LegalAgreements.module.css';

export interface AgreementState {
  sellerAgreement: boolean;
  payoutPolicy: boolean;
  refundPolicy: boolean;
}

interface LegalAgreementsProps {
  agreements: AgreementState;
  onAgreementChange: (agreements: AgreementState) => void;
  /** Previously accepted agreements - these will be shown as locked/read-only */
  existingAcceptances?: AgreementState;
}

interface AgreementItem {
  id: keyof AgreementState;
  icon: React.ElementType;
  labelKey: string;
  href: string;
}

const agreementItems: AgreementItem[] = [
  {
    id: 'sellerAgreement',
    icon: Handshake,
    labelKey: 'legal.agreements.sellerAgreement',
    href: '#seller-agreement',
  },
  {
    id: 'payoutPolicy',
    icon: Wallet,
    labelKey: 'legal.agreements.payoutPolicy',
    href: '#payout-policy',
  },
  {
    id: 'refundPolicy',
    icon: RotateCcw,
    labelKey: 'legal.agreements.refundPolicy',
    href: '#refund-policy',
  },
];

export const LegalAgreements: React.FC<LegalAgreementsProps> = ({
  agreements,
  onAgreementChange,
  existingAcceptances,
}) => {
  const { t } = useLanguage();

  const handleCheckboxChange = (id: keyof AgreementState) => {
    // Don't allow unchecking previously accepted agreements
    if (existingAcceptances?.[id]) {
      return;
    }
    onAgreementChange({
      ...agreements,
      [id]: !agreements[id],
    });
  };

  const handleViewDocument = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(href, '_blank');
  };

  const allAccepted = agreements.sellerAgreement && agreements.payoutPolicy && agreements.refundPolicy;

  // Filter to only show pending agreements (not already accepted)
  const pendingAgreements = agreementItems.filter(
    item => !existingAcceptances?.[item.id]
  );

  // If all agreements were previously accepted, don't render anything
  if (pendingAgreements.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <FileText className={styles.headerIcon} />
        <div>
          <h3 className={styles.headerTitle}>{t('legal.agreements.title')}</h3>
          <p className={styles.headerSubtitle}>{t('legal.agreements.subtitle')}</p>
        </div>
      </div>

      <div className={styles.agreementsList}>
        {pendingAgreements.map((item) => {
          const IconComponent = item.icon;
          const isChecked = agreements[item.id];

          return (
            <div
              key={item.id}
              className={`${styles.agreementItem} ${isChecked ? styles.agreementItemChecked : ''}`}
            >
              <label className={styles.checkboxLabel}>
                <div className={styles.checkboxWrapper}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleCheckboxChange(item.id)}
                    className={styles.checkbox}
                  />
                  {isChecked && <CheckCircle className={styles.checkIcon} />}
                </div>
                <div className={styles.labelContent}>
                  <IconComponent className={styles.itemIcon} />
                  <span className={styles.labelText}>{t(item.labelKey)}</span>
                </div>
              </label>
              <button
                type="button"
                className={styles.viewLink}
                onClick={(e) => handleViewDocument(e, item.href)}
              >
                {t('legal.agreements.viewFull')}
                <ExternalLink className={styles.linkIcon} />
              </button>
            </div>
          );
        })}
      </div>

      {allAccepted && (
        <div className={styles.successBanner}>
          <CheckCircle className={styles.successIcon} />
          <span>{t('store.validation.agreementAccepted') || 'All agreements accepted'}</span>
        </div>
      )}
    </div>
  );
};
