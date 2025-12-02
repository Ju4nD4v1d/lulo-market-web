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
import { PLATFORM_FEE_PERCENTAGE } from '../utils/constants';
import { buildEnhancedOrderData, StoreReceiptInfo } from '../utils/orderDataBuilder';
import { OrderStatus } from '../../../types/order';

/**
 * Cart item interface
 */
interface CartItem {
  id: string;
  product: {
    id: string;
    name: string;
    images?: string[];
  };
  priceAtTime: number;
  quantity: number;
  specialInstructions?: string;
}

/**
 * Cart summary interface
 */
interface CartSummary {
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  platformFee: number;
  finalTotal: number;
  itemCount: number;
}

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
   * 2. Build order data with PENDING_PAYMENT status
   * 3. Create order in Firestore FIRST
   * 4. Create payment intent
   * 5. Update order with paymentId
   *
   * This ensures the order exists when the Stripe webhook fires.
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

      // 2. Build order data with PENDING_PAYMENT status
      const orderData = buildEnhancedOrderData(
        orderId,
        cart,
        formData,
        { uid: currentUser?.uid || '', email: currentUser?.email },
        locale,
        storeReceiptInfo,
        undefined, // No paymentIntentId yet
        OrderStatus.PENDING_PAYMENT
      );

      console.log('📦 Creating order in Firestore FIRST (before payment intent)...');

      // 3. Create order in Firestore FIRST
      await createOrder.mutateAsync({ orderId, orderData });
      console.log('✅ Order created in Firestore with status: pending_payment');

      // Calculate platform fee
      const totalApplicationFee = cart.summary.platformFee + (cart.summary.subtotal * PLATFORM_FEE_PERCENTAGE);

      // 4. Create payment intent
      console.log('🔄 Now creating payment intent...');
      const result = await createPaymentIntent.mutateAsync({
        amount: cart.summary.finalTotal,
        currency: 'cad',
        storeId: cart.storeId,
        orderId: orderId,
        stripeAccountId: stripeAccount.stripeAccountId,
        platformFeeAmount: totalApplicationFee,
        orderData: {
          storeName: cart.storeName,
          customerEmail: formData.customerInfo.email,
          customerName: formData.customerInfo.name,
          customerPhone: formData.customerInfo.phone,
          subtotal: cart.summary.subtotal,
          tax: cart.summary.tax,
          deliveryFee: cart.summary.deliveryFee,
          platformFee: cart.summary.platformFee,
          total: cart.summary.total,
          finalTotal: cart.summary.finalTotal,
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
      // But for now, orders in pending_payment status will be cleaned up by backend
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
