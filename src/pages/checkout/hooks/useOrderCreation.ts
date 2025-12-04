/**
 * useOrderCreation - Custom hook for monitoring order status after payment
 *
 * NOTE: Order creation now happens BEFORE payment in usePaymentFlow.
 * This hook only handles:
 * - Webhook monitoring with fallback mechanism
 * - Payment failure recording
 * - Duplicate order prevention
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useCheckoutMutations } from '../../../hooks/mutations/useCheckoutMutations';
import { useOrderMonitoring } from './useOrderMonitoring';
import { Order, OrderStatus } from '../../../types/order';
import { Cart } from '../../../types/cart';
import { trackPurchase } from '../../../services/analytics';
import * as orderApi from '../../../services/api/orderApi';

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
  // Ref to prevent duplicate analytics tracking
  const purchaseTrackedRef = useRef(false);
  // Ref to store fallback timeout for cleanup
  const fallbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Ref to track if component is mounted (for async operations)
  const isMountedRef = useRef(true);

  // Refs to avoid stale closures in setTimeout callback
  const cartRef = useRef(cart);
  const clearCartRef = useRef(clearCart);
  const onOrderCompleteRef = useRef(onOrderComplete);

  // Keep refs up to date
  useEffect(() => {
    cartRef.current = cart;
    clearCartRef.current = clearCart;
    onOrderCompleteRef.current = onOrderComplete;
  }, [cart, clearCart, onOrderComplete]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Clear fallback timeout to prevent memory leaks and stale callbacks
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current);
        fallbackTimeoutRef.current = null;
      }
    };
  }, []);

  const { recordFailedOrder } = useCheckoutMutations();

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

    // Clear the fallback timeout since webhook succeeded
    if (fallbackTimeoutRef.current) {
      clearTimeout(fallbackTimeoutRef.current);
      fallbackTimeoutRef.current = null;
    }

    // Use refs to get current values (avoid stale closures)
    const currentCart = cartRef.current;
    const currentClearCart = clearCartRef.current;
    const currentOnOrderComplete = onOrderCompleteRef.current;

    // Track Purchase event for Meta Pixel (only once)
    if (!purchaseTrackedRef.current) {
      purchaseTrackedRef.current = true;
      trackPurchase({
        orderId: order.id,
        value: currentCart.summary?.finalTotal || 0,
        contentIds: currentCart.items?.map(item => item.product.id) || [],
        contents: currentCart.items?.map(item => ({
          id: item.product.id,
          quantity: item.quantity,
          item_price: item.product.price
        })) || [],
        numItems: currentCart.summary?.itemCount || 0
      });
    }

    currentClearCart();
    currentOnOrderComplete(order);
  }, []); // No dependencies needed - we use refs for current values

  // Setup order monitoring
  useOrderMonitoring({
    orderId: pendingOrderId,
    enabled: isMonitoringOrder,
    onOrderConfirmed: handleOrderConfirmed
  });

  /**
   * Handle successful payment - start monitoring for webhook updates
   *
   * NOTE: Order already exists in Firestore with status: "pending", paymentStatus: "pending".
   * The webhook will update to status: "confirmed", paymentStatus: "paid".
   */
  const handlePaymentSuccess = useCallback(async (
    intentId: string,
    orderIdToUse: string
  ) => {
    console.log('💳 Payment successful, starting order monitoring...', { intentId, orderIdToUse });

    // Clear any existing fallback timeout
    if (fallbackTimeoutRef.current) {
      clearTimeout(fallbackTimeoutRef.current);
    }

    // Start monitoring for webhook updates
    setPendingOrderId(orderIdToUse);
    setIsMonitoringOrder(true);

    // Fallback: if webhook doesn't update within 30 seconds, READ actual status and navigate
    // Per backend spec: Use progressive polling (30s covers 99.9% of webhook deliveries)
    // IMPORTANT: Frontend NEVER writes payment status - only reads from Firestore
    // The webhook is the source of truth for payment status
    // If still pending after 30s, user sees real status; backend cleanup handles edge cases
    const FALLBACK_TIMEOUT_MS = 30000; // 30 seconds
    fallbackTimeoutRef.current = setTimeout(async () => {
      // Check if component is still mounted and order hasn't been completed
      if (!isMountedRef.current) {
        console.log('⏰ Fallback skipped - component unmounted');
        return;
      }

      if (!orderCompletedRef.current) {
        orderCompletedRef.current = true;
        console.log('⏰ Webhook fallback triggered - reading actual order status from Firestore');

        // Use refs to get current values (avoid stale closures)
        const currentCart = cartRef.current;
        const currentClearCart = clearCartRef.current;
        const currentOnOrderComplete = onOrderCompleteRef.current;

        try {
          // READ the actual order status from Firestore (don't assume success!)
          const actualOrder = await orderApi.getOrderById(orderIdToUse);

          // Check again if component is still mounted after async operation
          if (!isMountedRef.current) return;

          console.log('📋 Actual order from Firestore:', {
            status: actualOrder.status,
            paymentStatus: actualOrder.paymentStatus
          });

          // Only track purchase if payment actually succeeded
          // Use paymentStatus as primary indicator per backend spec
          const isPaymentSuccessful = actualOrder.paymentStatus === 'paid';

          if (isPaymentSuccessful && !purchaseTrackedRef.current) {
            purchaseTrackedRef.current = true;
            trackPurchase({
              orderId: orderIdToUse,
              value: currentCart.summary?.finalTotal || 0,
              contentIds: currentCart.items?.map(item => item.product.id) || [],
              contents: currentCart.items?.map(item => ({
                id: item.product.id,
                quantity: item.quantity,
                item_price: item.product.price
              })) || [],
              numItems: currentCart.summary?.itemCount || 0
            });
          }

          currentClearCart();
          // Navigate with the ACTUAL order status from Firestore
          // User will see the real status (confirmed, pending, or failed)
          currentOnOrderComplete(actualOrder);
        } catch (error) {
          console.error('❌ Failed to fetch order status:', error);

          // Check again if component is still mounted after async operation
          if (!isMountedRef.current) return;

          // Still navigate to order page - user can see the real status there
          currentClearCart();
          currentOnOrderComplete({
            id: orderIdToUse,
            storeId: currentCart.storeId,
            storeName: currentCart.storeName,
            status: OrderStatus.PENDING, // Show pending, not assumed success
            paymentStatus: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
          } as Order);
        }
      }
    }, FALLBACK_TIMEOUT_MS);
  }, []); // No dependencies needed - we use refs for current values

  /**
   * Handle payment failure - log for debugging only
   *
   * IMPORTANT: Frontend must NOT write status or paymentStatus fields.
   * The Stripe webhook (payment_intent.payment_failed) handles updating the order
   * with status: "failed" and paymentStatus: "failed".
   *
   * Frontend only records to failed_orders collection for debugging purposes.
   */
  const handlePaymentFailure = useCallback(async (
    intentId: string,
    error: string,
    orderIdToRecord: string
  ) => {
    try {
      console.error('💥 Payment failed:', { intentId, error });
      console.log('ℹ️ Webhook will update order status to failed - frontend does NOT write status');

      if (!orderIdToRecord) {
        console.warn('⚠️ No order ID to record failure');
        return;
      }

      // Record in failed_orders collection for debugging only
      // The webhook will update the actual order status
      await recordFailedOrder.mutateAsync({
        orderId: orderIdToRecord,
        userId: currentUser?.uid || '',
        storeId: cart.storeId || '',
        error,
        paymentIntentId: intentId,
        createdAt: new Date(),
        orderData: { error: 'Payment failed - webhook will update order status' }
      });

      console.log('📋 Failed payment recorded for debugging (webhook handles order update)');
    } catch (recordError) {
      console.error('❌ Error recording failed payment:', recordError);
    }
  }, [recordFailedOrder, currentUser?.uid, cart.storeId]);

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
    purchaseTrackedRef.current = false;
    setIsMonitoringOrder(false);
    setPendingOrderId(null);
    // Clear any pending fallback timeout
    if (fallbackTimeoutRef.current) {
      clearTimeout(fallbackTimeoutRef.current);
      fallbackTimeoutRef.current = null;
    }
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
