import React from 'react';
import { Star, Store, TrendingUp, Users, Check } from 'lucide-react';
import styles from './BusinessHero.module.css';

interface BusinessHeroProps {
  t: (key: string) => string;
}

export const BusinessHero: React.FC<BusinessHeroProps> = ({ t }) => {
  return (
    <section className={styles.section}>
      {/* Background Elements */}
      <div className={styles.backgroundGradient}></div>
      <div className={styles.backgroundCircle1}></div>
      <div className={styles.backgroundCircle2}></div>

      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Content */}
          <div className={styles.content}>
            <div className={styles.badge}>
              <Star className={styles.badgeIcon} />
              <span className={styles.badgeText}>{t('business.hero.badge')}</span>
            </div>
            <h1 className={styles.title}>
              {t('business.hero.title')}
            </h1>
            <p className={styles.description}>
              {t('business.hero.description')}
            </p>

            {/* Key Features */}
            <div className={styles.features}>
              <div className={styles.feature}>
                <div className={styles.featureDot1}></div>
                <span>{t('business.hero.feature1')}</span>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureDot2}></div>
                <span>{t('business.hero.feature2')}</span>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureDot3}></div>
                <span>{t('business.hero.feature3')}</span>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureDot4}></div>
                <span>{t('business.hero.feature4')}</span>
              </div>
            </div>
          </div>

          {/* Visual Element */}
          <div className={styles.visual}>
            <div className={styles.appInterface}>
              {/* Simulated app interface */}
              <div className={styles.appCard}>
                <div className={styles.appHeader}>
                  <div className={styles.appIcon}>
                    <Store className={styles.storeIcon} />
                  </div>
                  <div>
                    <div className={styles.storeName}>{t('business.hero.demo.storeName')}</div>
                    <div className={styles.storeType}>{t('business.hero.demo.storeType')}</div>
                  </div>
                </div>
                <div className={styles.stats}>
                  <div className={styles.statRow}>
                    <span className={styles.statLabel}>{t('business.hero.demo.orders')}</span>
                    <span className={styles.statValueGreen}>{t('business.hero.demo.ordersStatus')}</span>
                  </div>
                  <div className={styles.statRow}>
                    <span className={styles.statLabel}>{t('business.hero.demo.products')}</span>
                    <span className={styles.statValueBlue}>{t('business.hero.demo.productsStatus')}</span>
                  </div>
                  <div className={styles.statRow}>
                    <span className={styles.statLabel}>{t('business.hero.demo.customers')}</span>
                    <span className={styles.statValuePurple}>{t('business.hero.demo.customersStatus')}</span>
                  </div>
                </div>
              </div>

              <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                  <div className={styles.metricHeader}>
                    <TrendingUp className={styles.metricIconOrange} />
                    <span className={styles.metricTitle}>{t('business.hero.demo.growth')}</span>
                  </div>
                  <div className={styles.metricDesc}>{t('business.hero.demo.growthDesc')}</div>
                </div>
                <div className={styles.metricCard}>
                  <div className={styles.metricHeader}>
                    <Users className={styles.metricIconBlue} />
                    <span className={styles.metricTitle}>{t('business.hero.demo.reach')}</span>
                  </div>
                  <div className={styles.metricDesc}>{t('business.hero.demo.reachDesc')}</div>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className={styles.floatingCheck}>
              <Check className={styles.checkIcon} />
            </div>
            <div className={styles.floatingStar}>
              <Star className={styles.starIcon} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
