/**
 * useCheckoutPaymentState - Manages payment flow state in checkout
 *
 * Handles Stripe payment intent creation, order creation before payment,
 * and payment success/failure handlers. Coordinates with usePaymentFlow
 * and useOrderCreation hooks.
 */

import { useState, useMemo, useCallback } from 'react';
import { Stripe } from '@stripe/stripe-js';
import { User as FirebaseUser } from 'firebase/auth';
import { getStripePromise } from '../../../config/stripe';
import { usePaymentFlow } from './usePaymentFlow';
import { useOrderCreation } from './useOrderCreation';
import { Cart } from '../../../types/cart';
import { Order } from '../../../types/order';
import { StoreReceiptInfo } from '../../../hooks/queries/useStoreReceiptQuery';
import { CheckoutStep } from './useCheckoutWizard';

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

interface UseCheckoutPaymentStateProps {
  cart: Cart;
  formData: CheckoutFormData;
  currentUser: FirebaseUser | null;
  locale: string;
  storeReceiptInfo: StoreReceiptInfo | null;
  estimatedDistance: number | null;
  goToStep: (step: CheckoutStep) => void;
  onOrderComplete: (order: Order) => void;
  clearCart: () => void;
}

interface UseCheckoutPaymentStateReturn {
  /** Stripe client secret for payment */
  paymentClientSecret: string | null;
  /** Order ID created before payment */
  pendingOrderId: string | null;
  /** Stripe promise instance */
  stripePromise: Promise<Stripe | null> | null;
  /** Whether payment is ready (has all required data) */
  isPaymentReady: boolean;
  /** Whether payment intent is being created */
  isCreatingPaymentIntent: boolean;
  /** Handle successful payment */
  handlePaymentSuccess: (intentId: string) => Promise<void>;
  /** Handle failed payment */
  handlePaymentFailure: (intentId: string, error: string) => Promise<void>;
  /** Handle payment error */
  handlePaymentError: (error: string) => void;
  /** Proceed to payment (creates order and payment intent) */
  proceedToPayment: () => Promise<void>;
}

export function useCheckoutPaymentState({
  cart,
  formData,
  currentUser,
  locale,
  storeReceiptInfo,
  estimatedDistance,
  goToStep,
  onOrderComplete,
  clearCart,
}: UseCheckoutPaymentStateProps): UseCheckoutPaymentStateReturn {
  // Payment flow state
  const [paymentClientSecret, setPaymentClientSecret] = useState<string | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

  // Stripe promise - memoized by locale
  const stripePromise = useMemo(
    () => getStripePromise(locale === 'es' ? 'es-419' : 'en'),
    [locale]
  );

  // Order creation hook - for monitoring order status after payment
  // Note: Order is now created in usePaymentFlow BEFORE payment
  const {
    handlePaymentSuccess: handlePaymentSuccessBase,
    handlePaymentFailure: handlePaymentFailureBase,
    handlePaymentError,
  } = useOrderCreation({
    cart,
    currentUser,
    onOrderComplete,
    clearCart,
  });

  // Payment flow hook - creates order in Firestore BEFORE payment intent
  const { proceedToPayment, isCreatingPaymentIntent } = usePaymentFlow({
    cart,
    formData,
    currentUser,
    locale,
    storeReceiptInfo,
    estimatedDistance,
    onPaymentIntentCreated: (clientSecret, _intentId, orderId) => {
      setPaymentClientSecret(clientSecret);
      setPendingOrderId(orderId);
      goToStep('payment');
    },
    onError: (error) => {
      console.error('Payment flow error:', error);
    },
  });

  // Payment success handler wrapper
  // Note: Order already exists in Firestore - just start monitoring for webhook
  const handlePaymentSuccess = useCallback(
    async (intentId: string) => {
      const orderIdToUse = pendingOrderId || `fallback_${Date.now()}`;
      await handlePaymentSuccessBase(intentId, orderIdToUse);
    },
    [pendingOrderId, handlePaymentSuccessBase]
  );

  // Payment failure handler wrapper
  const handlePaymentFailure = useCallback(
    async (intentId: string, error: string) => {
      if (!pendingOrderId) {
        console.warn('No pending order ID for failed payment');
        return;
      }
      await handlePaymentFailureBase(intentId, error, pendingOrderId);
    },
    [pendingOrderId, handlePaymentFailureBase]
  );

  // Check if payment is ready (has all required data)
  const isPaymentReady = !!(paymentClientSecret && pendingOrderId && storeReceiptInfo);

  return {
    paymentClientSecret,
    pendingOrderId,
    stripePromise,
    isPaymentReady,
    isCreatingPaymentIntent,
    handlePaymentSuccess,
    handlePaymentFailure,
    handlePaymentError,
    proceedToPayment,
  };
}
