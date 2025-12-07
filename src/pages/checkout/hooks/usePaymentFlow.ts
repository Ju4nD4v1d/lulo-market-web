/**
 * Custom hook for managing payment flow
 * Handles order creation and payment intent creation
 *
 * IMPORTANT: Order is created in Firestore BEFORE payment intent
 * to ensure the webhook can find the order when it fires.
 */

import { useState, useCallback } from 'react';
import { useCheckoutMutations } from '../../../hooks/mutations/useCheckoutMutations';
import { useStoreStripeAccountQuery } from '../../../hooks/queries/useStoreStripeAccountQuery';
import { generateOrderId } from '../../../utils/orderUtils';
import { buildEnhancedOrderData, StoreReceiptInfo } from '../utils/orderDataBuilder';
import { OrderStatus } from '../../../types/order';
import { CartItem, CartSummary } from '../../../types/cart';

/**
 * Cart interface
 */
interface Cart {
  storeId: string;
  storeName: string;
  items: CartItem[];
  summary: CartSummary;
}

/**
 * Form data for payment
 */
interface PaymentFormData {
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
    deliveryInstructions?: string;
  };
  isDelivery: boolean;
  orderNotes: string;
  deliveryDate: string;
  deliveryTimeWindow?: {
    open: string;
    close: string;
  };
  useProfileAsDeliveryContact?: boolean;
}

/**
 * Current user data
 */
interface CurrentUserData {
  uid: string;
  email?: string | null;
}

/**
 * Hook options
 */
interface UsePaymentFlowOptions {
  cart: Cart;
  formData: PaymentFormData;
  currentUser: CurrentUserData | null;
  locale: string;
  storeReceiptInfo: StoreReceiptInfo | null;
  /** Estimated distance in km (from delivery fee calculation) */
  estimatedDistance?: number | null;
  onPaymentIntentCreated: (clientSecret: string, paymentIntentId: string, orderId: string) => void;
  onError: (error: string) => void;
}

/**
 * Custom hook for payment flow management
 *
 * @param options Hook options with cart, form data, and callbacks
 * @returns Payment flow state and handlers
 */
