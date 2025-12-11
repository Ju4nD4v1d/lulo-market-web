/**
 * Custom hook for order status monitoring during checkout
 * Monitors paymentStatus changes and handles completion/failure
 *
 * IMPORTANT: Uses paymentStatus field (not status) as primary indicator per backend spec:
 *
 * Delayed Capture Flow:
 * - pending: No payment attempt yet
 * - processing: Payment being processed
 * - authorized: Funds held on card, awaiting capture on delivery (SUCCESS for checkout)
 * - captured: Funds captured after delivery
 * - paid: Alias for captured (backward compatibility)
 * - voided: Authorization cancelled (order cancelled before delivery)
 * - expired: Authorization expired (7-day limit exceeded)
 * - failed: Payment attempt failed
 *
 * For checkout flow, "authorized" is treated as success (order confirmed, awaiting delivery).
 */

import { useEffect, useCallback, useRef } from 'react';
import { useOrderMonitoringQuery } from '../../../hooks/queries/useOrderMonitoringQuery';
import { Order, OrderStatus, PaymentStatus } from '../../../types/order';

/**
 * Hook options
 */
interface UseOrderMonitoringOptions {
  orderId: string | null;
  enabled?: boolean;
  onOrderConfirmed?: (order: Order) => void;
  onOrderFailed?: (order: Order) => void;
}

/**
 * Custom hook for monitoring order status
 *
 * @param options Hook options with orderId and callbacks
 * @returns Monitoring state and controls
 */
