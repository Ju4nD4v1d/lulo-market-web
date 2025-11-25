/**
 * createTemporaryOrder - Builds a temporary Order object for payment step
 *
 * This utility creates a properly typed Order object that's used during the
 * payment step. It's "temporary" because the final order is created in
 * Firestore after payment succeeds.
 *
 * Used for:
 * - Passing order details to StripePaymentForm
 * - Displaying order summary during payment
 * - Type safety throughout payment flow
 */

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

/**
 * Creates a temporary Order object for the payment step
 *
 * @param pendingOrderId - The order ID that will be used in Firestore
 * @param cart - Current shopping cart state
 * @param formData - Checkout form data
 * @param locale - Current language locale ('en' | 'es')
 * @returns Fully typed Order object with PENDING status
 *
 * @example
 * ```typescript
 * const tempOrder = createTemporaryOrder(
 *   'ORDER_123',
 *   cart,
 *   formData,
 *   'en'
 * );
 * ```
 */
export const createTemporaryOrder = (
  pendingOrderId: string,
  cart: Cart,
  formData: CheckoutFormData,
  locale: string
): Order => {
  return {
    id: pendingOrderId,
    storeId: cart.storeId || '',
    storeName: cart.storeName || '',

    // Customer information
    customerInfo: {
      name: formData.customerInfo.name,
      email: formData.customerInfo.email,
      phone: formData.customerInfo.phone
    },

    // Delivery address
    deliveryAddress: {
      street: formData.deliveryAddress.street,
      city: formData.deliveryAddress.city,
      province: formData.deliveryAddress.province,
      postalCode: formData.deliveryAddress.postalCode,
      country: formData.deliveryAddress.country || 'CA'
    },

    // Order items - map cart items to order items
    items: cart.items.map(item => ({
      id: item.id,
      productId: item.product.id,
      productName: item.product.name,
      price: item.priceAtTime,
      quantity: item.quantity,
      specialInstructions: item.specialInstructions
    })),

    // Financial summary
    summary: {
      subtotal: cart.summary.subtotal,
      tax: cart.summary.tax,
      deliveryFee: cart.summary.deliveryFee,
      total: cart.summary.total,
      platformFee: cart.summary.platformFee,
      finalTotal: cart.summary.finalTotal,
      storeAmount: cart.summary.total - cart.summary.platformFee,
      platformAmount: cart.summary.platformFee,
      itemCount: cart.summary.itemCount
    },

    // Order status and metadata
    status: OrderStatus.PENDING,
    paymentStatus: 'pending',
    isDelivery: true,
    language: locale as 'en' | 'es',
    createdAt: new Date(),
    updatedAt: new Date()
  };
};
