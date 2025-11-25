/**
 * StageProgressBar Component
 *
 * Shows progress through all setup stages
 * Displays current stage and completion percentage
 */

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../../../../context/LanguageContext';
import { STAGES, TOTAL_STAGES } from '../config/stageConfig';
import styles from './StageProgressBar.module.css';

interface StageProgressBarProps {
  currentStage: number;
  completedStages: Set<number>;
}

export const StageProgressBar: React.FC<StageProgressBarProps> = ({
  currentStage,
  completedStages,
}) => {
  const { t } = useLanguage();
  const progress = (currentStage / TOTAL_STAGES) * 100;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>Store Setup Progress</h2>
        <div className={styles.stageBadge}>
          Step {currentStage} of {TOTAL_STAGES}
        </div>
      </div>

      {/* Progress Bar */}
      <div className={styles.progressBarContainer}>
        <div className={styles.progressBarTrack}>
          <div
            className={styles.progressBarFill}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stage Indicators (Desktop only) */}
      <div className={styles.stageIndicators}>
        {STAGES.map((stage, index) => {
          const Icon = stage.icon;
          const isComplete = completedStages.has(stage.id);
          const isCurrent = stage.id === currentStage;
          const isActive = stage.id <= currentStage;

          return (
            <React.Fragment key={stage.id}>
              <div className={styles.stageItem}>
                <div
                  className={`${styles.stageCircle} ${
                    isComplete
                      ? styles.stageComplete
                      : isCurrent
                      ? styles.stageCurrent
                      : isActive
                      ? styles.stageActive
                      : styles.stageInactive
                  }`}
                >
                  {isComplete ? (
                    <CheckCircle2 className={styles.checkIcon} />
                  ) : (
                    <Icon className={styles.stageIcon} />
                  )}
                </div>
                <div className={styles.stageLabel}>
                  <p className={`${styles.stageName} ${isActive ? styles.activeText : ''}`}>
                    {t(stage.titleKey)}
                  </p>
                  <p className={styles.stageSubtitle}>{t(stage.subtitleKey)}</p>
                </div>
              </div>

              {/* Connector */}
              {index < STAGES.length - 1 && (
                <div
                  className={`${styles.connector} ${
                    stage.id < currentStage ? styles.connectorActive : ''
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
