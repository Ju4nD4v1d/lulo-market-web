/**
 * useOrderCreation - Custom hook for monitoring order status after payment
 *
 * NOTE: Order creation now happens BEFORE payment in usePaymentFlow.
 * This hook only handles:
 * - Webhook monitoring with fallback mechanism
 * - Payment failure recording
 * - Duplicate order prevention
 */

import { useState, useCallback, useRef } from 'react';
import { useCheckoutMutations } from '../../../hooks/mutations/useCheckoutMutations';
import { useOrderMonitoring } from './useOrderMonitoring';
import { Order, OrderStatus } from '../../../types/order';
import { Cart } from '../../../types/cart';

interface UseOrderCreationOptions {
  cart: Cart;
  currentUser: { uid: string; email?: string | null } | null;
  onOrderComplete: (order: Order) => void;
  clearCart: () => void;
}

/**
 * Custom hook for order monitoring after payment
 * Order is already created in usePaymentFlow before payment.
 */
export const useOrderCreation = ({
  cart,
  currentUser,
  onOrderComplete,
  clearCart
}: UseOrderCreationOptions) => {
  const [isMonitoringOrder, setIsMonitoringOrder] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

  // Ref to prevent double order completion (webhook + fallback)
  const orderCompletedRef = useRef(false);

  const { recordFailedOrder, updateOrder } = useCheckoutMutations();

  /**
   * Callback when order is confirmed via webhook
   */
  const handleOrderConfirmed = useCallback((order: Order) => {
    if (orderCompletedRef.current) {
      console.log('Order already completed, skipping duplicate completion');
      return;
    }
    orderCompletedRef.current = true;
    console.log('✅ Order confirmed via webhook!', order);
    clearCart();
    onOrderComplete(order);
  }, [clearCart, onOrderComplete]);

  // Setup order monitoring
  useOrderMonitoring({
    orderId: pendingOrderId,
    enabled: isMonitoringOrder,
    onOrderConfirmed: handleOrderConfirmed
  });

  /**
   * Handle successful payment - start monitoring for webhook updates
   *
   * NOTE: Order already exists in Firestore with status 'pending_payment'.
   * The webhook will update it to 'confirmed' and 'paid'.
   */
  const handlePaymentSuccess = useCallback(async (
    intentId: string,
    orderIdToUse: string
  ) => {
    console.log('💳 Payment successful, starting order monitoring...', { intentId, orderIdToUse });

    // Start monitoring for webhook updates
    setPendingOrderId(orderIdToUse);
    setIsMonitoringOrder(true);

    // Fallback: if webhook doesn't update within 7 seconds, complete the order
    setTimeout(() => {
      // Check if order hasn't been completed yet (by webhook callback)
      if (!orderCompletedRef.current) {
        orderCompletedRef.current = true;
        console.log('⏰ Webhook fallback triggered - completing order');
        clearCart();
        // Create a minimal order object for navigation
        // The actual order data is already in Firestore
        onOrderComplete({
          id: orderIdToUse,
          storeId: cart.storeId,
          storeName: cart.storeName,
          status: OrderStatus.CONFIRMED,
          paymentStatus: 'paid',
          createdAt: new Date(),
          updatedAt: new Date()
        } as Order);
      }
    }, 7000);
  }, [cart.storeId, cart.storeName, clearCart, onOrderComplete]);

  /**
   * Handle payment failure - update order status and record for debugging
   *
   * NOTE: Order already exists with status 'pending_payment'.
   * We update it to 'payment_failed'.
   */
  const handlePaymentFailure = useCallback(async (
    intentId: string,
    error: string,
    orderIdToRecord: string
  ) => {
    try {
      console.error('💥 Payment failed:', { intentId, error });

      if (!orderIdToRecord) {
        console.warn('⚠️ No order ID to record failure');
        return;
      }

      // Update existing order to failed status
      await updateOrder.mutateAsync({
        orderId: orderIdToRecord,
        updates: {
          status: OrderStatus.PAYMENT_FAILED,
          paymentStatus: 'failed'
        }
      });
      console.log('📋 Order updated to payment_failed status');

      // Also record in failed_orders collection for debugging
      await recordFailedOrder.mutateAsync({
        orderId: orderIdToRecord,
        userId: currentUser?.uid || '',
        storeId: cart.storeId || '',
        error,
        paymentIntentId: intentId,
        createdAt: new Date(),
        orderData: { error: 'Payment failed - order already exists in orders collection' }
      });

      console.log('📋 Failed payment recorded for debugging');
    } catch (recordError) {
      console.error('❌ Error handling failed payment:', recordError);
    }
  }, [updateOrder, recordFailedOrder, currentUser?.uid, cart.storeId]);

  /**
   * Handle general payment errors
   */
  const handlePaymentError = useCallback((error: string) => {
    console.error('⚠️ Payment error:', error);
  }, []);

  /**
   * Reset order completion state (useful for retry scenarios)
   */
  const resetOrderCompletion = useCallback(() => {
    orderCompletedRef.current = false;
    setIsMonitoringOrder(false);
    setPendingOrderId(null);
  }, []);

  return {
    handlePaymentSuccess,
    handlePaymentFailure,
    handlePaymentError,
    resetOrderCompletion,
    isMonitoringOrder,
    orderCompletedRef
  };
};
