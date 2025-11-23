/**
 * useOrderCreation - Custom hook for managing order creation after payment
 *
 * Handles:
 * - Order creation in Firestore after successful payment
 * - Payment failure recording
 * - Webhook monitoring with fallback mechanism
 * - Duplicate order prevention
 */

import { useState, useCallback, useRef } from 'react';
import { useCheckoutMutations } from '../../../hooks/mutations/useCheckoutMutations';
import { useOrderMonitoring } from './useOrderMonitoring';
import { buildEnhancedOrderData } from '../utils/orderDataBuilder';
import { Order, OrderStatus } from '../../../types/order';
import { Cart } from '../../../types/cart';

interface CheckoutFormData {
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  deliveryAddress: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  isDelivery: boolean;
  orderNotes: string;
  deliveryDate: string;
  useProfileAsDeliveryContact: boolean;
}

interface StoreReceiptInfo {
  storeName: string;
  storeEmail: string;
  storePhone?: string;
  storeAddress?: string;
}

interface UseOrderCreationOptions {
  cart: Cart;
  formData: CheckoutFormData;
  currentUser: { uid: string; email?: string | null } | null;
  locale: string;
  onOrderComplete: (order: Order) => void;
  clearCart: () => void;
}

/**
 * Custom hook for order creation and monitoring
 */
export const useOrderCreation = ({
  cart,
  formData,
  currentUser,
  locale,
  onOrderComplete,
  clearCart
}: UseOrderCreationOptions) => {
  const [isMonitoringOrder, setIsMonitoringOrder] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

  // Ref to prevent double order completion (webhook + fallback)
  const orderCompletedRef = useRef(false);

  const { createOrder, recordFailedOrder } = useCheckoutMutations();

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
   * Handle successful payment - create order and start monitoring
   */
  const handlePaymentSuccess = useCallback(async (
    intentId: string,
    orderIdToUse: string,
    storeReceiptInfo: StoreReceiptInfo
  ) => {
    try {
      if (!storeReceiptInfo) {
        throw new Error('Store information not loaded');
      }

      console.log('💳 Payment successful, creating order...', { intentId, orderIdToUse });

      // Build order data
      const orderData = buildEnhancedOrderData(
        orderIdToUse,
        cart,
        formData,
        { uid: currentUser?.uid || '', email: currentUser?.email },
        locale,
        storeReceiptInfo,
        intentId,
        OrderStatus.PROCESSING
      );

      // Create order in Firestore
      await createOrder.mutateAsync({ orderId: orderIdToUse, orderData });
      console.log('📝 Order created in Firestore');

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
          onOrderComplete({
            ...orderData,
            id: orderIdToUse,
            status: OrderStatus.CONFIRMED,
            createdAt: new Date(),
            updatedAt: new Date()
          } as Order);
        }
      }, 7000);
    } catch (error) {
      console.error('❌ Error creating order after payment:', error);
      throw error;
    }
  }, [cart, formData, currentUser, locale, createOrder, clearCart, onOrderComplete]);

  /**
   * Handle payment failure - record for debugging
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

      await recordFailedOrder.mutateAsync({
        orderId: orderIdToRecord,
        userId: currentUser?.uid || '',
        storeId: cart.storeId || '',
        error,
        paymentIntentId: intentId,
        createdAt: new Date(),
        orderData: formData
      });

      console.log('📋 Failed payment recorded for debugging');
    } catch (recordError) {
      console.error('❌ Error recording failed payment:', recordError);
    }
  }, [recordFailedOrder, currentUser?.uid, cart.storeId, formData]);

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
