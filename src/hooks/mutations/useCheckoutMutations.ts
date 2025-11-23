/**
 * TanStack Query mutations for checkout operations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, addDoc, setDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { queryKeys } from '../queries/queryKeys';

/**
 * Failed order data structure
 */
interface FailedOrderData {
  orderId: string;
  userId: string;
  storeId: string;
  error: string;
  paymentIntentId?: string;
  createdAt: Date;
  orderData: any;
}

/**
 * Payment intent request data
 */
interface CreatePaymentIntentRequest {
  amount: number;
  currency: string;
  storeId: string;
  orderId: string;
  stripeAccountId: string;
  platformFeeAmount: number;
  orderData: any;
}

/**
 * Payment intent response
 */
interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

/**
 * Order data for creation
 */
interface CreateOrderData {
  orderId: string;
  orderData: any;
}

/**
 * Hook to manage checkout mutations
 *
 * @returns Mutation functions for checkout operations
 */
export const useCheckoutMutations = () => {
  const queryClient = useQueryClient();

  /**
   * Mutation to create an order document
   */
  const createOrder = useMutation({
    mutationFn: async ({ orderId, orderData }: CreateOrderData) => {
      await setDoc(doc(db, 'orders', orderId), orderData);
      return orderId;
    },
    onSuccess: (orderId) => {
      // Invalidate order queries
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      // Start monitoring this order
      queryClient.invalidateQueries({ queryKey: queryKeys.checkout.orderMonitoring(orderId) });
    },
    onError: (error) => {
      console.error('Error creating order:', error);
    }
  });

  /**
   * Mutation to record a failed order
   */
  const recordFailedOrder = useMutation({
    mutationFn: async (failedOrderData: FailedOrderData) => {
      const docRef = await addDoc(collection(db, 'failed_orders'), failedOrderData);
      return docRef.id;
    },
    onError: (error) => {
      console.error('Error recording failed order:', error);
    }
  });

  /**
   * Mutation to create a payment intent via Cloud Function
   */
  const createPaymentIntent = useMutation({
    mutationFn: async (request: CreatePaymentIntentRequest): Promise<CreatePaymentIntentResponse> => {
      const paymentIntentEndpoint = import.meta.env.VITE_PAYMENT_INTENT_ENDPOINT ||
        'https://createpaymentintent-6v2n7ecudq-uc.a.run.app';

      console.log('🔄 Creating payment intent...', {
        endpoint: paymentIntentEndpoint,
        amount: request.amount,
        orderId: request.orderId
      });

      const response = await fetch(paymentIntentEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(request.amount * 100), // Convert to cents
          currency: request.currency,
          storeId: request.storeId,
          orderId: request.orderId,
          stripeAccountId: request.stripeAccountId,
          platformFeeAmount: Math.round(request.platformFeeAmount * 100), // Convert to cents
          orderData: request.orderData
        }),
      });

      console.log('📡 Payment intent response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Payment intent error:', errorData);
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      const data = await response.json();
      console.log('✅ Payment intent created:', data);

      // Backend returns { data: { clientSecret, paymentIntentId } }
      const responseData = data.data || data;

      return {
        clientSecret: responseData.clientSecret,
        paymentIntentId: responseData.paymentIntentId
      };
    },
    onError: (error) => {
      console.error('❌ Error creating payment intent:', error);
    }
  });

  return {
    createOrder,
    recordFailedOrder,
    createPaymentIntent,
    isCreatingOrder: createOrder.isPending,
    isRecordingFailedOrder: recordFailedOrder.isPending,
    isCreatingPaymentIntent: createPaymentIntent.isPending,
  };
};
