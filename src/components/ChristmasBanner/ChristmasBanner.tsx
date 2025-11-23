/**
 * ChristmasBanner - Festive seasonal banner for the homepage
 *
 * Features:
 * - Animated snowflakes
 * - Christmas lights effect
 * - Festive colors and gradients
 * - Bilingual messaging
 * - Responsive design
 */

import type * as React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import styles from './ChristmasBanner.module.css';

export const ChristmasBanner: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className={styles.bannerContainer}>
      {/* Christmas Lights Decoration */}
      <div className={styles.lightsTop}>
        {[...Array(20)].map((_, i) => (
          <div
            key={`light-${i}`}
            className={styles.light}
            style={{
              left: `${i * 5}%`,
              animationDelay: `${i * 0.1}s`,
              backgroundColor: ['#ff0000', '#00ff00', '#ffff00', '#0000ff', '#ff00ff'][i % 5]
            }}
          />
        ))}
      </div>

      {/* Main Banner Content */}
      <div className={styles.bannerContent}>
        {/* Left Decoration - Christmas Tree */}
        <div className={styles.leftDecoration}>
          <div className={styles.christmasTree}>
            <div className={styles.treeStar}>⭐</div>
            <div className={styles.treeTop}>🎄</div>
          </div>
        </div>

        {/* Center Message */}
        <div className={styles.messageContainer}>
          <div className={styles.snowflakes}>
            {[...Array(15)].map((_, i) => (
              <div
                key={`snowflake-${i}`}
                className={styles.snowflake}
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 4}s`
                }}
              >
                ❄
              </div>
            ))}
          </div>

          <h2 className={styles.mainHeading}>
            <span className={styles.sparkle}>✨</span>
            {t('christmas.title')}
            <span className={styles.sparkle}>✨</span>
          </h2>

          <p className={styles.subHeading}>
            {t('christmas.subtitle')}
          </p>

          <div className={styles.festiveMessage}>
            <span className={styles.gift}>🎁</span>
            <span className={styles.messageText}>{t('christmas.message')}</span>
            <span className={styles.gift}>🎁</span>
          </div>
        </div>

        {/* Right Decoration - Santa */}
        <div className={styles.rightDecoration}>
          <div className={styles.santa}>
            <div className={styles.santaFace}>🎅</div>
            <div className={styles.presents}>🎁</div>
          </div>
        </div>
      </div>

      {/* Bottom Border with Holly */}
      <div className={styles.hollyBorder}>
        {[...Array(10)].map((_, i) => (
          <span key={`holly-${i}`} className={styles.holly}>🎄</span>
        ))}
      </div>
    </div>
  );
};
