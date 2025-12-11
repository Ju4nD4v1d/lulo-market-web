/**
 * Payment API - Delayed capture operations for Stripe payments
 *
 * Flow:
 * 1. Customer pays → Funds authorized (held on card)
 * 2. Order delivered → capturePayment() called → Funds captured
 * 3. Order cancelled → voidPaymentAuthorization() called → Funds released
 */

import { auth } from '../../config/firebase';

// API endpoints - using direct Cloud Function URLs
const CAPTURE_PAYMENT_ENDPOINT =
  import.meta.env.VITE_CAPTURE_PAYMENT_ENDPOINT ||
  'https://us-central1-lulop-eds249.cloudfunctions.net/capturePayment';

const VOID_PAYMENT_ENDPOINT =
  import.meta.env.VITE_VOID_PAYMENT_ENDPOINT ||
  'https://us-central1-lulop-eds249.cloudfunctions.net/voidPaymentAuthorization';

// ============================================================================
// Types
// ============================================================================

export interface CapturePaymentRequest {
  orderId: string;
}

export interface CapturePaymentResponse {
  success: boolean;
  paymentIntentId?: string;
  amountCaptured?: number; // In cents
  error?: string;
}

export interface VoidPaymentRequest {
  orderId: string;
  reason: string;
}

export interface VoidPaymentResponse {
  success: boolean;
  error?: string;
}

// ============================================================================
// Auth Helper
// ============================================================================

/**
 * Get authorization headers with Firebase auth token
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be authenticated to perform this action');
  }

  const token = await user.getIdToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Capture an authorized payment after order delivery
 *
 * Call this when marking an order as "delivered".
 * The payment must be in "authorized" status.
 *
 * @param orderId - The order ID to capture payment for
 * @returns Capture result with payment details
 * @throws Error if the API call fails
 *
 * @example
 * ```typescript
 * const result = await capturePayment('order_123');
 * if (result.success) {
 *   console.log('Captured:', result.amountCaptured, 'cents');
 * } else {
 *   console.error('Failed:', result.error);
 * }
 * ```
 */
export async function capturePayment(orderId: string): Promise<CapturePaymentResponse> {
  console.log('🔄 Capturing payment for order:', orderId);

  try {
    const headers = await getAuthHeaders();

    const response = await fetch(CAPTURE_PAYMENT_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify({ orderId } as CapturePaymentRequest),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Capture payment failed:', data);

      // Handle specific error cases
      const errorMessage = data.error || `HTTP ${response.status}: Failed to capture payment`;

      return {
        success: false,
        error: errorMessage,
      };
    }

    console.log('✅ Payment captured successfully:', data);
    return data as CapturePaymentResponse;
  } catch (error) {
    console.error('❌ Capture payment error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error capturing payment',
    };
  }
}

/**
 * Void an authorized payment when order is cancelled
 *
 * Call this when cancelling an order that has paymentStatus: "authorized".
 * This releases the held funds back to the customer's card.
 *
 * @param orderId - The order ID to void payment for
 * @param reason - Reason for voiding (e.g., "Customer requested cancellation")
 * @returns Void result
 * @throws Error if the API call fails
 *
 * @example
 * ```typescript
 * const result = await voidPaymentAuthorization('order_123', 'Store cancelled order');
 * if (result.success) {
 *   console.log('Authorization voided');
 * } else {
 *   console.error('Failed:', result.error);
 * }
 * ```
 */
export async function voidPaymentAuthorization(
  orderId: string,
  reason: string
): Promise<VoidPaymentResponse> {
  console.log('🔄 Voiding payment authorization for order:', orderId, 'Reason:', reason);

  try {
    const headers = await getAuthHeaders();

    const response = await fetch(VOID_PAYMENT_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify({ orderId, reason } as VoidPaymentRequest),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Void authorization failed:', data);

      // Handle specific error cases
      const errorMessage = data.error || `HTTP ${response.status}: Failed to void authorization`;

      return {
        success: false,
        error: errorMessage,
      };
    }

    console.log('✅ Authorization voided successfully');
    return data as VoidPaymentResponse;
  } catch (error) {
    console.error('❌ Void authorization error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error voiding authorization',
    };
  }
}

/**
 * Check if a payment status can be captured
 */
export function canCapturePayment(paymentStatus: string): boolean {
  return paymentStatus === 'authorized';
}

/**
 * Check if a payment authorization can be voided
 */
export function canVoidPayment(paymentStatus: string): boolean {
  return paymentStatus === 'authorized';
}

/**
 * Check if authorization is expiring soon (within 24 hours)
 */
export function isAuthorizationExpiringSoon(authorizationExpiresAt?: Date): boolean {
  if (!authorizationExpiresAt) return false;

  const now = new Date();
  const expiresAt = new Date(authorizationExpiresAt);
  const hoursUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);

  return hoursUntilExpiry > 0 && hoursUntilExpiry <= 24;
}

/**
 * Check if authorization has expired
 */
export function isAuthorizationExpired(authorizationExpiresAt?: Date): boolean {
  if (!authorizationExpiresAt) return false;

  const now = new Date();
  const expiresAt = new Date(authorizationExpiresAt);

  return now > expiresAt;
}

/**
 * Get days remaining until authorization expires
 */
export function getDaysUntilAuthorizationExpires(authorizationExpiresAt?: Date): number | null {
  if (!authorizationExpiresAt) return null;

  const now = new Date();
  const expiresAt = new Date(authorizationExpiresAt);
  const msUntilExpiry = expiresAt.getTime() - now.getTime();

  if (msUntilExpiry <= 0) return 0;

  return Math.ceil(msUntilExpiry / (1000 * 60 * 60 * 24));
}
