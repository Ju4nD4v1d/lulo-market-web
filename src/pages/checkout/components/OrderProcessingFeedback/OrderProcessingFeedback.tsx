/**
 * OrderProcessingFeedback - Animated feedback during order processing
 *
 * Shows a multi-step animation during webhook processing:
 * 1. Payment verified
 * 2. Creating order
 * 3. Sending confirmation
 * 4. Complete!
 * 5. Redirecting... (after animation completes)
 */

import { useState, useEffect, useRef } from 'react';
import { CheckCircle2, CreditCard, FileText, Mail, Loader2 } from 'lucide-react';
import styles from './OrderProcessingFeedback.module.css';

interface OrderProcessingFeedbackProps {
  t: (key: string) => string;
  onComplete?: () => void;
  /** Whether the order has been confirmed by the backend (webhook received) */
  isOrderConfirmed?: boolean;
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
  onComplete,
  isOrderConfirmed = false
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showRedirecting, setShowRedirecting] = useState(false);
  const onCompleteCalledRef = useRef(false);

  useEffect(() => {
    const step = PROCESSING_STEPS[currentStepIndex];

    if (step.key === 'complete') {
      setIsComplete(true);
      return;
    }

    const timer = setTimeout(() => {
      setCurrentStepIndex(prev => prev + 1);
    }, step.duration);

    return () => clearTimeout(timer);
  }, [currentStepIndex]);

  // After animation completes, show "Redirecting..." after a short delay
  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => {
        setShowRedirecting(true);
      }, 1500); // Show redirecting message 1.5s after "complete" shows
      return () => clearTimeout(timer);
    }
  }, [isComplete]);

  // Call onComplete when order is confirmed by backend OR after timeout
  useEffect(() => {
    if (isComplete && !onCompleteCalledRef.current) {
      // If order already confirmed by webhook, call immediately
      if (isOrderConfirmed) {
        onCompleteCalledRef.current = true;
        onComplete?.();
      }
    }
  }, [isComplete, isOrderConfirmed, onComplete]);

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

      {/* Redirecting indicator - shows after completion animation finishes */}
      {showRedirecting && (
        <div className={styles.redirectingContainer}>
          <Loader2 className={styles.redirectingSpinner} />
          <span className={styles.redirectingText}>{t('processing.redirecting')}</span>
        </div>
      )}
    </div>
  );
};
