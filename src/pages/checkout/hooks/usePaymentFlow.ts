/**
 * Custom hook for managing payment flow
 * Handles payment intent creation, success, and failure
 */

import { useState, useCallback } from 'react';
import { useCheckoutMutations } from '../../../hooks/mutations/useCheckoutMutations';
import { useStoreStripeAccountQuery } from '../../../hooks/queries/useStoreStripeAccountQuery';
import { generateOrderId } from '../../../utils/orderUtils';
import { PLATFORM_FEE_PERCENTAGE } from '../utils/constants';

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
  };
  isDelivery: boolean;
  orderNotes: string;
  deliveryDate: string;
}

/**
 * Hook options
 */
interface UsePaymentFlowOptions {
  cart: Cart;
  formData: PaymentFormData;
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
  onPaymentIntentCreated,
  onError
}: UsePaymentFlowOptions) => {
  const [isCreatingPaymentIntent, setIsCreatingPaymentIntent] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

  const { createPaymentIntent } = useCheckoutMutations();
  const { data: stripeAccount } = useStoreStripeAccountQuery({
    storeId: cart.storeId,
    enabled: !!cart.storeId
  });

  /**
   * Create payment intent and proceed to payment step
   */
  const proceedToPayment = useCallback(async () => {
    console.log('💳 proceedToPayment called');
    setIsCreatingPaymentIntent(true);

    try {
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

      // Generate order ID that will be used for both payment intent and Firestore
      const orderId = generateOrderId();
      console.log('📝 Generated order ID:', orderId);
      setPendingOrderId(orderId);

      // Calculate platform fee
      const totalApplicationFee = cart.summary.platformFee + (cart.summary.subtotal * PLATFORM_FEE_PERCENTAGE);

      // Create payment intent
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

      // Notify parent component
      onPaymentIntentCreated(result.clientSecret, result.paymentIntentId, orderId);
    } catch (error) {
      console.error('Error creating payment intent:', error);
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to initialize payment. Please try again.';
      onError(errorMessage);
      // Re-throw so callers can also handle the error
      throw error;
    } finally {
      setIsCreatingPaymentIntent(false);
    }
  }, [
    cart,
    formData,
    stripeAccount,
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
