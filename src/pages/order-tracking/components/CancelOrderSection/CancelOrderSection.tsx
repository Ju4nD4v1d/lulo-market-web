/**
 * CancelOrderSection - Customer order cancellation UI
 *
 * Allows customers to cancel their order if:
 * 1. The order is not yet delivered or cancelled
 * 2. The delivery time window is more than 24 hours away
 *
 * When cancelled, the payment authorization is voided to release held funds.
 */

import type * as React from 'react';
import { useState, useMemo } from 'react';
import { XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { Order, OrderStatus } from '../../../../types/order';
import { useLanguage } from '../../../../context/LanguageContext';
import { CANCELLATION_CUTOFF_HOURS } from '../../../../utils/schedule/constants';
import styles from './CancelOrderSection.module.css';

interface CancelOrderSectionProps {
  order: Order;
  onCancel: () => Promise<void>;
  onRefresh?: () => Promise<void>;
  isLoading?: boolean;
}

/**
 * Determines if an order can be cancelled by the customer
 *
 * Cancellation rules:
 * - Order must not be delivered or already cancelled
 * - Must be more than 24 hours before the delivery time window starts
 */
function canCancelOrder(order: Order): { canCancel: boolean; reason?: string } {
  // Already delivered or cancelled
  if (order.status === OrderStatus.DELIVERED) {
    return { canCancel: false, reason: 'delivered' };
  }
  if (order.status === OrderStatus.CANCELLED) {
    return { canCancel: false, reason: 'already_cancelled' };
  }

  // Check if within 24-hour window of delivery
  const now = new Date();
  let deliveryStartTime: Date | null = null;

  // Calculate delivery start time from date + time window
  if (order.estimatedDeliveryTime && order.deliveryTimeWindow?.open) {
    const deliveryDate = new Date(order.estimatedDeliveryTime);
    const [hours, minutes] = order.deliveryTimeWindow.open.split(':').map(Number);
    deliveryStartTime = new Date(deliveryDate);
    deliveryStartTime.setHours(hours, minutes, 0, 0);
  } else if (order.estimatedDeliveryTime) {
    // Fallback to just the delivery time if no window
    deliveryStartTime = new Date(order.estimatedDeliveryTime);
  }

  if (deliveryStartTime) {
    const hoursUntilDelivery = (deliveryStartTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilDelivery <= CANCELLATION_CUTOFF_HOURS) {
      return { canCancel: false, reason: 'too_close_to_delivery' };
    }
  }

  // Payment must be authorized (funds held) to be voidable
  // Only 'authorized' status means funds are held and can be voided
  // Other statuses like 'pending', 'voided', 'failed' don't have funds to release
  if (order.paymentStatus !== 'authorized') {
    if (order.paymentStatus === 'paid' || order.paymentStatus === 'captured') {
      return { canCancel: false, reason: 'payment_captured' };
    }
    // For any other status (pending, voided, failed, etc.), cancellation isn't applicable
    return { canCancel: false, reason: 'payment_not_authorized' };
  }

  return { canCancel: true };
}

export const CancelOrderSection: React.FC<CancelOrderSectionProps> = ({
  order,
  onCancel,
  onRefresh,
  isLoading = false,
}) => {
  const { t } = useLanguage();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { canCancel, reason } = useMemo(() => canCancelOrder(order), [order]);

  const handleCancelClick = () => {
    setError(null);
    setShowConfirmation(true);
  };

  const handleConfirmCancel = async () => {
    setError(null);

    // Fresh eligibility check: refetch order data before confirming
    // This prevents race conditions where the order state changed
    // (e.g., store owner already cancelled, payment was captured, etc.)
    if (onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch {
        // Continue with cancellation attempt even if refresh fails
        console.warn('Failed to refresh order before cancellation');
      }
      setIsRefreshing(false);
    }

    // Re-check eligibility after refresh (order prop will be updated)
    const freshCheck = canCancelOrder(order);
    if (!freshCheck.canCancel) {
      const errorKey = freshCheck.reason === 'already_cancelled'
        ? 'order.cancel.alreadyCancelled'
        : freshCheck.reason === 'payment_captured'
        ? 'order.cancel.paymentCaptured'
        : freshCheck.reason === 'too_close_to_delivery'
        ? 'order.cancel.tooCloseToDelivery'
        : 'order.cancel.notEligible';
      setError(t(errorKey));
      return;
    }

    try {
      await onCancel();
      setShowConfirmation(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('order.cancel.errorGeneric'));
    }
  };

  const handleDismiss = () => {
    setShowConfirmation(false);
    setError(null);
  };

  // Don't show the section if order can't be cancelled
  if (!canCancel) {
    // Optionally show a message about why cancellation isn't available
    if (reason === 'too_close_to_delivery') {
      return (
        <div className={styles.container}>
          <div className={styles.unavailableMessage}>
            <AlertTriangle className={styles.warningIcon} />
            <p>{t('order.cancel.tooCloseToDelivery')}</p>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className={styles.container}>
      {!showConfirmation ? (
        <button
          onClick={handleCancelClick}
          className={styles.cancelButton}
          disabled={isLoading}
        >
          <XCircle className={styles.buttonIcon} />
          {t('order.cancel.button')}
        </button>
      ) : (
        <div className={styles.confirmationCard}>
          <div className={styles.confirmationHeader}>
            <AlertTriangle className={styles.alertIcon} />
            <h3 className={styles.confirmationTitle}>{t('order.cancel.confirmTitle')}</h3>
          </div>

          <p className={styles.confirmationMessage}>
            {t('order.cancel.confirmMessage')}
          </p>

          <p className={styles.refundNote}>
            {t('order.cancel.refundNote')}
          </p>

          {error && (
            <div className={styles.errorMessage}>
              <AlertTriangle className={styles.errorIcon} />
              {error}
            </div>
          )}

          <div className={styles.confirmationButtons}>
            <button
              onClick={handleDismiss}
              className={styles.keepOrderButton}
              disabled={isLoading || isRefreshing}
            >
              {t('order.cancel.keepOrder')}
            </button>
            <button
              onClick={handleConfirmCancel}
              className={styles.confirmCancelButton}
              disabled={isLoading || isRefreshing}
            >
              {isLoading || isRefreshing ? (
                <>
                  <Loader2 className={styles.spinner} />
                  {isRefreshing ? t('order.cancel.checking') : t('order.cancel.cancelling')}
                </>
              ) : (
                t('order.cancel.confirmButton')
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CancelOrderSection;
