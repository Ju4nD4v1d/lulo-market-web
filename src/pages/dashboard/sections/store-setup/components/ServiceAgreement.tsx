/**
 * ServiceAgreement Component
 *
 * Displays the service agreement terms that stores must accept
 * Features:
 * - Full agreement text with sections
 * - Checkbox for acceptance
 * - Store name and date interpolation
 * - Scrollable content area
 */

import type * as React from 'react';
import { FileText } from 'lucide-react';
import { useLanguage } from '../../../../../context/LanguageContext';
import styles from './ServiceAgreement.module.css';

interface ServiceAgreementProps {
  storeName: string;
  agreed: boolean;
  onAgreeChange: (agreed: boolean) => void;
}

export const ServiceAgreement: React.FC<ServiceAgreementProps> = ({
  storeName,
  agreed,
  onAgreeChange,
}) => {
  const { t } = useLanguage();

  const currentDate = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format

  const replaceVariables = (text: string) => {
    return text
      .replace('{{storeName}}', storeName || '_____________________')
      .replace('{{date}}', currentDate);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <FileText className={styles.headerIcon} />
        <h3 className={styles.headerTitle}>{t('store.agreement.header')}</h3>
      </div>

      <div className={styles.content}>
        {/* Section 1 */}
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>{t('store.agreement.section1.title')}</h4>
          <p className={styles.sectionText}>
            {replaceVariables(t('store.agreement.section1.content'))}
          </p>
        </div>

        {/* Section 2 */}
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>{t('store.agreement.section2.title')}</h4>
          <p className={styles.sectionText}>{t('store.agreement.section2.intro')}</p>
          <ul className={styles.list}>
            <li>{t('store.agreement.section2.item1')}</li>
            <li>{t('store.agreement.section2.item2')}</li>
            <li>{t('store.agreement.section2.item3')}</li>
            <li>{t('store.agreement.section2.item4')}</li>
          </ul>
          <p className={styles.sectionText}>{t('store.agreement.section2.footer')}</p>
        </div>

        {/* Section 3 */}
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>{t('store.agreement.section3.title')}</h4>
          <ul className={styles.list}>
            <li>{t('store.agreement.section3.item1')}</li>
            <li>{t('store.agreement.section3.item2')}</li>
            <li>{t('store.agreement.section3.item3')}</li>
          </ul>
        </div>

        {/* Section 4 */}
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>{t('store.agreement.section4.title')}</h4>
          <p className={styles.sectionText}>{t('store.agreement.section4.content')}</p>
          <ul className={styles.list}>
            <li>{t('store.agreement.section4.item1')}</li>
            <li>{t('store.agreement.section4.item2')}</li>
          </ul>
        </div>

        {/* Section 5 */}
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>{t('store.agreement.section5.title')}</h4>
          <ul className={styles.list}>
            <li>{t('store.agreement.section5.item1')}</li>
            <li>
              {t('store.agreement.section5.item2')}
              <ul className={styles.sublist}>
                <li>{t('store.agreement.section5.item2a')}</li>
                <li>{t('store.agreement.section5.item2b')}</li>
                <li>{t('store.agreement.section5.item2c')}</li>
              </ul>
            </li>
            <li>{t('store.agreement.section5.item3')}</li>
            <li>{t('store.agreement.section5.item4')}</li>
          </ul>
        </div>

        {/* Section 6 */}
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>{t('store.agreement.section6.title')}</h4>
          <ul className={styles.list}>
            <li>{t('store.agreement.section6.item1')}</li>
            <li>{t('store.agreement.section6.item2')}</li>
            <li>{t('store.agreement.section6.item3')}</li>
          </ul>
        </div>
      </div>

      {/* Agreement Checkbox */}
      <div className={styles.agreementBox}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => onAgreeChange(e.target.checked)}
            className={styles.checkbox}
          />
          <span className={styles.checkboxText}>
            {t('store.agreement.accept')}
          </span>
        </label>
      </div>
    </div>
  );
};
