import type * as React from 'react';

import { TrendingUp, Users, Shield } from 'lucide-react';
import styles from './BenefitsSection.module.css';

interface BenefitsSectionProps {
  t: (key: string) => string;
}

export const BenefitsSection: React.FC<BenefitsSectionProps> = ({ t }) => {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.textCenter}>
          <h2 className={styles.title}>
            {t('business.benefits.title')}
          </h2>
          <p className={styles.description}>
            {t('business.benefits.description')}
          </p>
        </div>

        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.iconWrapperOrange}>
              <TrendingUp className={styles.icon} />
            </div>
            <h3 className={styles.cardTitle}>{t('business.benefits.growth.title')}</h3>
            <p className={styles.cardDescription}>{t('business.benefits.growth.description')}</p>
          </div>

          <div className={styles.card}>
            <div className={styles.iconWrapperBlue}>
              <Users className={styles.icon} />
            </div>
            <h3 className={styles.cardTitle}>{t('business.benefits.customers.title')}</h3>
            <p className={styles.cardDescription}>{t('business.benefits.customers.description')}</p>
          </div>

          <div className={styles.card}>
            <div className={styles.iconWrapperGreen}>
              <Shield className={styles.icon} />
            </div>
            <h3 className={styles.cardTitle}>{t('business.benefits.support.title')}</h3>
            <p className={styles.cardDescription}>{t('business.benefits.support.description')}</p>
          </div>
        </div>
      </div>
    </section>
  );
};
