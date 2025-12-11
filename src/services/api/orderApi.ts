/**
 * Order API - CRUD operations for orders
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  QueryConstraint,
  DocumentSnapshot,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Order, OrderStatus } from '../../types/order';
import { COLLECTIONS, safeDate } from './types';

// ============================================================================
// Types
// ============================================================================

/**
 * Failed order data for logging checkout failures
 */
export interface FailedOrderData {
  orderId: string;
  userId: string;
  storeId: string;
  error: string;
  paymentIntentId?: string;
  createdAt: Date;
  orderData: unknown;
}

// ============================================================================
// Transformations
// ============================================================================

/**
 * Helper to validate OrderStatus values
 */
const isValidOrderStatus = (status: unknown): status is OrderStatus => {
  return Object.values(OrderStatus).includes(status as OrderStatus);
};

/**
 * Transform Firestore document to Order type
 * Handles both old flat format and new nested format
 */
export const transformOrderDocument = (docSnapshot: DocumentSnapshot): Order => {
  const data = docSnapshot.data();
  if (!data) {
    throw new Error('Order document has no data');
  }

  return {
    id: docSnapshot.id,
    storeId: data.storeId || '',
    storeName: data.storeName || 'Unknown Store',

    // Customer info - handle both new nested format and old flat format
    customerInfo: {
      name: data.customerInfo?.name || data.userName || 'Unknown Customer',
      email: data.customerInfo?.email || data.userEmail || 'unknown@example.com',
      phone: data.customerInfo?.phone || data.userPhoneNumber || ''
    },

    // Delivery address - handle both new nested format and old flat format
    deliveryAddress: {
      street: data.deliveryAddress?.street || data.deliveryStreet || 'Address not available',
      city: data.deliveryAddress?.city || data.deliveryCity || 'Vancouver',
      province: data.deliveryAddress?.province || data.deliveryProvince || 'BC',
      postalCode: data.deliveryAddress?.postalCode || data.deliveryPostalCode || 'V6B 1A1',
      country: data.deliveryAddress?.country || data.deliveryCountry || 'Canada',
      deliveryInstructions: data.deliveryAddress?.deliveryInstructions || data.deliveryInstructions || ''
    },

    // Create items array - handle both new array format and old single item format
    items: data.items || [{
      id: data.productId || '1',
      productId: data.productId || '',
      productName: data.productName || 'Unknown Product',
      productImage: data.productImage || '',
      price: data.price || 0,
      quantity: data.quantity || 1,
      specialInstructions: data.specialInstructions || ''
    }],

    // Create summary from Firestore fields
    summary: {
      subtotal: data.summary?.subtotal || data.subtotal || data.totalOrderPrice || 0,
      tax: data.summary?.tax || (data.gstTax || 0) + (data.pstTax || 0),
      // GST and PST breakdown - essential for order tracking display
      gst: data.summary?.gst || 0,
      pst: data.summary?.pst || 0,
      deliveryFee: data.summary?.deliveryFee || 0,
      total: data.summary?.total || data.totalOrderPrice || 0,
      itemCount: data.summary?.itemCount || data.quantity || 1,
      // Platform fee and final total
      platformFee: data.summary?.platformFee || 0,
      finalTotal: data.summary?.finalTotal || data.summary?.total || data.totalOrderPrice || 0,
      // Payment split fields (Stripe Connect)
      storeAmount: data.summary?.storeAmount || 0,
      platformAmount: data.summary?.platformAmount || data.summary?.lulocartAmount || 0,
      commissionRate: data.summary?.commissionRate || 0,
      commissionAmount: data.summary?.commissionAmount || 0,
      lulocartAmount: data.summary?.lulocartAmount || 0,
      // Optional fields
      discountAmount: data.summary?.discountAmount,
      tipAmount: data.summary?.tipAmount,
      serviceFee: data.summary?.serviceFee,
      taxBreakdown: data.summary?.taxBreakdown,
      // New customer delivery fee discount
      ...(data.summary?.deliveryFeeDiscount && {
        deliveryFeeDiscount: data.summary.deliveryFeeDiscount,
      }),
    },

    // Order status - ensure we use valid OrderStatus enum values
    status: (() => {
      if (isValidOrderStatus(data.status)) {
        return data.status;
      }

      // Handle case where payment status was incorrectly stored in status field
      if (data.status === 'paid') {
        return OrderStatus.CONFIRMED;
      }

      // Fallback based on payment status
      // Include 'authorized' for delayed capture flow (funds held = confirmed)
      if (data.paymentStatus === 'authorized' || data.paymentStatus === 'captured' || data.paymentStatus === 'paid') {
        return OrderStatus.CONFIRMED;
      } else if (data.paymentStatus === 'processing') {
        return OrderStatus.PENDING;
      }

      return OrderStatus.PENDING;
    })(),
    orderNotes: data.orderNotes || data.notes || '',

    // Timestamps
    createdAt: safeDate(data.createdAt || data.createdDate),
    updatedAt: safeDate(data.updatedAt || data.createdDate),
    estimatedDeliveryTime: data.estimatedDeliveryTime ? safeDate(data.estimatedDeliveryTime) : undefined,
    deliveredAt: data.deliveredAt ? safeDate(data.deliveredAt) : undefined,

    // Delivery time window (time slot from store schedule)
    deliveryTimeWindow: data.deliveryTimeWindow || undefined,

    // Payment info
    paymentStatus: (() => {
      // Valid payment statuses including delayed capture statuses
      const validStatuses = [
        'pending', 'processing', 'authorized', 'captured', 'paid',
        'voided', 'expired', 'failed', 'refunded', 'canceled'
      ];
      if (data.paymentStatus && validStatuses.includes(data.paymentStatus)) {
        return data.paymentStatus;
      }
      // Backward compatibility
      if (data.status === 'paid') {
        return 'paid';
      }
      return 'pending';
    })(),
    paymentMethod: data.paymentMethod || '',
    paymentId: data.paymentId || '',

    // Delayed capture fields
    authorizedAt: data.authorizedAt ? safeDate(data.authorizedAt) : undefined,
    authorizationExpiresAt: data.authorizationExpiresAt ? safeDate(data.authorizationExpiresAt) : undefined,
    paymentCapturedAt: data.paymentCapturedAt ? safeDate(data.paymentCapturedAt) : undefined,
    paymentVoidedAt: data.paymentVoidedAt ? safeDate(data.paymentVoidedAt) : undefined,
    voidReason: data.voidReason || undefined,

    // Idempotency flags
    stockIncremented: data.stockIncremented || undefined,
    confirmationEmailSent: data.confirmationEmailSent || undefined,

    // Additional info
    isDelivery: data.isDelivery !== undefined ? data.isDelivery : true,
    language: data.language || 'en',

    // User ID for access control
    userId: data.userId || undefined,

    // Receipt fields
    receiptUrl: data.receiptUrl || undefined,
    receiptGeneratedAt: data.receiptGeneratedAt ? safeDate(data.receiptGeneratedAt) : undefined,
    receiptExpiresAt: data.receiptExpiresAt ? safeDate(data.receiptExpiresAt) : undefined,
    receiptNumber: data.receiptNumber || undefined
  };
};

