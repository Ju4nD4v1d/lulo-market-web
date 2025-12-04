/**
 * TanStack Query mutations for checkout operations
 * Uses orderApi for order creation
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../queries';
import * as orderApi from '../../services/api/orderApi';
import { Order } from '../../types/order';

/**
 * Payment intent request data (aligned with backend validation format)
 */
interface CreatePaymentIntentRequest {
  amount: number;
  currency: string;
  storeId: string;
  orderId: string;
  storeStripeAccountId: string;
  // Payment split amounts for backend validation
  lulocartAmount: number;   // commission + deliveryFee + platformFee
  storeAmount: number;      // (subtotal × 0.94) + tax
  orderData: {
    storeName: string;
    customerEmail: string;
    customerName: string;
    customerPhone: string;
    subtotal: number;
    tax: number;
    deliveryFee: number;
    platformFee: number;
    total: number;
    finalTotal: number;
    commissionRate: number;
    commissionAmount: number;
    storeAmount: number;
    lulocartAmount: number;
    isDelivery: boolean;
    orderNotes: string;
    itemCount: number;
    items: Array<{
      id: string;
      productId: string;
      name: string;
      price: number;
      quantity: number;
    }>;
    deliveryAddress: {
      street: string;
      city: string;
      province: string;
      postalCode: string;
      country: string;
    };
  };
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
  orderData: unknown;
}

/**
 * Order update data
 */
interface UpdateOrderData {
  orderId: string;
  updates: Partial<Order>;
}

/**
 * Hook to manage checkout mutations
 */
export const useCheckoutMutations = () => {
  const queryClient = useQueryClient();

  /**
   * Mutation to create an order document with specific ID
   */
  const createOrder = useMutation({
    mutationFn: async ({ orderId, orderData }: CreateOrderData) => {
      return orderApi.createOrderWithId(orderId, orderData);
    },
    onSuccess: (orderId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.checkout.orderMonitoring(orderId) });
    },
    onError: (error) => {
      console.error('Error creating order:', error);
    }
  });

  /**
   * Mutation to update an existing order
   */
  const updateOrder = useMutation({
    mutationFn: async ({ orderId, updates }: UpdateOrderData) => {
      return orderApi.updateOrder(orderId, updates);
    },
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.checkout.orderMonitoring(orderId) });
    },
    onError: (error) => {
      console.error('Error updating order:', error);
    }
  });

  /**
   * Mutation to record a failed order
   */
  const recordFailedOrder = useMutation({
    mutationFn: async (failedOrderData: orderApi.FailedOrderData) => {
      return orderApi.recordFailedOrder(failedOrderData);
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
          // Core payment info
          orderId: request.orderId,
          storeId: request.storeId,
          storeStripeAccountId: request.storeStripeAccountId,
          amount: request.amount,                   // Total amount to charge (finalTotal in dollars)
          currency: request.currency,
          // Payment split amounts (for backend validation)
          lulocartAmount: request.lulocartAmount,   // In dollars, backend converts to cents
          storeAmount: request.storeAmount,         // In dollars, backend converts to cents
          // Order details with commission breakdown
          orderData: request.orderData
        }),
      });

      console.log('📡 Payment intent response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Payment intent error:', errorData);

        // Handle fee validation errors (HTTP 400)
        if (response.status === 400 && errorData.code === 'FEE_VALIDATION_FAILED') {
          console.error('❌ Fee validation failed:', errorData.validationErrors);
          // Log validation details for debugging
          errorData.validationErrors?.forEach((err: { field: string; expected: number; received: number; message: string }) => {
            console.error(`  - ${err.field}: expected ${err.expected}, got ${err.received}`);
          });
          throw new Error('Payment processing error. Please refresh and try again.');
        }

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
    updateOrder,
    recordFailedOrder,
    createPaymentIntent,
    isCreatingOrder: createOrder.isPending,
    isUpdatingOrder: updateOrder.isPending,
    isRecordingFailedOrder: recordFailedOrder.isPending,
    isCreatingPaymentIntent: createPaymentIntent.isPending,
  };
};
