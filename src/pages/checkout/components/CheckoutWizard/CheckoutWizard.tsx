import type * as React from 'react';
/**
 * CheckoutWizard - Main wrapper component for checkout flow
 * Provides header with step indicators and navigation
 */


import { ArrowLeft } from 'lucide-react';
import { CheckoutStep } from '../../hooks/useCheckoutWizard';
import { VibrantBackground } from '../../../../components/VibrantBackground/VibrantBackground';
import styles from './CheckoutWizard.module.css';

interface CheckoutWizardProps {
  currentStep: CheckoutStep;
  onBack: () => void;
  children: React.ReactNode;
  t: (key: string) => string;
  /** Disable back button during payment processing */
  isProcessing?: boolean;
}

const STEPS: CheckoutStep[] = ['info', 'address', 'review', 'payment'];

export const CheckoutWizard: React.FC<CheckoutWizardProps> = ({
  currentStep,
  onBack,
  children,
  t,
  isProcessing = false
}) => {
  const currentStepIndex = STEPS.indexOf(currentStep);

  return (
    <VibrantBackground>
      <div className={styles.container}>
        {/* Header with step indicators */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerInner}>
              <button
                onClick={onBack}
                className={styles.backButton}
                type="button"
                disabled={isProcessing}
                style={isProcessing ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
              >
                <ArrowLeft className={styles.backIcon} />
              </button>

              <div className={styles.titleContainer}>
                <h1 className={styles.title}>{t('order.checkout')}</h1>
                <div className={styles.stepIndicators}>
                  {STEPS.map((_, index) => (
                    <div
                      key={index}
                      className={`${styles.stepDot} ${
                        index <= currentStepIndex ? styles.stepDotActive : ''
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </VibrantBackground>
  );
};
