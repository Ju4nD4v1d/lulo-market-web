/**
 * Custom hook for order status monitoring during checkout
 * Monitors order status changes and handles completion/failure
 */

import { useEffect, useCallback, useRef } from 'react';
import { useOrderMonitoringQuery } from '../../../hooks/queries/useOrderMonitoringQuery';
import { Order, OrderStatus } from '../../../types/order';

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

  // Track previous status to detect changes
  const previousStatusRef = useRef<OrderStatus | null>(null);

  /**
   * Stop monitoring (can be used to disable polling)
   */
  const stopMonitoring = useCallback(() => {
    // Note: To actually stop polling, we'd need to control the enabled flag
    // from the parent component. This is more of a callback handler.
  }, []);

  /**
   * Monitor status changes
   */
  useEffect(() => {
    if (!order || !status) return;

    const previousStatus = previousStatusRef.current;
    const currentStatus = status;

    // Update previous status ref
    previousStatusRef.current = currentStatus;

    // Skip if status hasn't changed
    if (previousStatus === currentStatus) return;

    console.log('Order status changed:', {
      orderId: order.id,
      previousStatus,
      currentStatus
    });

    // Handle status transitions
    switch (currentStatus) {
      case OrderStatus.CONFIRMED:
      case OrderStatus.PREPARING:
      case OrderStatus.READY:
      case OrderStatus.OUT_FOR_DELIVERY:
      case OrderStatus.DELIVERED:
      case 'paid' as any: // Legacy payment status, treat as confirmed
        // Order is confirmed and being processed
        if (onOrderConfirmed && previousStatus === OrderStatus.PROCESSING) {
          console.log('Order confirmed! Calling completion callback');
          onOrderConfirmed(order);
        }
        break;

      case OrderStatus.CANCELLED:
        // Order was cancelled/failed
        if (onOrderFailed) {
          console.log('Order failed/cancelled');
          onOrderFailed(order);
        }
        break;

      case OrderStatus.PROCESSING:
      case OrderStatus.PENDING:
        // Still processing, continue monitoring
        console.log('Order still processing...');
        break;

      default:
        console.warn('Unknown order status:', currentStatus);
    }
  }, [order, status, onOrderConfirmed, onOrderFailed]);

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
    return status === OrderStatus.DELIVERED || status === OrderStatus.CANCELLED;
  }, [status]);

  /**
   * Check if order is confirmed (payment successful)
   */
  const isConfirmed = useCallback((): boolean => {
    return status === OrderStatus.CONFIRMED ||
           status === OrderStatus.PREPARING ||
           status === OrderStatus.READY ||
           status === OrderStatus.OUT_FOR_DELIVERY ||
           status === OrderStatus.DELIVERED;
  }, [status]);

  return {
    order,
    status,
    isLoading,
    error,
    isMonitoring: enabled && !!orderId,
    stopMonitoring,
    getDisplayStatus,
    isFinalState,
    isConfirmed
  };
};
