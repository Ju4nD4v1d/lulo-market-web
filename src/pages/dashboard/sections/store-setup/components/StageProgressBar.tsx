/**
 * StageProgressBar Component
 *
 * Shows progress through all setup stages
 * Displays current stage and completion percentage
 * Supports dynamic stages (e.g., skipping agreements in edit mode)
 */

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../../../../context/LanguageContext';
import { STAGES, type StageDefinition } from '../config/stageConfig';
import styles from './StageProgressBar.module.css';

interface StageProgressBarProps {
  currentStage: number;
  completedStages: Set<number>;
  stages?: StageDefinition[];
}

export const StageProgressBar: React.FC<StageProgressBarProps> = ({
  currentStage,
  completedStages,
  stages = STAGES,
}) => {
  const { t } = useLanguage();
  const totalStages = stages.length;
  const progress = (currentStage / totalStages) * 100;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>Store Setup Progress</h2>
        <div className={styles.stageBadge}>
          Step {currentStage} of {totalStages}
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
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const isComplete = completedStages.has(stage.id);
          const isCurrent = index + 1 === currentStage;
          const isActive = index + 1 <= currentStage;

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
              {index < stages.length - 1 && (
                <div
                  className={`${styles.connector} ${
                    index + 1 < currentStage ? styles.connectorActive : ''
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