export const useOrderMonitoring = ({
  orderId,
  enabled = true,
  onOrderConfirmed,
  onOrderFailed
}: UseOrderMonitoringOptions) => {
  const { order, status, isLoading, error } = useOrderMonitoringQuery({
    orderId,
    enabled: enabled && !!orderId
  });

  // Track previous paymentStatus to detect changes (primary indicator per backend spec)
  const previousPaymentStatusRef = useRef<PaymentStatus | null>(null);

  /**
   * Stop monitoring (can be used to disable polling)
   */
  const stopMonitoring = useCallback(() => {
    // Note: To actually stop polling, we'd need to control the enabled flag
    // from the parent component. This is more of a callback handler.
  }, []);

  // Track if we've already triggered callbacks to prevent duplicates
  const callbackTriggeredRef = useRef(false);

  /**
   * Monitor paymentStatus changes (primary indicator per backend spec)
   * Delayed Capture Flow: "pending" → "authorized" (success) or "failed" (failure)
   * Legacy Flow: "pending" → "paid" (success)
   */
  useEffect(() => {
    if (!order) return;

    const paymentStatus = order.paymentStatus as PaymentStatus | undefined;
    const previousPaymentStatus = previousPaymentStatusRef.current;

    // Update previous status ref
    previousPaymentStatusRef.current = paymentStatus || null;

    // Skip if paymentStatus hasn't changed
    if (previousPaymentStatus === paymentStatus) return;

    console.log('Order paymentStatus changed:', {
      orderId: order.id,
      previousPaymentStatus,
      paymentStatus,
      orderStatus: order.status
    });

    // Handle paymentStatus transitions (primary indicator)
    switch (paymentStatus) {
      case 'authorized':
        // Delayed capture: Payment authorized (funds held) - order is confirmed
        // This is SUCCESS for checkout flow - customer will be charged on delivery
        if (onOrderConfirmed && !callbackTriggeredRef.current) {
          callbackTriggeredRef.current = true;
          console.log('✅ Payment authorized! Funds held, order confirmed. Calling completion callback');
          onOrderConfirmed(order);
        }
        break;

      case 'captured':
      case 'paid':
        // Payment captured/completed - trigger confirmation callback
        // This handles both delayed capture (captured) and legacy flow (paid)
        if (onOrderConfirmed && !callbackTriggeredRef.current) {
          callbackTriggeredRef.current = true;
          console.log(`✅ Payment ${paymentStatus}! Calling completion callback`);
          onOrderConfirmed(order);
        }
        break;

      case 'failed':
      case 'canceled':
        // Payment failed or cancelled - trigger failure callback
        if (onOrderFailed && !callbackTriggeredRef.current) {
          callbackTriggeredRef.current = true;
          console.log(`❌ Payment ${paymentStatus}! Calling failure callback`);
          onOrderFailed(order);
        }
        break;

      case 'voided':
      case 'expired':
        // Authorization voided or expired - trigger failure callback
        if (onOrderFailed && !callbackTriggeredRef.current) {
          callbackTriggeredRef.current = true;
          console.log(`❌ Payment authorization ${paymentStatus}! Calling failure callback`);
          onOrderFailed(order);
        }
        break;

      case 'pending':
      case 'processing':
        // Still processing, continue monitoring
        console.log('⏳ Payment still processing (paymentStatus:', paymentStatus, ')');
        break;

      default:
        // Also check order.status for backward compatibility (fulfillment states)
        if (order.status === OrderStatus.CONFIRMED ||
            order.status === OrderStatus.PREPARING ||
            order.status === OrderStatus.READY ||
            order.status === OrderStatus.OUT_FOR_DELIVERY ||
            order.status === OrderStatus.DELIVERED) {
          // Order is in fulfillment - assume payment was successful
          if (onOrderConfirmed && !callbackTriggeredRef.current) {
            callbackTriggeredRef.current = true;
            console.log('✅ Order in fulfillment state, assuming payment successful');
            onOrderConfirmed(order);
          }
        } else {
          console.warn('⚠️ Unknown paymentStatus:', paymentStatus);
        }
    }
  }, [order, onOrderConfirmed, onOrderFailed]);

  /**
   * Get display status for UI
   */
  const getDisplayStatus = useCallback((): string => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'Pending';
      case OrderStatus.PROCESSING:
        return 'Processing Payment';
      case OrderStatus.CONFIRMED:
        return 'Confirmed';
      case OrderStatus.FAILED:
        return 'Failed';
      case OrderStatus.PREPARING:
        return 'Being Prepared';
      case OrderStatus.READY:
        return 'Ready';
      case OrderStatus.OUT_FOR_DELIVERY:
        return 'Out for Delivery';
      case OrderStatus.DELIVERED:
        return 'Delivered';
      case OrderStatus.CANCELLED:
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  }, [status]);

  /**
   * Check if order is in a final state
   */
  const isFinalState = useCallback((): boolean => {
    return status === OrderStatus.DELIVERED ||
           status === OrderStatus.CANCELLED ||
           status === OrderStatus.FAILED;
  }, [status]);

  /**
   * Check if payment is successful (authorized, captured, or paid)
   * Uses paymentStatus as primary indicator per backend spec
   *
   * For delayed capture:
   * - "authorized" = funds held, order confirmed (success for checkout)
   * - "captured" = funds captured after delivery
   * - "paid" = legacy/alias for captured
   */
  const isPaymentSuccessful = useCallback((): boolean => {
    const paymentStatus = order?.paymentStatus;
    return paymentStatus === 'authorized' ||
           paymentStatus === 'captured' ||
           paymentStatus === 'paid';
  }, [order?.paymentStatus]);

  /**
   * Check if order is confirmed (payment authorized/captured)
   */
  const isConfirmed = useCallback((): boolean => {
    // Primary: check paymentStatus for success states
    const paymentStatus = order?.paymentStatus;
    if (paymentStatus === 'authorized' ||
        paymentStatus === 'captured' ||
        paymentStatus === 'paid') {
      return true;
    }

    // Fallback: check order.status for fulfillment states
    return status === OrderStatus.CONFIRMED ||
           status === OrderStatus.PREPARING ||
           status === OrderStatus.READY ||
           status === OrderStatus.OUT_FOR_DELIVERY ||
           status === OrderStatus.DELIVERED;
  }, [order?.paymentStatus, status]);

  /**
   * Check if payment is authorized but not yet captured
   * This is the state between checkout and delivery
   */
  const isPaymentAuthorized = useCallback((): boolean => {
    return order?.paymentStatus === 'authorized';
  }, [order?.paymentStatus]);

  /**
   * Check if payment has been captured (after delivery)
   */
  const isPaymentCaptured = useCallback((): boolean => {
    const paymentStatus = order?.paymentStatus;
    return paymentStatus === 'captured' || paymentStatus === 'paid';
  }, [order?.paymentStatus]);

  return {
    order,
    status,
    paymentStatus: order?.paymentStatus as PaymentStatus | undefined,
    isLoading,
    error,
    isMonitoring: enabled && !!orderId,
    stopMonitoring,
    getDisplayStatus,
    isFinalState,
    isConfirmed,
    isPaymentSuccessful,
    isPaymentAuthorized,
    isPaymentCaptured,
  };
};
