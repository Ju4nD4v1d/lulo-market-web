import { loadStripe, Stripe } from '@stripe/stripe-js';
import type { Locale } from '../utils/translations';

/**
 * Stripe Environment Configuration
 *
 * Supports two modes:
 * - 'test': Uses test keys (pk_test_...) for development
 * - 'live': Uses production keys (pk_live_...) for production
 *
 * Set VITE_STRIPE_MODE to 'live' for production deployments.
 * Default is 'test' mode for safety.
 *
 * Required environment variables:
 * - VITE_STRIPE_PUBLISHABLE_KEY_TEST: Test mode publishable key
 * - VITE_STRIPE_PUBLISHABLE_KEY_LIVE: Live mode publishable key (optional until production)
 * - VITE_STRIPE_MODE: 'test' or 'live' (defaults to 'test')
 */

type StripeMode = 'test' | 'live';

// Determine the Stripe mode
const stripeMode: StripeMode = (import.meta.env.VITE_STRIPE_MODE as StripeMode) || 'test';
const isLiveMode = stripeMode === 'live';

// Get the appropriate publishable key based on mode
const getPublishableKey = (): string => {
  if (isLiveMode) {
    const liveKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY_LIVE;
    if (!liveKey) {
      console.error('[Stripe] Live mode enabled but VITE_STRIPE_PUBLISHABLE_KEY_LIVE is not set. Falling back to test mode.');
      const testKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY_TEST || import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
      if (!testKey) {
        throw new Error('No Stripe publishable key available. Please set VITE_STRIPE_PUBLISHABLE_KEY_TEST.');
      }
      return testKey;
    }
    return liveKey;
  }

  // Test mode - use test key or fallback to legacy key
  const testKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY_TEST || import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  if (!testKey) {
    throw new Error('Stripe publishable key is required. Please set VITE_STRIPE_PUBLISHABLE_KEY_TEST in your environment variables.');
  }
  return testKey;
};

const stripePublishableKey = getPublishableKey();

// Log Stripe mode in development (not in production)
if (import.meta.env.DEV) {
  console.log(`[Stripe] Mode: ${stripeMode.toUpperCase()} | Key prefix: ${stripePublishableKey.substring(0, 12)}...`);
}

// Initialize Stripe
export const getStripePromise = (locale: Locale): Promise<Stripe | null> => {
  return loadStripe(stripePublishableKey, { locale });
};

// Default export using English to maintain backward compatibility
export const stripePromise: Promise<Stripe | null> = getStripePromise('en');

// Export mode info for other components
export const STRIPE_MODE = {
  current: stripeMode,
  isLive: isLiveMode,
  isTest: !isLiveMode,
} as const;

// Platform fee configuration
// Note: This is a fallback - the actual fee is fetched from Firestore (platformFeeConfig)
export const PLATFORM_FEE = {
  FIXED_AMOUNT: 0.99, // Default $0.99 CAD - actual value comes from Firestore
};

// Stripe configuration
export const STRIPE_CONFIG = {
  publishableKey: stripePublishableKey,
  webhookEndpoint: import.meta.env.VITE_STRIPE_WEBHOOK_ENDPOINT,
  currency: 'cad',
  country: 'CA',
};

/**
 * Calculate platform fees for an order
 * Platform gets: Fixed fee only (configurable via Firestore)
 * Store gets: Remaining amount after platform fee
 *
 * @param orderTotal - The total order amount
 * @param platformFee - The platform fee amount (from Firestore config or fallback)
 */
export function calculatePlatformFees(orderTotal: number, platformFee: number = PLATFORM_FEE.FIXED_AMOUNT) {
  const totalPlatformFee = platformFee;
  const storeAmount = orderTotal - totalPlatformFee;

  return {
    orderTotal,
    fixedFee: platformFee,
    totalPlatformFee,
    storeAmount,
    // Convert to cents for Stripe
    orderTotalCents: Math.round(orderTotal * 100),
    totalPlatformFeeCents: Math.round(totalPlatformFee * 100),
    storeAmountCents: Math.round(storeAmount * 100),
  };
}

/**
 * Format amount to display in CAD
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD'
  }).format(amount);
}

/**
 * Calculate the final order total including platform fee
 * This is what the customer pays: original order total + platform fee
 * Note: Actual fee value comes from Firestore (platformFeeConfig), default $0.99 CAD
 */
export function calculateCustomerTotal(orderSubtotal: number, tax: number, deliveryFee: number) {
  const baseOrderTotal = orderSubtotal + tax + deliveryFee;
  const platformFeeForCustomer = PLATFORM_FEE.FIXED_AMOUNT; // Default $0.99, actual from Firestore
  const finalCustomerTotal = baseOrderTotal + platformFeeForCustomer;
  
  return {
    baseOrderTotal,
    platformFeeForCustomer,
    finalCustomerTotal,
    // For Stripe (in cents)
    finalCustomerTotalCents: Math.round(finalCustomerTotal * 100)
  };
}