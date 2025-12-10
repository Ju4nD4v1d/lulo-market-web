/**
 * Stripe Connect API - Operations for store payment onboarding
 */

import { auth } from '../../config/firebase';

const isProduction = import.meta.env.VITE_ENV === 'production';
const CLOUD_FUNCTIONS_BASE = isProduction
  ? 'https://us-central1-lulocart-prod.cloudfunctions.net'
  : 'https://us-central1-lulop-eds249.cloudfunctions.net';

// ============================================================================
// Types
// ============================================================================

export interface CreateConnectAccountRequest {
  storeId: string;
  storeName: string;
  ownerEmail: string;
  returnUrl: string;
  refreshUrl: string;
}

export interface CreateConnectAccountResponse {
  success: boolean;
  data?: {
    accountId: string;
    onboardingUrl: string;
  };
  error?: string;
}

export interface VerifyConnectAccountRequest {
  storeId: string;
  accountId: string;
}

export interface VerifyConnectAccountResponse {
  success: boolean;
  data?: {
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    requiresMoreInfo: boolean;
    detailsSubmitted: boolean;
  };
  error?: string;
}

export interface CreateAccountLinkRequest {
  storeId: string;
  accountId: string;
  returnUrl: string;
  refreshUrl: string;
}

export interface CreateAccountLinkResponse {
  success: boolean;
  data?: {
    url: string;
  };
  error?: string;
}

export interface CreateLoginLinkRequest {
  storeId: string;
  accountId: string;
}

export interface CreateLoginLinkResponse {
  success: boolean;
  data?: {
    url: string;
  };
  error?: string;
}

export interface GetConnectedAccountBalanceRequest {
  storeId: string;
}

export interface StripeBalanceData {
  available: number;   // Amount in cents
  pending: number;     // Amount in cents
  inTransit: number;   // Amount in cents
  currency: string;    // e.g., 'cad'
}

export interface GetConnectedAccountBalanceResponse {
  success: boolean;
  data?: StripeBalanceData;
  error?: string;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Create a new Stripe Connect account for a store and get onboarding URL
 */
export async function createStripeConnectAccount(
  request: CreateConnectAccountRequest
): Promise<CreateConnectAccountResponse> {
  try {
    const response = await fetch(`${CLOUD_FUNCTIONS_BASE}/createStripeConnectAccount`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to create Stripe Connect account',
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error('Error creating Stripe Connect account:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Verify the status of a Stripe Connect account
 */
export async function verifyStripeConnectAccount(
  request: VerifyConnectAccountRequest
): Promise<VerifyConnectAccountResponse> {
  try {
    const response = await fetch(`${CLOUD_FUNCTIONS_BASE}/verifyStripeConnectAccount`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to verify Stripe Connect account',
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error('Error verifying Stripe Connect account:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Create a new account link for an existing Stripe Connect account
 * Used when the previous link expired or user needs to complete onboarding
 */
export async function createStripeAccountLink(
  request: CreateAccountLinkRequest
): Promise<CreateAccountLinkResponse> {
  try {
    const response = await fetch(`${CLOUD_FUNCTIONS_BASE}/createStripeAccountLink`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to create account link',
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error('Error creating Stripe account link:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Create a login link for an enabled Stripe Connect account
 * Used to access the Stripe Express Dashboard for managing payouts and settings
 */
export async function createStripeLoginLink(
  request: CreateLoginLinkRequest
): Promise<CreateLoginLinkResponse> {
  try {
    const response = await fetch(`${CLOUD_FUNCTIONS_BASE}/createStripeLoginLink`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to create login link',
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error('Error creating Stripe login link:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Get the balance information for a connected Stripe account
 * Returns available balance, pending payouts, and in-transit amounts
 *
 * Requires Firebase authentication - the backend validates store ownership
 */
export async function getConnectedAccountBalance(
  request: GetConnectedAccountBalanceRequest
): Promise<GetConnectedAccountBalanceResponse> {
  try {
    // Get Firebase auth token for backend authentication
    const user = auth.currentUser;
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    const token = await user.getIdToken();

    const response = await fetch(`${CLOUD_FUNCTIONS_BASE}/getConnectedAccountBalance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to get account balance',
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error('Error getting connected account balance:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Get the return URLs for Stripe Connect onboarding
 */
export function getStripeConnectReturnUrls() {
  const baseUrl = window.location.origin;
  return {
    returnUrl: `${baseUrl}/dashboard?stripe=success`,
    refreshUrl: `${baseUrl}/dashboard?stripe=refresh`,
  };
}
