/**
 * Admin API - Operations for admin dashboard
 * Includes Stripe account management and order cleanup for admins
 */

import { getAuth } from 'firebase/auth';

const isProduction = import.meta.env.VITE_ENV === 'production';
const CLOUD_FUNCTIONS_BASE = isProduction
  ? 'https://us-central1-lulocart-prod.cloudfunctions.net'
  : 'https://us-central1-lulop-eds249.cloudfunctions.net';

// ============================================================================
// Types - Stripe Account Management
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

export interface DeleteOrphanStripeAccountRequest {
  accountId: string;
  adminUserId: string;
}

export interface DeleteOrphanStripeAccountResponse {
  success: boolean;
  error?: string;
}

// ============================================================================
// Types - Orphan Order Cleanup
// ============================================================================

export interface OrphanOrderCleanupOptions {
  skipGracePeriod?: boolean;
  gracePeriodMinutes?: number;
}

export interface OrphanOrderCleanupMetrics {
  processed: number;
  deleted: number;
  fixed: number;
  failed: number;
  skipped: number;
  errorCount: number;
}

export interface OrphanOrderCleanupResult {
  success: boolean;
  message?: string;
  metrics?: OrphanOrderCleanupMetrics;
  errors?: Array<{ orderId: string; error: string }>;
  error?: string;
}

// ============================================================================
// API Functions - Stripe Account Management
// ============================================================================

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

// ============================================================================
// API Functions - Orphan Order Cleanup
// ============================================================================

/**
 * Trigger orphan order cleanup (admin only)
 * Removes abandoned checkout orders that never completed payment
 *
 * @param options - Cleanup options
 * @param options.skipGracePeriod - If true, process all pending orders immediately
 * @param options.gracePeriodMinutes - Custom grace period in minutes (default: 60)
 */
export async function triggerOrphanOrderCleanup(
  options: OrphanOrderCleanupOptions = {}
): Promise<OrphanOrderCleanupResult> {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    return {
      success: false,
      error: 'User must be authenticated',
    };
  }

  try {
    // Force token refresh to ensure valid authentication
    const idToken = await user.getIdToken(true);

    // Create AbortController for timeout (2 minutes for cleanup operations)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    const url = `${CLOUD_FUNCTIONS_BASE}/triggerOrphanCleanup`;
    console.log('🧹 Triggering orphan cleanup:', url, options);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    console.log('🧹 Cleanup response status:', response.status);

    // Handle authentication errors specifically
    if (response.status === 401 || response.status === 403) {
      return {
        success: false,
        error: 'Authentication failed. Please log in again.',
      };
    }

    const result = await response.json();
    console.log('🧹 Cleanup response body:', result);

    // Validate response structure
    if (!result || typeof result !== 'object') {
      return {
        success: false,
        error: 'Invalid response from server',
      };
    }

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Cleanup failed',
      };
    }

    // Validate metrics if present
    if (result.success && result.metrics) {
      const { processed, deleted, fixed, failed, skipped, errorCount } = result.metrics;
      if (
        typeof processed !== 'number' ||
        typeof deleted !== 'number' ||
        typeof fixed !== 'number' ||
        typeof failed !== 'number'
      ) {
        return {
          success: false,
          error: 'Invalid metrics format from server',
        };
      }
      // Ensure all metric fields have default values
      result.metrics = {
        processed,
        deleted,
        fixed,
        failed,
        skipped: skipped ?? 0,
        errorCount: errorCount ?? 0,
      };
    }

    return result as OrphanOrderCleanupResult;
  } catch (error) {
    console.error('Error triggering orphan order cleanup:', error);

    // Handle timeout/abort errors
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        error: 'Request timed out. The cleanup may still be running on the server.',
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}
