/**
 * Custom hook for order status monitoring during checkout
 * Monitors paymentStatus changes and handles completion/failure
 *
 * IMPORTANT: Uses paymentStatus field (not status) as primary indicator per backend spec:
 * - paymentStatus: "pending" | "paid" | "failed" | "canceled" | "processing"
 * - status: "pending" | "confirmed" | "failed" | "canceled" | "processing" | fulfillment states
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
   * Backend sets: "pending" → "paid" (success) or "failed" (failure)
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
      case 'paid':
        // Payment successful - trigger confirmation callback
        if (onOrderConfirmed && !callbackTriggeredRef.current) {
          callbackTriggeredRef.current = true;
          console.log('✅ Payment confirmed (paymentStatus: paid)! Calling completion callback');
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
   * Check if payment is successful
   * Uses paymentStatus as primary indicator per backend spec
   */
  const isPaymentSuccessful = useCallback((): boolean => {
    return order?.paymentStatus === 'paid';
  }, [order?.paymentStatus]);

  /**
   * Check if order is confirmed (payment successful, legacy compatibility)
   */
  const isConfirmed = useCallback((): boolean => {
    // Primary: check paymentStatus
    if (order?.paymentStatus === 'paid') return true;

    // Fallback: check order.status for fulfillment states
    return status === OrderStatus.CONFIRMED ||
           status === OrderStatus.PREPARING ||
           status === OrderStatus.READY ||
           status === OrderStatus.OUT_FOR_DELIVERY ||
           status === OrderStatus.DELIVERED;
  }, [order?.paymentStatus, status]);

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
    isPaymentSuccessful
  };
};
