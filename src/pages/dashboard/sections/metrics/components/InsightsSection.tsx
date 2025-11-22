import type * as React from 'react';

import { Sparkles, TrendingUp, Target, Award } from 'lucide-react';
import styles from './InsightsSection.module.css';

interface InsightsSectionProps {
  t: (key: string) => string;
}

export const InsightsSection: React.FC<InsightsSectionProps> = ({ t }) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <Sparkles className={styles.headerIcon} />
        </div>
        <div>
          <h3 className={styles.title}>{t('metrics.smartInsights')}</h3>
          <p className={styles.subtitle}>{t('metrics.smartInsightsSubtitle')}</p>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIconWrapper + ' ' + styles.green}>
              <TrendingUp className={styles.cardIcon} />
            </div>
            <h4 className={styles.cardTitle}>{t('metrics.growthOpportunity')}</h4>
          </div>
          <p className={styles.cardDescription}>
            {t('metrics.growthOpportunityDesc')}
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIconWrapper + ' ' + styles.blue}>
              <Target className={styles.cardIcon} />
            </div>
            <h4 className={styles.cardTitle}>{t('metrics.marketingFocus')}</h4>
          </div>
          <p className={styles.cardDescription}>
            {t('metrics.marketingFocusDesc')}
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIconWrapper + ' ' + styles.purple}>
              <Award className={styles.cardIcon} />
            </div>
            <h4 className={styles.cardTitle}>{t('metrics.performance')}</h4>
          </div>
          <p className={styles.cardDescription}>
            {t('metrics.performanceDesc')}
          </p>
        </div>
      </div>
    </div>
  );
};
