import type * as React from 'react';

import { Truck, Users, Clock } from 'lucide-react';
import styles from './HowItWorks.module.css';

interface HowItWorksProps {
  t: (key: string) => string;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ t }) => {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.titleSection}>
          <h2 className={styles.heading}>
            {t('home.howItWorks.title')}
          </h2>
          <p className={styles.description}>
            {t('home.howItWorks.description')}
          </p>
        </div>

        <div className={styles.stepsGrid}>
          <div className={styles.step}>
            <div className={styles.iconContainer}>
              <Truck className={styles.icon} />
            </div>
            <h3 className={styles.stepTitle}>{t('home.howItWorks.step1.title')}</h3>
            <p className={styles.stepDescription}>{t('home.howItWorks.step1.description')}</p>
          </div>

          <div className={styles.step}>
            <div className={styles.iconContainer}>
              <Users className={styles.icon} />
            </div>
            <h3 className={styles.stepTitle}>{t('home.howItWorks.step2.title')}</h3>
            <p className={styles.stepDescription}>{t('home.howItWorks.step2.description')}</p>
          </div>

          <div className={styles.step}>
            <div className={styles.iconContainer}>
              <Clock className={styles.icon} />
            </div>
            <h3 className={styles.stepTitle}>{t('home.howItWorks.step3.title')}</h3>
            <p className={styles.stepDescription}>{t('home.howItWorks.step3.description')}</p>
          </div>
        </div>
      </div>
    </section>
  );
};
