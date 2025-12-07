import type * as React from 'react';
import { useMemo } from 'react';
import { Check, Clock, ChefHat, Package, Truck, Home, XCircle } from 'lucide-react';
import { Order, OrderStatus } from '../../../types/order';
import { useLanguage } from '../../../context/LanguageContext';
import styles from './OrderProgressTimeline.module.css';

interface OrderProgressTimelineProps {
  order: Order;
}

/**
 * Timeline step configuration
 */
interface TimelineStep {
  key: string;
  status: OrderStatus | string;
  labelKey: string;
  icon: React.ElementType;
}

/**
 * Order progress timeline steps (in order)
 */
const TIMELINE_STEPS: TimelineStep[] = [
  { key: 'confirmed', status: OrderStatus.CONFIRMED, labelKey: 'order.timeline.confirmed', icon: Check },
  { key: 'preparing', status: OrderStatus.PREPARING, labelKey: 'order.timeline.preparing', icon: ChefHat },
  { key: 'ready', status: OrderStatus.READY, labelKey: 'order.timeline.ready', icon: Package },
  { key: 'out_for_delivery', status: OrderStatus.OUT_FOR_DELIVERY, labelKey: 'order.timeline.outForDelivery', icon: Truck },
  { key: 'delivered', status: OrderStatus.DELIVERED, labelKey: 'order.timeline.delivered', icon: Home },
];

/**
 * Get the index of current status in the timeline
 */
const getStatusIndex = (status: string): number => {
  const index = TIMELINE_STEPS.findIndex(step => step.status === status);
  return index >= 0 ? index : -1;
};

/**
 * Check if order is in a failed or cancelled state
 */
const isFailedOrCancelled = (status: string): boolean => {
  return ['failed', 'cancelled', 'canceled', 'payment_failed'].includes(status);
};

/**
 * Check if order is still pending/processing (before confirmed)
 */
const isPendingState = (status: string): boolean => {
  return ['pending', 'pending_payment', 'processing'].includes(status);
};

/**
 * OrderProgressTimeline - Visual stepper showing order fulfillment progress
 *
 * Shows the journey: Confirmed → Preparing → Ready → Out for Delivery → Delivered
 * Handles edge cases like cancelled/failed orders gracefully
 */
export const OrderProgressTimeline: React.FC<OrderProgressTimelineProps> = ({ order }) => {
  const { t } = useLanguage();

  const currentStatusIndex = useMemo(() => getStatusIndex(order.status), [order.status]);
  const isFailed = useMemo(() => isFailedOrCancelled(order.status), [order.status]);
  const isPending = useMemo(() => isPendingState(order.status), [order.status]);

  // Don't show timeline for failed/cancelled orders
  if (isFailed) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>
          <Clock className={styles.titleIcon} />
          {t('order.timeline.title')}
        </h3>
        <div className={styles.failedState}>
          <XCircle className={styles.failedIcon} />
          <p className={styles.failedText}>
            {order.status === 'cancelled' || order.status === 'canceled'
              ? t('order.timeline.cancelled')
              : t('order.timeline.failed')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        <Clock className={styles.titleIcon} />
        {t('order.timeline.title')}
      </h3>

      {/* Mobile: Vertical timeline */}
      <div className={styles.timelineMobile}>
        {TIMELINE_STEPS.map((step, index) => {
          const isCompleted = currentStatusIndex >= index;
          const isCurrent = currentStatusIndex === index;
          const isWaiting = isPending && index === 0;
          const StepIcon = step.icon;

          return (
            <div
              key={step.key}
              className={`${styles.stepMobile} ${isCompleted ? styles.completed : ''} ${isCurrent ? styles.current : ''}`}
            >
              <div className={styles.stepIndicatorMobile}>
                <div className={`${styles.stepCircle} ${isCompleted ? styles.circleCompleted : ''} ${isCurrent ? styles.circleCurrent : ''} ${isWaiting ? styles.circleWaiting : ''}`}>
                  {isCompleted && !isCurrent ? (
                    <Check className={styles.checkIcon} />
                  ) : (
                    <StepIcon className={styles.stepIcon} />
                  )}
                </div>
                {index < TIMELINE_STEPS.length - 1 && (
                  <div className={`${styles.connectorMobile} ${isCompleted && currentStatusIndex > index ? styles.connectorCompleted : ''}`} />
                )}
              </div>
              <div className={styles.stepContentMobile}>
                <span className={`${styles.stepLabel} ${isCurrent ? styles.labelCurrent : ''}`}>
                  {t(step.labelKey)}
                </span>
                {isCurrent && (
                  <span className={styles.currentBadge}>{t('order.timeline.currentStep')}</span>
                )}
                {isWaiting && (
                  <span className={styles.waitingBadge}>{t('order.timeline.waitingConfirmation')}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: Horizontal timeline */}
      <div className={styles.timelineDesktop}>
        {TIMELINE_STEPS.map((step, index) => {
          const isCompleted = currentStatusIndex >= index;
          const isCurrent = currentStatusIndex === index;
          const isWaiting = isPending && index === 0;
          const StepIcon = step.icon;

          return (
            <div
              key={step.key}
              className={`${styles.stepDesktop} ${isCompleted ? styles.completed : ''} ${isCurrent ? styles.current : ''}`}
            >
              <div className={styles.stepIndicatorDesktop}>
                {index > 0 && (
                  <div className={`${styles.connectorDesktop} ${isCompleted ? styles.connectorCompleted : ''}`} />
                )}
                <div className={`${styles.stepCircle} ${isCompleted ? styles.circleCompleted : ''} ${isCurrent ? styles.circleCurrent : ''} ${isWaiting ? styles.circleWaiting : ''}`}>
                  {isCompleted && !isCurrent ? (
                    <Check className={styles.checkIcon} />
                  ) : (
                    <StepIcon className={styles.stepIcon} />
                  )}
                </div>
                {index < TIMELINE_STEPS.length - 1 && (
                  <div className={`${styles.connectorDesktop} ${isCompleted && currentStatusIndex > index ? styles.connectorCompleted : ''}`} />
                )}
              </div>
              <div className={styles.stepContentDesktop}>
                <span className={`${styles.stepLabelDesktop} ${isCurrent ? styles.labelCurrent : ''}`}>
                  {t(step.labelKey)}
                </span>
                {isCurrent && (
                  <span className={styles.currentBadgeDesktop}>{t('order.timeline.currentStep')}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
