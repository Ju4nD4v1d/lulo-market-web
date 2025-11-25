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
          </div>
          <div className={styles.imageContainer}>
            <img
              src="/images/apoyando-familias.jpg"
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