// ============================================================================
// Read Operations
// ============================================================================

/**
 * Get orders with optional filters
 */
export async function getOrders(options?: {
  userId?: string;
  storeId?: string;
  status?: string;
  limitCount?: number;
}): Promise<Order[]> {
  const ordersRef = collection(db, COLLECTIONS.ORDERS);
  const constraints: QueryConstraint[] = [];

  if (options?.userId) {
    constraints.push(where('userId', '==', options.userId));
  }

  if (options?.storeId) {
    constraints.push(where('storeId', '==', options.storeId));
  }

  if (options?.status) {
    constraints.push(where('status', '==', options.status));
  }

  // Always order by creation date
  constraints.push(orderBy('createdAt', 'desc'));

  if (options?.limitCount) {
    constraints.push(limit(options.limitCount));
  }

  try {
    const q = query(ordersRef, ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map(transformOrderDocument);
  } catch (error) {
    // Fallback to simple query if compound index doesn't exist
    console.warn('Compound query failed, using simple query:', error);
    const simpleConstraints = constraints.filter((c) => (c as { type?: string }).type !== 'orderBy');
    const q = query(ordersRef, ...simpleConstraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map(transformOrderDocument);
  }
}

/**
 * Get orders by store ID
 */
export async function getOrdersByStore(storeId: string, pageSize = 50): Promise<Order[]> {
  const ordersRef = collection(db, COLLECTIONS.ORDERS);
  const q = query(
    ordersRef,
    where('storeId', '==', storeId),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map(transformOrderDocument);
}

/**
 * Get orders by user ID
 */
export async function getOrdersByUser(userId: string, pageSize = 50): Promise<Order[]> {
  const ordersRef = collection(db, COLLECTIONS.ORDERS);
  const q = query(
    ordersRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map(transformOrderDocument);
}

/**
 * Get a single order by ID
 */
export async function getOrderById(orderId: string): Promise<Order> {
  const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
  const snapshot = await getDoc(orderRef);

  if (!snapshot.exists()) {
    throw new Error(`Order with ID ${orderId} not found`);
  }

  return transformOrderDocument(snapshot);
}

// ============================================================================
// Write Operations
// ============================================================================

/**
 * Create a new order
 */
export async function createOrder(orderData: Omit<Order, 'id' | 'createdAt'>): Promise<string> {
  const ordersRef = collection(db, COLLECTIONS.ORDERS);
  const docRef = await addDoc(ordersRef, {
    ...orderData,
    createdAt: Timestamp.now(),
  });

  return docRef.id;
}

/**
 * Update an existing order
 */
export async function updateOrder(orderId: string, updates: Partial<Order>): Promise<void> {
  const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
  await updateDoc(orderRef, updates);
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
  const updateData: Record<string, unknown> = {
    status,
    updatedAt: Timestamp.now(),
  };

  if (status === OrderStatus.DELIVERED) {
    updateData.deliveredAt = Timestamp.now();
  }

  await updateDoc(orderRef, updateData);
}

/**
 * Create an order with a specific ID (used by checkout flow)
 */
export async function createOrderWithId(orderId: string, orderData: unknown): Promise<string> {
  const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
  await setDoc(orderRef, orderData);
  return orderId;
}

/**
 * Record a failed order for logging/debugging
 */
export async function recordFailedOrder(failedOrderData: FailedOrderData): Promise<string> {
  const failedOrdersRef = collection(db, 'failed_orders');
  const docRef = await addDoc(failedOrdersRef, failedOrderData);
  return docRef.id;
}

// ============================================================================
// Real-time Subscriptions
// ============================================================================

/**
 * Subscribe to real-time updates for a specific order
 * Used during checkout to monitor payment status
 */
export function subscribeToOrder(
  orderId: string,
  onUpdate: (order: Order) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);

  return onSnapshot(
    orderRef,
    (docSnapshot) => {
      if (docSnapshot.exists()) {
        const order = transformOrderDocument(docSnapshot);
        onUpdate(order);
      }
    },
    (error) => {
      console.error('Error listening to order status:', error);
      if (onError) {
        onError(error);
      }
    }
  );
}

/**
 * Subscribe to real-time updates for all orders of a store
 * Used for dashboard notifications
 */
export function subscribeToStoreOrders(
  storeId: string,
  onUpdate: (orders: Order[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const ordersRef = collection(db, COLLECTIONS.ORDERS);
  const q = query(
    ordersRef,
    where('storeId', '==', storeId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const orders = snapshot.docs.map(transformOrderDocument);
      onUpdate(orders);
    },
    (error) => {
      console.error('Error listening to store orders:', error);
      if (onError) {
        onError(error);
      }
    }
  );
}
