/**
 * Order data builder utilities for checkout
 * Constructs enhanced order objects with all receipt and tracking fields
 */

import { serverTimestamp } from 'firebase/firestore';
import { OrderStatus } from '../../../types/order';
import { generateReceiptNumber, calculateTaxBreakdown } from '../../../utils/orderUtils';

/**
 * Store information for receipts
 */
export interface StoreReceiptInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  logo: string;
  website: string;
  businessNumber: string;
}

/**
 * Customer information
 */
export interface CustomerInfoData {
  name: string;
  email: string;
  phone: string;
}

/**
 * Delivery address
 */
export interface DeliveryAddressData {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  deliveryInstructions: string;
}

/**
 * Form data interface for order building
 */
export interface CheckoutFormData {
  customerInfo: CustomerInfoData;
  deliveryAddress: DeliveryAddressData;
  orderNotes: string;
  isDelivery: boolean;
  deliveryDate: string;
  deliveryTimeWindow?: { // Time slots from store schedule
    open: string;
    close: string;
  };
  useProfileAsDeliveryContact: boolean;
  customerNotes?: string;
  specialRequests?: string;
  preferredDeliveryTime?: string;
  promotionalCodes?: string[];
  tipAmount?: number;
  accessInstructions?: string;
}

/**
 * Cart item structure
 */
export interface CartItemData {
  id: string;
  product: {
    id: string;
    name: string;
    description?: string;
    images?: string[];
  };
  quantity: number;
  priceAtTime: number;
  specialInstructions?: string;
  itemModifications?: string[];
  itemNotes?: string;
}

/**
 * Cart summary structure
 */
export interface CartSummaryData {
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  platformFee: number;
  finalTotal: number;
  itemCount: number;
  discountAmount?: number;
}

/**
 * Cart data structure
 */
export interface CartData {
  storeId: string;
  storeName: string;
  items: CartItemData[];
  summary: CartSummaryData;
}

/**
 * Current user data
 */
export interface CurrentUserData {
  uid: string;
  email?: string;
}

/**
 * Build enhanced order data with all receipt and tracking fields
 *
 * @param orderId Order ID (generated or provided)
 * @param cart Cart data
 * @param formData Checkout form data
 * @param currentUser Current user data
 * @param locale User's language locale
 * @param storeInfo Store information for receipt
 * @param paymentIntentId Optional Stripe payment intent ID
 * @param orderStatus Order status (defaults to PENDING)
 * @param estimatedDistance Optional estimated distance in km (from delivery fee calculation)
 * @returns Complete order data object
 */
export const buildEnhancedOrderData = (
  orderId: string,
  cart: CartData,
  formData: CheckoutFormData,
  currentUser: CurrentUserData,
  locale: string,
  storeInfo: StoreReceiptInfo,
  paymentIntentId?: string,
  orderStatus: OrderStatus = OrderStatus.PENDING_PAYMENT,
  estimatedDistance?: number | null
) => {
  // Calculate tax breakdown
  const taxBreakdown = calculateTaxBreakdown(cart.summary.subtotal, formData.deliveryAddress.province);

  // Generate receipt number
  const receiptNumber = generateReceiptNumber(orderId);

  const now = new Date();
  const orderPlacedAt = now;

  // Parse delivery date in LOCAL timezone (not UTC)
  // new Date("2025-12-06") creates midnight UTC which shows as wrong day in local timezone
  // Instead, parse components and construct date in local time
  const [year, month, day] = formData.deliveryDate.split('-').map(Number);
  const deliveryDateLocal = new Date(year, month - 1, day); // months are 0-indexed

  const preferredDeliveryTime = formData.preferredDeliveryTime
    ? new Date(`${formData.deliveryDate}T${formData.preferredDeliveryTime}`)
    : deliveryDateLocal;

  return {
    id: orderId,
    userId: currentUser?.uid || '',
    storeId: cart.storeId || '',
    storeName: cart.storeName || '',
    customerInfo: {
      name: formData.customerInfo.name || '',
      email: formData.customerInfo.email || '',
      phone: formData.customerInfo.phone || ''
    },
    deliveryAddress: {
      street: formData.deliveryAddress.street || '',
      city: formData.deliveryAddress.city || '',
      province: formData.deliveryAddress.province || '',
      postalCode: formData.deliveryAddress.postalCode || '',
      country: formData.deliveryAddress.country || 'Canada',
      deliveryInstructions: formData.deliveryAddress.deliveryInstructions || '',
      accessInstructions: formData.accessInstructions || '',
      deliveryZone: formData.deliveryAddress.city || '',
      estimatedDistance: estimatedDistance ?? 0
    },
    items: cart.items.map((item: CartItemData) => ({
      id: item.id || '',
      productId: item.product.id || '',
      productName: item.product.name || '',
      productDescription: item.product.description || '',
      productImage: item.product.images?.[0] || '',
      productImageUrl: item.product.images?.[0] || '',
      price: item.priceAtTime || 0,
      quantity: item.quantity || 1,
      specialInstructions: item.specialInstructions || '',
      itemModifications: item.itemModifications || [],
      itemNotes: item.itemNotes || ''
    })),
    summary: {
      ...cart.summary,
      storeAmount: cart.summary?.total ? cart.summary.total * 0.9 : 0,
      platformAmount: cart.summary ? cart.summary.platformFee + (cart.summary.total * 0.1) : 0,
      discountAmount: cart.summary.discountAmount || 0,
      tipAmount: formData.tipAmount || 0,
      serviceFee: 0,
      taxBreakdown
    },
    status: orderStatus,
    orderNotes: formData.orderNotes || '',

    // Enhanced: Receipt Information
    receiptNumber,
    orderType: formData.isDelivery ? 'delivery' : 'pickup',

    // Enhanced: Delivery Details
    preferredDeliveryTime,
    estimatedDeliveryTime: deliveryDateLocal,
    deliveryTimeWindow: formData.deliveryTimeWindow,
    deliveryNotes: '',
    deliveryZone: formData.deliveryAddress.city || '',

    // Enhanced: Order Experience
    customerNotes: formData.customerNotes || '',
    specialRequests: formData.specialRequests || '',
    promotionalCodes: formData.promotionalCodes || [],
    orderSource: 'web',

    // Enhanced: Store Information for Receipt
    storeInfo,

    // Enhanced: Timing Information
    orderPlacedAt,
    preparationStartedAt: null,
    readyForPickupAt: null,

    // Enhanced: Payment Details for Receipt
    paymentDetails: paymentIntentId ? {
      method: 'credit_card',
      last4Digits: '',
      cardBrand: '',
      authorizationCode: '',
      transactionId: paymentIntentId
    } : {
      method: 'cash',
      last4Digits: '',
      cardBrand: '',
      authorizationCode: '',
      transactionId: orderId
    },

    // Existing fields
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    paymentStatus: 'pending', // Always pending initially - webhook will update to 'paid'
    paymentId: paymentIntentId || null,
    isDelivery: formData.isDelivery ?? true,
    language: locale
  };
};
