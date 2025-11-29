/**
 * OrderProcessingFeedback - Animated feedback during order processing
 *
 * Shows a multi-step animation during the 7-second webhook wait:
 * 1. Payment verified
 * 2. Creating order
 * 3. Sending confirmation
 * 4. Complete!
 */

import { useState, useEffect } from 'react';
import { CheckCircle2, CreditCard, FileText, Mail, Loader2 } from 'lucide-react';
import styles from './OrderProcessingFeedback.module.css';

interface OrderProcessingFeedbackProps {
  t: (key: string) => string;
  onComplete?: () => void;
}

interface ProcessingStep {
  key: string;
  icon: typeof CreditCard;
  translationKey: string;
  duration: number; // ms before moving to next step
}

const PROCESSING_STEPS: ProcessingStep[] = [
  { key: 'verifying', icon: CreditCard, translationKey: 'processing.verifyingPayment', duration: 1500 },
  { key: 'creating', icon: FileText, translationKey: 'processing.creatingOrder', duration: 2000 },
  { key: 'sending', icon: Mail, translationKey: 'processing.sendingConfirmation', duration: 2000 },
  { key: 'complete', icon: CheckCircle2, translationKey: 'processing.complete', duration: 0 },
];

export const OrderProcessingFeedback: React.FC<OrderProcessingFeedbackProps> = ({
  t,
  onComplete
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const step = PROCESSING_STEPS[currentStepIndex];

    if (step.key === 'complete') {
      setIsComplete(true);
      onComplete?.();
      return;
    }

    const timer = setTimeout(() => {
      setCurrentStepIndex(prev => prev + 1);
    }, step.duration);

    return () => clearTimeout(timer);
  }, [currentStepIndex, onComplete]);

  const currentStep = PROCESSING_STEPS[currentStepIndex];

  return (
    <div className={styles.container}>
      {/* Animated icon */}
      <div className={`${styles.iconContainer} ${isComplete ? styles.complete : ''}`}>
        {isComplete ? (
          <CheckCircle2 className={styles.successIcon} />
        ) : (
          <Loader2 className={styles.spinnerIcon} />
        )}
      </div>

      {/* Current step text */}
      <h3 className={styles.title}>
        {isComplete ? t('processing.complete') : t(currentStep.translationKey)}
      </h3>

      {/* Progress steps */}
      <div className={styles.stepsContainer}>
        {PROCESSING_STEPS.map((step, index) => {
          const StepIcon = step.icon;
          const isPast = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <div
              key={step.key}
              className={`${styles.step} ${isPast ? styles.stepComplete : ''} ${isCurrent ? styles.stepCurrent : ''}`}
            >
              <div className={styles.stepIconWrapper}>
                {isPast ? (
                  <CheckCircle2 className={styles.stepIconComplete} />
                ) : (
                  <StepIcon className={isCurrent ? styles.stepIconCurrent : styles.stepIconPending} />
                )}
              </div>
              <span className={styles.stepLabel}>{t(step.translationKey)}</span>
            </div>
          );
        })}
      </div>

      {/* Completion message */}
      {isComplete && (
        <p className={styles.completionMessage}>
          {t('processing.confirmationEmailSent')}
        </p>
      )}
    </div>
  );
};
