/**
 * StageContainer Component
 *
 * Reusable wrapper for all setup stages
 * Provides consistent styling and animations
 */

import type * as React from 'react';
import { useLanguage } from '../../../../../context/LanguageContext';
import type { StageDefinition } from '../config/stageConfig';
import styles from './StageContainer.module.css';

interface StageContainerProps {
  stage: StageDefinition;
  children: React.ReactNode;
}

export const StageContainer: React.FC<StageContainerProps> = ({ stage, children }) => {
  const { t } = useLanguage();
  const Icon = stage.icon;

  return (
    <div className={styles.container}>
      <div
        className={styles.header}
        style={{
          backgroundImage: `linear-gradient(to right, var(--${stage.gradient.from}), var(--${stage.gradient.to}))`,
        }}
      >
        <div className={styles.headerContent}>
          <div
            className={styles.iconWrapper}
            style={{
              backgroundImage: `linear-gradient(to bottom right, var(--${stage.iconGradient.from}), var(--${stage.iconGradient.to}))`,
            }}
          >
            <Icon className={styles.icon} />
          </div>
          <div>
            <h2 className={styles.title}>{t(stage.titleKey)}</h2>
            <p className={styles.subtitle}>{t(stage.subtitleKey)}</p>
          </div>
        </div>
      </div>

      <div className={styles.content}>{children}</div>
    </div>
  );
};