export const usePaymentFlow = ({
  cart,
  formData,
  currentUser,
  locale,
  storeReceiptInfo,
  estimatedDistance,
  onPaymentIntentCreated,
  onError
}: UsePaymentFlowOptions) => {
  const [isCreatingPaymentIntent, setIsCreatingPaymentIntent] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

  const { createOrder, updateOrder, createPaymentIntent } = useCheckoutMutations();
  const { data: stripeAccount } = useStoreStripeAccountQuery({
    storeId: cart.storeId,
    enabled: !!cart.storeId
  });

  /**
   * Create order in Firestore first, then create payment intent
   *
   * Flow:
   * 1. Generate order ID
   * 2. Build order data with status: "pending", paymentStatus: "pending"
   * 3. Create order in Firestore FIRST
   * 4. Create payment intent
   * 5. Update order with paymentId
   *
   * This ensures the order exists when the Stripe webhook fires.
   * Webhook will update paymentStatus to "paid" or "failed".
   */
  const proceedToPayment = useCallback(async () => {
    console.log('💳 proceedToPayment called');
    setIsCreatingPaymentIntent(true);

    try {
      // Validate store receipt info
      if (!storeReceiptInfo) {
        throw new Error('Store information not loaded. Please try again.');
      }

      // Validate Stripe account
      console.log('🔍 Stripe account:', stripeAccount);
      if (!stripeAccount?.stripeAccountId) {
        throw new Error('Store payment processing is not set up. Please contact the store owner.');
      }

      // Check if Stripe account is enabled (fully verified)
      if (!stripeAccount.stripeEnabled) {
        const status = stripeAccount.stripeAccountStatus;
        if (status === 'pending_verification') {
          throw new Error('This store is still being verified by Stripe. Please try again later or contact the store owner.');
        } else if (status === 'restricted') {
          throw new Error('This store needs to complete their payment setup. Please contact the store owner.');
        } else if (status === 'disabled') {
          throw new Error('This store\'s payment processing has been disabled. Please contact the store owner.');
        } else {
          throw new Error('This store\'s payment processing is not ready. Please contact the store owner.');
        }
      }

      // 1. Generate order ID
      const orderId = generateOrderId();
      console.log('📝 Generated order ID:', orderId);
      setPendingOrderId(orderId);

      // DEBUG: Log cart summary before building order
      console.log('🔍 [usePaymentFlow] Cart summary before order build:', {
        subtotal: cart.summary.subtotal,
        tax: cart.summary.tax,
        gst: cart.summary.gst,
        pst: cart.summary.pst,
        deliveryFee: cart.summary.deliveryFee,
        deliveryFeeDiscount: cart.summary.deliveryFeeDiscount,
        platformFee: cart.summary.platformFee,
        total: cart.summary.total,
        finalTotal: cart.summary.finalTotal,
        commissionRate: cart.summary.commissionRate,
        lulocartAmount: cart.summary.lulocartAmount,
        storeAmount: cart.summary.storeAmount,
      });

      // 2. Build order data with PENDING status (paymentStatus: "pending")
      const orderData = buildEnhancedOrderData(
        orderId,
        cart,
        formData,
        { uid: currentUser?.uid || '', email: currentUser?.email },
        locale,
        storeReceiptInfo,
        undefined, // No paymentIntentId yet
        OrderStatus.PENDING, // Backend expects "pending", paymentStatus: "pending"
        estimatedDistance // Distance from delivery fee calculation
      );

      console.log('📦 Creating order in Firestore FIRST (before payment intent)...');

      // 3. Create order in Firestore FIRST
      await createOrder.mutateAsync({ orderId, orderData });
      console.log('✅ Order created in Firestore with status: pending, paymentStatus: pending');

      // 4. Create payment intent
      console.log('🔄 Now creating payment intent...');
      const result = await createPaymentIntent.mutateAsync({
        amount: cart.summary.finalTotal,
        currency: 'cad',
        storeId: cart.storeId,
        orderId: orderId,
        storeStripeAccountId: stripeAccount.stripeAccountId,
        // Payment split amounts (for backend validation)
        lulocartAmount: cart.summary.lulocartAmount,  // commission + delivery + platform
        storeAmount: cart.summary.storeAmount,        // (subtotal × 0.94) + tax
        orderData: {
          storeName: cart.storeName,
          customerEmail: formData.customerInfo.email,
          customerName: formData.customerInfo.name,
          customerPhone: formData.customerInfo.phone,
          subtotal: cart.summary.subtotal,
          tax: cart.summary.tax,
          deliveryFee: cart.summary.deliveryFee,
          platformFee: cart.summary.platformFee,
          // Backend validates total = subtotal + tax + deliveryFee + platformFee
          total: cart.summary.finalTotal,
          finalTotal: cart.summary.finalTotal,
          // Payment split fields for Stripe Connect
          commissionRate: cart.summary.commissionRate,
          commissionAmount: cart.summary.commissionAmount,
          storeAmount: cart.summary.storeAmount,
          lulocartAmount: cart.summary.lulocartAmount,
          isDelivery: formData.isDelivery,
          orderNotes: formData.orderNotes || '',
          itemCount: cart.summary.itemCount,
          items: cart.items.map(item => ({
            id: item.id,
            productId: item.product.id,
            name: item.product.name,
            price: item.priceAtTime,
            quantity: item.quantity,
          })),
          deliveryAddress: {
            street: formData.deliveryAddress.street,
            city: formData.deliveryAddress.city,
            province: formData.deliveryAddress.province,
            postalCode: formData.deliveryAddress.postalCode,
            country: formData.deliveryAddress.country
          }
        }
      });

      // 5. Update order with paymentId
      console.log('📝 Updating order with payment intent ID...');
      await updateOrder.mutateAsync({
        orderId,
        updates: { paymentId: result.paymentIntentId }
      });
      console.log('✅ Order updated with paymentId:', result.paymentIntentId);

      // Notify parent component
      onPaymentIntentCreated(result.clientSecret, result.paymentIntentId, orderId);
    } catch (error) {
      console.error('Error in payment flow:', error);
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to initialize payment. Please try again.';
      onError(errorMessage);

      // If we have a pending order that failed, we could update its status
      // But for now, orders with paymentStatus: "pending" will be cleaned up by backend
      throw error;
    } finally {
      setIsCreatingPaymentIntent(false);
    }
  }, [
    cart,
    formData,
    currentUser,
    locale,
    storeReceiptInfo,
    estimatedDistance,
    stripeAccount,
    createOrder,
    updateOrder,
    createPaymentIntent,
    onPaymentIntentCreated,
    onError
  ]);

  return {
    proceedToPayment,
    isCreatingPaymentIntent,
    pendingOrderId,
    isStripeReady: !!stripeAccount?.stripeAccountId && stripeAccount?.stripeEnabled === true
  };
};
