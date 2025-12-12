/**
 * Order utilities for consistent ID generation and handling
 */

import { Order, OrderStatus } from '../types/order';

// ============================================================================
// Order Visibility Filters
// ============================================================================
// These functions determine which orders are visible based on user role.
//
// ORPHAN ORDERS: Orders with status='pending' AND paymentStatus='pending'
// These represent abandoned checkouts where the user never completed payment.
//
// VISIBILITY RULES:
// - Customers & Store Owners: Cannot see orphan orders (confusing/irrelevant)
// - Admins: Can see ALL orders including orphans (for cleanup/debugging)
// ============================================================================

/**
 * Checks if an order is an "orphan" (abandoned checkout).
 *
 * Orphan orders are created when:
 * - User starts checkout but closes Stripe modal
 * - Browser crashes during payment
 * - Network failure during payment processing
 *
 * These orders have: status='pending' AND paymentStatus='pending'
 */
export function isOrphanOrder(order: Order): boolean {
  return order.status === OrderStatus.PENDING && order.paymentStatus === 'pending';
}

/**
 * Determines if an order should be visible to regular users (customers and store owners).
 *
 * Hides orphan orders since they represent incomplete transactions that:
 * - Never had payment authorized
 * - Should not appear in order history
 * - Should not trigger store owner notifications
 *
 * Orders become visible once:
 * - paymentStatus changes to 'authorized', 'paid', 'captured', etc.
 * - OR status changes from 'pending' (e.g., to 'cancelled')
 *
 * @param order - The order to check
 * @returns true if the order should be visible to customers/store owners
 */
export function isOrderVisibleToUser(order: Order): boolean {
  return !isOrphanOrder(order);
}

/**
 * Filter orders for regular users (customers and store owners).
 * Removes orphan/abandoned orders from the list.
 *
 * Use in:
 * - Customer order history
 * - Store owner dashboard orders
 * - Order notifications
 *
 * @param orders - Array of orders to filter
 * @returns Orders visible to regular users (excludes orphans)
 */
export function filterOrdersForUser(orders: Order[]): Order[] {
  return orders.filter(isOrderVisibleToUser);
}

/**
 * Filter orders for admin users.
 * Admins see ALL orders including orphans for debugging and cleanup.
 *
 * Use in:
 * - Admin dashboard store orders tab
 * - Admin reports and analytics
 *
 * @param orders - Array of orders to filter
 * @returns All orders (no filtering applied)
 */
export function filterOrdersForAdmin(orders: Order[]): Order[] {
  // Admins see everything - no filtering
  return orders;
}


/**
 * Generate a consistent order ID that will be used for both:
 * - Firestore document ID (the path)  
 * - id field inside the document
 * 
 * Format: order_[timestamp]_[randomString]
 * Example: order_1753222065065_i3hwfxx7w
 */
export function generateOrderId(): string {
  const timestamp = Date.now();
  let randomString = Math.random().toString(36).substring(2, 10);
  
  // Ensure the random string is exactly 8 characters by padding with more random chars if needed
  while (randomString.length < 8) {
    randomString += Math.random().toString(36).substring(2, 3);
  }
  randomString = randomString.substring(0, 8); // Ensure it's exactly 8 characters
  
  return `order_${timestamp}_${randomString}`;
}

/**
 * Validate that an order ID follows the expected format
 */
export function isValidOrderId(orderId: string): boolean {
  const orderIdRegex = /^order_\d{13}_[a-z0-9]{6,10}$/;
  return orderIdRegex.test(orderId);
}

/**
 * Extract timestamp from order ID
 */
export function getTimestampFromOrderId(orderId: string): number | null {
  try {
    const parts = orderId.split('_');
    if (parts.length === 3 && parts[0] === 'order') {
      const timestamp = parseInt(parts[1], 10);
      return isNaN(timestamp) ? null : timestamp;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Generate a user-friendly receipt number from order ID
 * Example: order_1753222065065_i3hwfxx7w -> #2065-I3HW
 */
export function generateReceiptNumber(orderId: string): string {
  try {
    const parts = orderId.split('_');
    if (parts.length === 3 && parts[0] === 'order') {
      // Get last 4 digits of timestamp
      const timestamp = parts[1];
      const last4 = timestamp.slice(-4);

      // Get first 4 characters of random string, uppercase
      const randomPart = parts[2].substring(0, 4).toUpperCase();

      return `#${last4}-${randomPart}`;
    }

    // Fallback for non-standard order IDs
    return `#${Date.now().toString().slice(-4)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  } catch {
    return `#${Date.now().toString().slice(-4)}-XXXX`;
  }
}