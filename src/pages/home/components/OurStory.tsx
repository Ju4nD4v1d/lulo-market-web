import type * as React from 'react';

import styles from './OurStory.module.css';

interface OurStoryProps {
  t: (key: string) => string;
}

export const OurStory: React.FC<OurStoryProps> = ({ t }) => {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.content}>
            <h2 className={styles.heading}>
              {t('home.ourStory.title')}
            </h2>
            <p className={styles.description}>
              {t('home.ourStory.description')}
            </p>
            <div className={styles.statsGrid}>
              <div className={styles.stat}>
                <div className={styles.statNumber}>500+</div>
                <div className={styles.statLabel}>{t('home.ourStory.stat1')}</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statNumber}>50K+</div>
                <div className={styles.statLabel}>{t('home.ourStory.stat2')}</div>
              </div>
            </div>
          </div>
          <div className={styles.imageContainer}>
            <img
              src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop&crop=center"
              alt="Our Story"
              className={styles.image}
            />
            <div className={styles.imageOverlay}></div>
          </div>
        </div>
      </div>
    </section>
  );
};
