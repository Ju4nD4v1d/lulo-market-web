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
export const PLATFORM_FEE = {
  FIXED_AMOUNT: parseFloat(import.meta.env.VITE_PLATFORM_FEE_FIXED || '2.00'), // 2 CAD
  PERCENTAGE: parseFloat(import.meta.env.VITE_PLATFORM_FEE_PERCENTAGE || '0.10'), // 10%
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
 * Platform gets: Fixed fee (2 CAD) + percentage of order total (10%)
 * Store gets: Remaining amount after platform fees
 */
export function calculatePlatformFees(orderTotal: number) {
  const fixedFee = PLATFORM_FEE.FIXED_AMOUNT;
  const percentageFee = orderTotal * PLATFORM_FEE.PERCENTAGE;
  const totalPlatformFee = fixedFee + percentageFee;
  const storeAmount = orderTotal - totalPlatformFee;
  
  return {
    orderTotal,
    fixedFee,
    percentageFee,
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
 * This is what the customer pays: original order total + 2 CAD platform fee
 */
export function calculateCustomerTotal(orderSubtotal: number, tax: number, deliveryFee: number) {
  const baseOrderTotal = orderSubtotal + tax + deliveryFee;
  const platformFeeForCustomer = PLATFORM_FEE.FIXED_AMOUNT; // Customer pays 2 CAD extra
  const finalCustomerTotal = baseOrderTotal + platformFeeForCustomer;
  
  return {
    baseOrderTotal,
    platformFeeForCustomer,
    finalCustomerTotal,
    // For Stripe (in cents)
    finalCustomerTotalCents: Math.round(finalCustomerTotal * 100)
  };
}