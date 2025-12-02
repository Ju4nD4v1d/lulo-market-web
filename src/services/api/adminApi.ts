/**
 * Admin API - Operations for admin dashboard
 * Includes Stripe account management for admins
 */

const isProduction = import.meta.env.VITE_ENV === 'production';
const CLOUD_FUNCTIONS_BASE = isProduction
  ? 'https://us-central1-lulocart-prod.cloudfunctions.net'
  : 'https://us-central1-lulop-eds249.cloudfunctions.net';

// ============================================================================
// Types
// ============================================================================

export interface DeleteStripeAccountRequest {
  storeId: string;
  accountId: string;
  adminUserId: string;
}

export interface DeleteStripeAccountResponse {
  success: boolean;
  error?: string;
}

// ============================================================================
// API Functions
// ============================================================================

export interface DeleteOrphanStripeAccountRequest {
  accountId: string;
  adminUserId: string;
}

export interface DeleteOrphanStripeAccountResponse {
  success: boolean;
  error?: string;
}

/**
 * Delete a Stripe Connect account (admin only)
 * This removes the Stripe account from the store and deletes it from Stripe
 */
export async function deleteStripeAccount(
  request: DeleteStripeAccountRequest
): Promise<DeleteStripeAccountResponse> {
  try {
    const response = await fetch(`${CLOUD_FUNCTIONS_BASE}/deleteStripeConnectAccount`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to delete Stripe account',
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting Stripe account:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Delete an orphaned Stripe Connect account (admin only)
 * For accounts not linked to any store
 */
export async function deleteOrphanStripeAccount(
  request: DeleteOrphanStripeAccountRequest
): Promise<DeleteOrphanStripeAccountResponse> {
  try {
    const response = await fetch(`${CLOUD_FUNCTIONS_BASE}/deleteOrphanStripeAccount`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to delete orphan Stripe account',
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting orphan Stripe account:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}
